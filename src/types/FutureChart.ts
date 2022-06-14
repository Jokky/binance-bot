export interface FutureChart {
    time: number;
    closeTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    quoteVolume: string;
    takerBuyBaseVolume: string;
    takerBuyQuoteVolume: string;
    trades: number;
    isFinal: boolean;
}