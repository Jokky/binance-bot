import { ActionType } from '@/types';

export interface GetDirectionOptions {
    queueSize: number;
}

/**
 * Расчет покупки/продажи от цен
 */
export class GetDirection {
    constructor(
        private readonly options: GetDirectionOptions,
    ) {
    }

    async execute(values: (number | null)[]): Promise<ActionType> {
        if (!values.length || values.length < this.options.queueSize) {
            return ActionType.HOLD;
        }

        const [first, second, third] = values.slice(values.length - this.options.queueSize, values.length);

        if (!first || !second || !third) {
            return ActionType.HOLD;
        }

        if (first >= second && third > second) {
            return ActionType.BUY;
        }

        if (first <= second && third < second) {
            return ActionType.SELL;
        }

        return ActionType.HOLD;
    }
}
