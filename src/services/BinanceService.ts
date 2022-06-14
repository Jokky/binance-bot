import Binance from 'node-binance-api';
import { OrderService } from './OrderService';
import { ActionType, FutureChart, FuturePositionRisk, MapActionTypeToOrderType, Order, OrderType } from '@/types';
import { computePercent, getRandomId, noop } from '@/utils';
import { DirectionStrategy } from '@/strategy';
import { TickerShareService } from './TickerShareService';
import { TickerBlockService } from './TickerBlockService';
import { DirectionStatService } from './DirectionStatService';

export interface BinanceServiceOptions {
    tickers: string[];
    leverage: number;
    interval: string;
    percentOffDeposit: number;
    orderService: OrderService;
    tickerShareService: TickerShareService;
    tickerBlockService: TickerBlockService;
    directionStatService: DirectionStatService;
    directionStrategy: DirectionStrategy;
    binance: Binance;
}

export class BinanceService {
    private readonly tickers: string[];
    private readonly leverage: number;
    private readonly interval: string;
    private readonly percentOffDeposit: number;
    private readonly orderService: OrderService;
    private readonly tickerShareService: TickerShareService;
    private readonly tickerBlockService: TickerBlockService;
    private readonly directionStatService: DirectionStatService;
    private readonly directionStrategy: DirectionStrategy;
    private readonly binance: Binance;

    constructor({
        tickers,
        interval,
        leverage,
        percentOffDeposit,
        orderService,
        tickerShareService,
        directionStrategy,
        tickerBlockService,
        directionStatService,
        binance,
    }: BinanceServiceOptions) {
        this.tickers = tickers;
        this.interval = interval;
        this.leverage = leverage;
        this.directionStrategy = directionStrategy;
        this.orderService = orderService;
        this.tickerShareService = tickerShareService;
        this.percentOffDeposit = percentOffDeposit;
        this.tickerBlockService = tickerBlockService;
        this.directionStatService = directionStatService;
        this.binance = binance;
    }

    async initTickers() {
        this.tickers.map((ticker) => this.orderService.setEmptyOrders(ticker));
        const futures = await this.futuresPositionRisk();
        futures
            .filter(value => Number(value.entryPrice) > 0 && this.tickers.includes(value.symbol))
            .map((value) => {
                this.orderService.setOrder({
                    id: getRandomId(),
                    symbol: value.symbol,
                    price: Number(value.entryPrice),
                    count: Number(value.positionAmt),
                    leverage: Number(value.leverage),
                    isPending: false,
                    type: Number(value.positionAmt) > 0 ? OrderType.LONG : OrderType.SHORT,
                });
            });
    }

    async getAccountAmount(): Promise<number> {
        const futuresAccount = await this.binance.futuresAccount();

        if (!futuresAccount.assets) {
            return 0;
        }

        const asset = futuresAccount.assets.find((asset) => Number(asset.walletBalance) && asset.asset === 'USDT');
        return Number(asset.maxWithdrawAmount);
    }

    async setTickersLeverage(tickers: string[], leverage: number) {
        await Promise.all(tickers.map((ticker) => this.binance.futuresLeverage(ticker, leverage)));
    }

    // TODO: при каждой сделке будет происходить полное обновление.
    //  Необходимо сделать обновление только из ответа
    async listenUpdateAccount() {
        this.binance.websockets.userFutureData(
            noop,
            async () => {
                await this.initTickers();
                await this.updateAccountAmount();
            },
            async () => {
                await this.initTickers();
                await this.updateAccountAmount();
            },
            noop,
        )
    }

    async listenFuturesChart() {
        this.tickers.map((ticker) => this.binance.futuresChart(ticker, this.interval, async (symbol: string, interval: string, futuresChart: Record<string, FutureChart>) => {
            const values = Object.values(futuresChart).map((futureChart) => Number(futureChart.close));
            const price = values[values.length - 1];
            this.tickerShareService.setTickerShare(symbol, price);

            const existOrder = this.orderService.getOrder(symbol);
            const strategyDirection = await this.directionStrategy.execute(symbol, existOrder, values);
            const count = Number((computePercent(this.orderService.getAccountAmount(), this.percentOffDeposit) / price).toFixed(1));
            const blockedTicker = this.tickerBlockService.existTicker(symbol);
            this.directionStatService.setDirection(symbol, strategyDirection);

            if (
                !existOrder
                && blockedTicker
                && blockedTicker.actionType !== strategyDirection
            ) {
                this.tickerBlockService.removeTicker(symbol);
            }

            if (
                !existOrder
                && !this.tickerBlockService.existTicker(symbol)
            ) {
                const tempOrder: Order = {
                    id: getRandomId(),
                    price,
                    count: count * this.leverage,
                    symbol,
                    leverage: this.leverage,
                    isPending: false,
                    type: MapActionTypeToOrderType[strategyDirection],
                };

                if (ActionType.BUY === strategyDirection) {
                    await this.tickerBuy(tempOrder);
                }

                if (ActionType.SELL === strategyDirection) {
                    await this.tickerSell(tempOrder);
                }
            }

            if (
                existOrder
                && !existOrder.isPending
            ) {
                if (ActionType.BUY === strategyDirection) {
                    if (existOrder.price <= price) {
                        this.tickerBlockService.addTicker({
                            symbol,
                            actionType: ActionType.BUY,
                        });
                    }

                    await this.tickerBuy({
                        ...existOrder,
                        price,
                    });
                }

                if (ActionType.SELL === strategyDirection) {
                    if (existOrder.price >= price) {
                        this.tickerBlockService.addTicker({
                            symbol,
                            actionType: ActionType.SELL,
                        });
                    }

                    await this.tickerSell(existOrder);
                }
            }
        }));
    }

    async tickerBuy(order: Order) {
        this.setPendingOrder(order, true);
        await this.binance.futuresMarketBuy(order.symbol, Math.abs(order.count));
        this.setPendingOrder(order, false);
        await this.initTickers();
        await this.updateAccountAmount();
    }

    async tickerSell(order: Order) {
        this.setPendingOrder(order, true);
        await this.binance.futuresMarketSell(order.symbol, Math.abs(order.count));
        this.setPendingOrder(order, false);
        await this.initTickers();
        await this.updateAccountAmount();
    }

    setPendingOrder(order: Order, isPending = false) {
        order.isPending = isPending;

        if (!this.orderService.getOrder(order.symbol)) {
            this.orderService.setOrder({
                ...order,
            });
        }
    }

    async updateAccountAmount() {
        const amount = await this.getAccountAmount();
        this.orderService.setAccountAmount(amount);
    }

    async futuresPositionRisk(): Promise<FuturePositionRisk[]> {
        return this.binance.futuresPositionRisk();
    }

    async futuresPositionRiskBySymbol(symbol: string) {
        const response: FuturePositionRisk[] = await this.futuresPositionRisk();
        return response.find((asset) => asset.symbol === symbol);
    }
}
