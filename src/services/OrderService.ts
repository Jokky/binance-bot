import { Order } from '@/types';

export class OrderService {
    private initialAmount: number;
    private amount: number;
    private orders: Record<string, Order | null> = {};

    constructor(amount?: number) {
        if (amount) {
            this.amount = amount;
            this.initialAmount = amount;
        }
    }

    setOrders(orders: Order[]) {
        orders.map((order) => this.setOrder(order));
    }

    setEmptyOrders(symbol: string) {
        this.orders[symbol] = null;
    }

    setOrder(order: Order) {
        if (!this.orders[order.symbol]) {
            this.orders[order.symbol] = null;
        }
        this.orders[order.symbol] = order;
    }

    updateOrder(order: Order) {
        this.orders[order.symbol] = {
            ...this.orders[order.symbol],
            ...order,
        };
    }

    removeOrder(symbol: string) {
        this.orders[symbol] = null;
    }

    getOrder(symbol: string): Order | null {
        return this.orders[symbol];
    }

    getOrders() {
        return this.orders;
    }

    getOrdersAmount(): Record<string, number> {
        return Object.entries(this.orders).reduce((acc, [symbol, order]) => {
            acc[symbol] = (order?.price || 0) * (order?.count || 0);
            return acc;
        }, {} as Record<string, number>);
    }

    getTotalAmount() {
        return Object.entries(this.orders)
            .reduce((acc, [, order]) =>
                    acc + (order?.price || 0) * (order?.count || 0)
                , 0);
    }

    setInitialAccountAmount(value: number) {
        this.initialAmount = value;
        this.amount = value;
    }

    setAccountAmount(value: number) {
        this.amount = value;
    }

    getAccountAmount() {
        return this.amount;
    }

    getInitialAccountAmount() {
        return this.initialAmount;
    }
}
