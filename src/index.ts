import { envConfig } from '@/envConfig';
import Binance from 'node-binance-api';
import * as Sentry from '@sentry/node';
import {
    BinanceService,
    DirectionStatService,
    GetIsProfitable,
    OrderService,
    StatService,
    TickerBlockService,
    TickerShareService,
} from '@/services';
import {
    DirectionStrategy,
    EMAStrategy,
    GetProfitableLong,
    GetProfitableShort,
    OrderStrategy,
    StochRsiStrategy,
    StopStrategy,
} from '@/strategy';

(async () => {
    const {
        IS_PRODUCTION,

        SENTRY_DSN,

        API_KEY,
        API_SECRET,

        PRINT_LOG_INTERVAL,

        TICKERS,
        PERCENT_OFF_DEPOSIT,
        INTERVAL,
        PERCENT_MIN_PROFIT,
        COMMISSION,
        PERCENT_MIN_DIFF_PRICE,
        PERCENT_STOP_LOSS,
        LEVERAGE,

        EMA_PERIOD,
        EMA_LENGTH,

        STOCH_LIMIT_TOP,
        STOCH_LIMIT_DOWN,
        STOCH_RSI_PERIOD,
        STOCH_PERIOD,
        STOCH_K_PERIOD,
        STOCH_D_PERIOD,
    } = envConfig;

    if (!API_KEY) {
        throw new Error('Not exist value in API_KEY');
    }

    if (!API_SECRET) {
        throw new Error('Not exist value in API_SECRET');
    }

    if (!TICKERS.length) {
        throw new Error('Not exist value in TICKERS');
    }

    if (SENTRY_DSN) {
        Sentry.init({
            dsn: SENTRY_DSN,
            tracesSampleRate: 1.0,
        });
    }

    const binance = new Binance().options({
        APIKEY: API_KEY,
        APISECRET: API_SECRET,
        test: !IS_PRODUCTION,
        keepAlive: true,
    });

    const tickerBlockService = new TickerBlockService();
    const orderService = new OrderService();
    const getIsProfitable = new GetIsProfitable(
        COMMISSION,
        PERCENT_MIN_PROFIT,
    );
    const getProfitableShort = new GetProfitableShort(
        orderService,
        getIsProfitable,
    )
    const getProfitableLong = new GetProfitableLong(
        orderService,
        getIsProfitable,
    );
    const stopStrategy = new StopStrategy({
        percentStopLoss: PERCENT_STOP_LOSS,
    });
    const emaStrategy = new EMAStrategy(
        EMA_PERIOD,
        EMA_LENGTH,
        PERCENT_MIN_DIFF_PRICE,
    );
    const stochRsiStrategy = new StochRsiStrategy({
        limitTop: STOCH_LIMIT_TOP,
        limitDown: STOCH_LIMIT_DOWN,
        dPeriod: STOCH_D_PERIOD,
        kPeriod: STOCH_K_PERIOD,
        rsiPeriod: STOCH_RSI_PERIOD,
        stochasticPeriod: STOCH_PERIOD,
    });
    const orderStrategy = new OrderStrategy(
        orderService,
        stochRsiStrategy,
        getProfitableLong,
        getProfitableShort,
        stopStrategy,
        emaStrategy,
    );
    const directionStrategy = new DirectionStrategy(orderStrategy);
    const tickerShareService = new TickerShareService();
    const directionStatService = new DirectionStatService()
    const statService = new StatService(
        orderService,
        tickerShareService,
        tickerBlockService,
        directionStatService,
    );

    const binanceService = new BinanceService({
        tickers: TICKERS,
        leverage: LEVERAGE,
        interval: INTERVAL,
        percentOffDeposit: PERCENT_OFF_DEPOSIT,
        tickerShareService,
        orderService,
        directionStrategy,
        tickerBlockService,
        directionStatService,
        binance,
    });

    await Promise.all([
        binanceService.setTickersLeverage(TICKERS, LEVERAGE),
        binanceService.initTickers(),
        binanceService.updateAccountAmount(),
        binanceService.listenUpdateAccount(),
        binanceService.listenFuturesChart(),
    ]);

    statService.printInterval(PRINT_LOG_INTERVAL);
})();
