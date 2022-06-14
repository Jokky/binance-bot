import { ActionType, IDirectionMethod, Order } from '@/types';

export class DirectionStrategy {
    constructor(private readonly strategy: IDirectionMethod) {
    }

    async execute(symbol: string, order: Order | null, values: number[]): Promise<ActionType> {
        return this.strategy.execute(symbol, order, values);
    }
}
