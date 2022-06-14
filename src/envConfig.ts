import 'dotenv/config';

export const envConfig = ({
    IS_PRODUCTION: process.env.NODE_ENV === 'production',

    SENTRY_DSN: process.env.SENTRY_DSN || null,

    API_KEY: process.env.API_KEY || null,
    API_SECRET: process.env.API_SECRET || null,

    PRINT_LOG_INTERVAL: Number(process.env.PRINT_LOG_INTERVAL || 1),

    QUEUE_SIZE: Number(process.env.QUEUE_SIZE || 5),

    TEST_AMOUNT_ACCOUNT: Number(process.env.TEST_AMOUNT_ACCOUNT || 0),

    TICKERS: process.env.TICKERS ? process.env.TICKERS.split(',') : [],
    PERCENT_MIN_PROFIT: Number(process.env.PERCENT_MIN_PROFIT || 5),
    PERCENT_OFF_DEPOSIT: Number(process.env.PERCENT_OFF_DEPOSIT || 10),
    PERCENT_STOP_LOSS: Number(process.env.PERCENT_STOP_LOSS || -5),
    PERCENT_MIN_DIFF_PRICE: Number(process.env.PERCENT_MIN_DIFF_PRICE || 0.03),
    COMMISSION: Number(process.env.COMMISSION || 0.03),
    INTERVAL: process.env.INTERVAL || '10m',
    LEVERAGE: Number(process.env.LEVERAGE || 20),

    EMA_PERIOD: Number(process.env.EMA_PERIOD || 50),
    EMA_LENGTH: Number(process.env.EMA_LENGTH || 3),

    STOCH_LIMIT_TOP: Number(process.env.STOCH_LIMIT_TOP || 80),
    STOCH_LIMIT_DOWN: Number(process.env.STOCH_LIMIT_DOWN || 20),
    STOCH_RSI_PERIOD: Number(process.env.STOCH_RSI_PERIOD || 14),
    STOCH_PERIOD: Number(process.env.STOCH_PERIOD || 14),
    STOCH_K_PERIOD: Number(process.env.STOCH_K_PERIOD || 3),
    STOCH_D_PERIOD: Number(process.env.STOCH_D_PERIOD || 3),
});
