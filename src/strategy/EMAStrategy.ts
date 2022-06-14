import { ema } from 'technicalindicators';
import { ActionType, IDirectionMethod, Order } from '@/types';
import { computePercent } from '@/utils';
import { log } from 'util';

export class EMAStrategy implements IDirectionMethod {
    constructor(
        private readonly period: number,
        private readonly length: number,
        private readonly percentMinDiffPrice: number,
    ) {
    }

    async execute(symbol: string, order: Order | null, values: number[]): Promise<ActionType> {
        const results = ema({
            period: this.period,
            values,
        });

        const ends = results.slice(results.length - this.length);
        const slicedEnds = ends.slice(0, ends.length - 1);

        const long = slicedEnds.every((value, index) => ends[index] + computePercent(ends[index], this.percentMinDiffPrice) < ends[index + 1]);
        const short = slicedEnds.every((value, index) => ends[index] > computePercent(ends[index], this.percentMinDiffPrice) + ends[index + 1]);

        if (long) {
            return ActionType.BUY;
        }

        if (short) {
            return ActionType.SELL;
        }

        return ActionType.HOLD;
    }
}
