import { OrderType } from './OrderType';

export interface Order {
    id: string;
    symbol: string;
    price: number;
    count: number;
    leverage: number;
    isPending: boolean;
    type: OrderType;
}