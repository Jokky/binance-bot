import { ActionType } from './ActionType';
import { OrderType } from './OrderType';

export const MapActionTypeToOrderType: Record<ActionType, OrderType> = {
    [ActionType.BUY]: OrderType.LONG,
    [ActionType.SELL]: OrderType.SHORT,
    [ActionType.HOLD]: OrderType.HOLD,
};