import { ActionType, IDirectionMethod, Order, OrderType } from '@/types';
import { computePercentOf } from '@/utils';

interface StopStrategyOptions {
    percentStopLoss: number;
}

export class StopStrategy implements IDirectionMethod {
    constructor(
        private readonly options: StopStrategyOptions,
    ) {
    }

    async execute(symbol: string, order: Order | null, values: number[]): Promise<ActionType> {
        if (!order) {
            return ActionType.HOLD;
        }

        const value1 = order.price;
        const value2 = values[values.length - 1];

        if (order.type === OrderType.LONG && computePercentOf(value2 - value1, value1) <= this.options.percentStopLoss) {
            return ActionType.SELL;
        }

        if (order.type === OrderType.SHORT && computePercentOf(value1 - value2, value2) <= this.options.percentStopLoss) {
            return ActionType.BUY;
        }

        return ActionType.HOLD;
    }
}
