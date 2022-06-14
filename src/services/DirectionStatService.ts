import { ActionType } from '@/types';

export class DirectionStatService {
    private stat: Record<string, ActionType> = {};

    setDirection(symbol: string, actionType: ActionType) {
        this.stat[symbol] = actionType;
    }

    getDirection(symbol: string): ActionType {
        return this.stat[symbol] || ActionType.HOLD;
    }
}