// Finds best alternative actions when optimal action is unavailable

import { ActionType } from '../../../types/game';
import { StrategyAction } from '../../../types/strategy';

/**
 * Finds best alternative action when optimal action is not available
 */
export function getBestAlternativeAction(
    optimalAction: StrategyAction,
    availableActions: ActionType[]
): ActionType {
    // Fallback hierarchy based on strategy principles
    const fallbacks: Record<StrategyAction, ActionType[]> = {
        'D': ['HIT', 'STAND'], // If can't double, hit is usually better for aggressive situations
        'P': ['HIT'], // If can't split, hit the pair
        'R': ['STAND', 'HIT'], // If can't surrender, stand vs weak dealer, hit vs strong
        'S': ['STAND'],
        'H': ['HIT']
    };

    const alternatives = fallbacks[optimalAction] || ['HIT'];
    return alternatives.find(action => availableActions.includes(action)) || 'HIT';
}
