import { StochasticRSI } from 'technicalindicators';
import { ActionType, IDirectionMethod, Order, OrderType } from '@/types';

export interface StochRsiStrategyOptions {
    limitTop: number;
    limitDown: number;
    rsiPeriod: number;
    stochasticPeriod: number;
    kPeriod: number;
    dPeriod: number;
}

export class StochRsiStrategy implements IDirectionMethod {
    constructor(
        private readonly options: StochRsiStrategyOptions,
    ) {
    }

    async execute(symbol: string, order: Order | null, values: number[]): Promise<ActionType> {
        if (!values.length) {
            return ActionType.HOLD;
        }

        const {
            stochasticPeriod,
            limitDown,
            limitTop,
            rsiPeriod,
            kPeriod,
            dPeriod,
        } = this.options;

        const results = StochasticRSI.calculate({
            values,
            rsiPeriod,
            stochasticPeriod,
            kPeriod,
            dPeriod,
        });

        if (!results.length) {
            return ActionType.HOLD;
        }

        const [first, second, third] = results.slice(results.length - 4, results.length - 1);

        if (order) {
            if (
                order.type === OrderType.LONG
                && (first.d < second.d || first.k < second.k)
                && (third.d < second.d || third.k < second.k)
            ) {
                return ActionType.SELL;
            }

            if (
                order.type === OrderType.SHORT
                && (first.d > second.d || first.k > second.k)
                && (third.d > second.d || third.k > second.k)
            ) {
                return ActionType.BUY;
            }
        }

        if (
            third.k >= third.d
            && third.k > second.k
            && third.d > second.d
            && (
                third.k > limitDown
                || third.d > limitDown
            )
            && (
                second.k <= limitDown
                || second.d <= limitDown
            )
        ) {
            return ActionType.BUY;
        }

        if (
            third.k <= third.d
            && third.k < second.k
            && third.d < second.d
            && (
                third.k < limitTop
                || third.d < limitTop
            )
            && (
                second.k > limitTop
                || second.d > limitTop
            )
        ) {
            return ActionType.SELL;
        }
        return ActionType.HOLD;
    }
}
