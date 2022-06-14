import { ActionType, IDirectionMethod, Order, OrderType } from '@/types';
import { OrderService, GetIsProfitable } from '@/services';

export class GetProfitableShort implements IDirectionMethod {
    constructor(
        private readonly orderService: OrderService,
        private readonly getIsProfitable: GetIsProfitable,
    ) {
    }

    async execute(symbol: string, order: Order | null, values: number[]): Promise<ActionType> {
        const price = values[values.length - 1];

        if (!order && (this.orderService.getAccountAmount() - price > 0)) {
            return ActionType.SELL;
        }

        if (!order) {
            return ActionType.HOLD;
        }

        if (order.type === OrderType.SHORT && this.getIsProfitable.execute(price, order.price)) {
            return ActionType.BUY;
        }

        return ActionType.HOLD;
    }
}
