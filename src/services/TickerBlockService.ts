import { ActionType } from '@/types';

export interface TickerBlock {
    symbol: string;
    actionType: ActionType;
}

export class TickerBlockService {
    private blockList: TickerBlock[] = [];

    addTicker(tickerBlock: TickerBlock) {
        if (!this.existTicker(tickerBlock.symbol)) {
            this.blockList.push(tickerBlock);
        }
    }

    removeTicker(symbol: string) {
        if (this.existTicker(symbol)) {
            this.blockList = this.blockList.filter((item) => item.symbol !== symbol);
        }
    }

    existTicker(symbol: string) {
        return this.blockList.find((item) => item.symbol === symbol);
    }
}