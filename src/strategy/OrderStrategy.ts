import { ActionType, IDirectionMethod, Order, OrderType } from '@/types';
import { GetProfitableLong } from './GetProfitableLong';
import { StopStrategy } from './StopStrategy';
import { EMAStrategy } from './EMAStrategy';
import { GetProfitableShort } from './GetProfitableShort';
import { OrderService } from '@/services';

export class OrderStrategy implements IDirectionMethod {
    constructor(
        private readonly orderService: OrderService,
        private readonly directionStrategy: IDirectionMethod,
        private readonly getProfitableLong: GetProfitableLong,
        private readonly getProfitableShort: GetProfitableShort,
        private readonly stopStrategy: StopStrategy,
        private readonly emaStrategy: EMAStrategy,
    ) {
    }

    async execute(symbol: string, order: Order | null, values: number[]): Promise<ActionType> {
        const stopType = await this.stopStrategy.execute(symbol, order, values);

        if (stopType !== ActionType.HOLD) {
            return stopType;
        }

        const [
            directionType,
            profitableLongType,
            profitableShortType,
            emaDirectionType,
        ] = await Promise.all([
            this.directionStrategy.execute(symbol, order, values),
            this.getProfitableLong.execute(symbol, order, values),
            this.getProfitableShort.execute(symbol, order, values),
            this.emaStrategy.execute(symbol, order, values),
        ]);

        if (order) {
            if (
                order.type === OrderType.LONG
                && profitableLongType === ActionType.SELL
                && directionType === ActionType.SELL
            ) {
                return ActionType.SELL;
            }

            if (
                order.type === OrderType.SHORT
                && profitableShortType === ActionType.BUY
                && directionType === ActionType.BUY
            ) {
                return ActionType.BUY;
            }
        } else {
            if (
                emaDirectionType === ActionType.SELL &&
                directionType === ActionType.SELL
            ) {
                return ActionType.SELL;
            }

            if (
                emaDirectionType === ActionType.BUY &&
                directionType === ActionType.BUY
            ) {
                return ActionType.BUY;
            }
        }

        return ActionType.HOLD;
    }
}
