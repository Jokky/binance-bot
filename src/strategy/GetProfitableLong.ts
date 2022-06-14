import { OrderService, GetIsProfitable } from '@/services';
import { ActionType, IDirectionMethod, Order, OrderType } from '@/types';

/**
 * Расчет покупки/продажи с учетом покупок и свободных средств
 */
export class GetProfitableLong implements IDirectionMethod {
    constructor(
        private readonly orderService: OrderService,
        private readonly getIsProfitable: GetIsProfitable,
    ) {
    }

    async execute(symbol: string, order: Order | null, values: number[]): Promise<ActionType> {
        const price = values[values.length - 1];

        if (!order && (this.orderService.getAccountAmount() - price > 0)) {
            return ActionType.BUY;
        }

        if (!order) {
            return ActionType.HOLD;
        }

        if (order?.type === OrderType.LONG && this.getIsProfitable.execute(order.price, price)) {
            return ActionType.SELL;
        }

        return ActionType.HOLD;
    }
}
