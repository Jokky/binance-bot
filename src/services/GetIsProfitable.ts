import { computePercent } from '@/utils';

export class GetIsProfitable {
    constructor(
        private readonly commission: number,
        private readonly percentMinProfit: number,
    ) {
    }

    execute(value1: number, value2: number): boolean {
        if (value1 > value2) {
            return false;
        }

        const valueProfit = value1 + computePercent(value1 + computePercent(value1, this.commission), this.percentMinProfit);

        return valueProfit <= value2;
    }
}
