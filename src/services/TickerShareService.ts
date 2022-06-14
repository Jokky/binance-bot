export class TickerShareService {
    private tickersShare: Record<string, number> = {};

    setTickerShare(symbol: string, amount: number) {
        this.tickersShare[symbol] = amount;
    }

    getTickerShare(symbol: string): number {
        const tickerAmount = this.tickersShare[symbol]
        return tickerAmount || 0;
    }
}
