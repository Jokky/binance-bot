import { computePercentOf, printer } from '@/utils';
import { ActionType, OrderType } from '@/types';
import { OrderService } from './OrderService';
import { TickerShareService } from './TickerShareService';
import { TickerBlockService } from './TickerBlockService';
import { DirectionStatService } from './DirectionStatService';

export class StatService {
    constructor(
        private readonly orderService: OrderService,
        private readonly tickerShareService: TickerShareService,
        private readonly tickerBlockService: TickerBlockService,
        private readonly directionStatService: DirectionStatService,
    ) {
    }

    print() {
        const ordersAmount = this.orderService.getOrdersAmount();
        const entries = Object.entries(ordersAmount);

        const tickers = entries.reduce((prev, [symbol, amount]) => {
            const order = this.orderService.getOrder(symbol);
            const orderType = order?.type ?? OrderType.HOLD;
            const orderPrice = order?.price || 0;
            const tickerShare = this.tickerShareService.getTickerShare(symbol);

            let percentProfit = 0;

            if (order) {
                if (order.type === OrderType.LONG) {
                    percentProfit = computePercentOf(tickerShare - order.price, order.price);
                }
                if (order.type === OrderType.SHORT) {
                    percentProfit = computePercentOf(order.price - tickerShare, tickerShare);
                }
            }

            return [
                ...prev,
                [
                    symbol,
                    orderType.toUpperCase(),
                    ActionType[this.directionStatService.getDirection(symbol)],
                    `${tickerShare || null}`,
                    String(orderPrice),
                    String(percentProfit.toFixed(3)),
                    String(amount.toFixed(2)),
                    String(Boolean(this.tickerBlockService.existTicker(symbol))),
                ]
            ]
        }, []);

        printer()
            .writeLine(`ACCOUNT: ${this.orderService.getAccountAmount()}`)
            .table([
                ['Symbol', 'Type', 'Direction', 'Current price', 'Order price', 'Profit, %', 'Total amount', 'is blocked'],
                ...tickers,
            ])
            .end();
    }

    printInterval(interval: number) {
        setInterval(() => {
            this.print();
        }, interval * 1000);
    }
}
