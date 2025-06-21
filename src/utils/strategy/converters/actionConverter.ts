// Action type conversions between game and strategy representations

import { ActionType } from '../../../types/game';
import { StrategyAction } from '../../../types/strategy';

/**
 * Converts ActionType to StrategyAction
 */
export function actionTypeToStrategyAction(action: ActionType): StrategyAction {
    switch (action) {
        case 'HIT': return 'H';
        case 'STAND': return 'S';
        case 'DOUBLE': return 'D';
        case 'SPLIT': return 'P';
        case 'SURRENDER': return 'R';
        default: return 'H';
    }
}

/**
 * Converts StrategyAction to ActionType
 */
export function strategyActionToActionType(action: StrategyAction): ActionType {
    switch (action) {
        case 'H': return 'HIT';
        case 'S': return 'STAND';
        case 'D': return 'DOUBLE';
        case 'P': return 'SPLIT';
        case 'R': return 'SURRENDER';
        default: return 'HIT';
    }
}

/**
 * Gets friendly action name for display
 */
export function getActionName(action: ActionType): string {
    switch (action) {
        case 'HIT': return 'Hit';
        case 'STAND': return 'Stand';
        case 'DOUBLE': return 'Double Down';
        case 'SPLIT': return 'Split';
        case 'SURRENDER': return 'Surrender';
        default: return action;
    }
}
