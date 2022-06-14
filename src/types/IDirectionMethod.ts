import { ActionType } from './ActionType';
import { Order } from './Order';

export interface IDirectionMethod {
    execute(symbol: string, order: Order | null, values: number[]): Promise<ActionType>;
}