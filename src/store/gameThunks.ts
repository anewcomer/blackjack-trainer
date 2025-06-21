// Thunks and helpers for game flow in the Blackjack Trainer
import { AppDispatch, RootState } from './index';
import {
    setDeck,
    dealInitialCards,
    setAvailableActions,
    setCurrentHandIndex,
    setGamePhase,
    updateHandValues,
    revealDealerHoleCard,
    dealerHit,
    setHandOutcomes,
    setGameResult,
    playerHit,
    playerStand,
    playerDouble,
    playerSurrender,
    logAction,
} from './gameSlice';
import {
    createMultiDeck,
    dealCards,
    calculateHandValue,
    isBlackjack,
    isBusted
} from '../utils/cardUtils';
import {
    getValidActions,
    shouldDealerHit,
    determineHandOutcome,
    determineGameResult
} from '../utils/gameLogic';
import { getOptimalAction, evaluateDecision } from '../utils/strategyEngine';
import { ActionType } from '../types/game';

// Start a new game: shuffle, deal, update state
export const startNewHand = () => (dispatch: AppDispatch, getState: () => RootState) => {
    // Create and shuffle deck
    const deck = createMultiDeck(1);
    let remainingDeck = [...deck];

    // Deal initial cards: player, dealer, player, dealer
    const { cards: playerCards, remainingDeck: deck1 } = dealCards(remainingDeck, 2);
    const { cards: dealerCards, remainingDeck: deck2 } = dealCards(deck1, 2);
    remainingDeck = deck2;

    dispatch(setDeck(remainingDeck));
    dispatch(dealInitialCards({ playerCards, dealerCards }));

    // Calculate hand values
    const playerHandValue = calculateHandValue(playerCards);
    const dealerHandValue = calculateHandValue(dealerCards);
    dispatch(updateHandValues({
        playerHands: [{ index: 0, value: playerHandValue.value, isSoft: playerHandValue.isSoft, isBlackjack: isBlackjack(playerCards), busted: isBusted(playerCards) }],
        dealerValue: dealerHandValue.value,
        dealerIsSoft: dealerHandValue.isSoft,
    }));

    // Set available actions
    const availableActions = getValidActions(
        {
            id: 'hand-0',
            cards: playerCards,
            busted: false,
            stood: false,
            doubled: false,
            splitFromPair: false,
            surrendered: false,
            isBlackjack: isBlackjack(playerCards),
            outcome: null,
            actionLog: [],
            handValue: playerHandValue.value,
            isSoft: playerHandValue.isSoft,
        },
        dealerCards[0],
        1,
        true
    );
    dispatch(setAvailableActions(availableActions));
    dispatch(setCurrentHandIndex(0));
    dispatch(setGamePhase('PLAYER_TURN'));
};

// Player action thunk (hit, stand, double, split, surrender) with strategy evaluation
export const playerAction = (action: ActionType) => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const handIndex = state.game.currentHandIndex;
    const hand = state.game.playerHands[handIndex];
    let deck = [...state.game.deck];

    if (!hand) return;

    // Get optimal action and evaluate decision BEFORE making the move
    const dealerUpCard = state.game.dealerHand.cards[0];
    const availableActions = state.game.availableActions;
    const optimalAction = getOptimalAction(hand, dealerUpCard, availableActions);
    const strategyDecision = evaluateDecision(action, hand, dealerUpCard, availableActions);

    // Log the strategy-aware action
    dispatch(logAction({
        handId: hand.id,
        action,
        optimalAction,
        wasCorrect: strategyDecision.isCorrect,
        handValueBefore: hand.handValue,
        handValueAfter: hand.handValue, // Will be updated after action
        cardDealt: null, // Will be updated if card is dealt
        timestamp: Date.now(),
    }));

    switch (action) {
        case 'HIT': {
            const { cards, remainingDeck } = dealCards(deck, 1);
            if (cards.length > 0) {
                dispatch(playerHit({ handIndex, card: cards[0] }));
                deck = remainingDeck;
                dispatch(setDeck(deck));

                // Update hand values after the hit
                const updatedState = getState();
                const updatedHand = updatedState.game.playerHands[handIndex];
                const playerHandValue = calculateHandValue(updatedHand.cards);
                const dealerHandValue = calculateHandValue(updatedState.game.dealerHand.cards);
                dispatch(updateHandValues({
                    playerHands: [{
                        index: handIndex,
                        value: playerHandValue.value,
                        isSoft: playerHandValue.isSoft,
                        isBlackjack: isBlackjack(updatedHand.cards),
                        busted: isBusted(updatedHand.cards)
                    }],
                    dealerValue: dealerHandValue.value,
                    dealerIsSoft: dealerHandValue.isSoft,
                }));

                // Check if busted or if player should continue
                if (isBusted(updatedHand.cards)) {
                    // Move to next hand or dealer turn
                    dispatch(checkForNextPhase());
                } else {
                    // Update available actions for current hand
                    const availableActions = getValidActions(
                        updatedHand,
                        updatedState.game.dealerHand.cards[0],
                        updatedState.game.playerHands.length,
                        true
                    );
                    dispatch(setAvailableActions(availableActions));
                }
            }
            break;
        }
        case 'STAND': {
            dispatch(playerStand({ handIndex }));
            dispatch(checkForNextPhase());
            break;
        }
        case 'DOUBLE': {
            const { cards, remainingDeck } = dealCards(deck, 1);
            if (cards.length > 0) {
                dispatch(playerDouble({ handIndex, card: cards[0] }));
                deck = remainingDeck;
                dispatch(setDeck(deck));

                // Update hand values after the double
                const updatedState = getState();
                const updatedHand = updatedState.game.playerHands[handIndex];
                const playerHandValue = calculateHandValue(updatedHand.cards);
                const dealerHandValue = calculateHandValue(updatedState.game.dealerHand.cards);
                dispatch(updateHandValues({
                    playerHands: [{
                        index: handIndex,
                        value: playerHandValue.value,
                        isSoft: playerHandValue.isSoft,
                        isBlackjack: isBlackjack(updatedHand.cards),
                        busted: isBusted(updatedHand.cards)
                    }],
                    dealerValue: dealerHandValue.value,
                    dealerIsSoft: dealerHandValue.isSoft,
                }));

                // Double always ends the hand
                dispatch(checkForNextPhase());
            }
            break;
        }
        case 'SPLIT': {
            // Not implemented in Phase 2 (placeholder)
            break;
        }
        case 'SURRENDER': {
            dispatch(playerSurrender({ handIndex }));
            dispatch(checkForNextPhase());
            break;
        }
    }
};

// Check if we should move to dealer turn or resolve the game
export const checkForNextPhase = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const { playerHands, currentHandIndex } = state.game;

    // Check if all hands are done (busted, stood, doubled, or surrendered)
    const allHandsDone = playerHands.every(hand =>
        hand.busted || hand.stood || hand.doubled || hand.surrendered
    );

    if (allHandsDone) {
        // All player hands are complete, start dealer turn
        dispatch(dealerTurn());
    } else {
        // Find next active hand (not implemented for multi-hand yet)
        // For now, just update available actions for current hand
        const currentHand = playerHands[currentHandIndex];
        if (currentHand && !currentHand.busted && !currentHand.stood && !currentHand.doubled && !currentHand.surrendered) {
            const availableActions = getValidActions(
                currentHand,
                state.game.dealerHand.cards[0],
                playerHands.length,
                true
            );
            dispatch(setAvailableActions(availableActions));
        }
    }
};

// Execute dealer's turn according to house rules
export const dealerTurn = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    let deck = [...state.game.deck];

    // Reveal dealer's hole card
    dispatch(revealDealerHoleCard());
    dispatch(setGamePhase('DEALER_TURN'));

    const dealerTurnStep = () => {
        const currentState = getState();
        const dealerHand = currentState.game.dealerHand;

        // Check if dealer should hit
        if (shouldDealerHit(dealerHand)) {
            const { cards, remainingDeck } = dealCards(deck, 1);
            if (cards.length > 0) {
                dispatch(dealerHit(cards[0]));
                deck = remainingDeck;
                dispatch(setDeck(deck));

                // Update dealer hand values
                const newDealerHandValue = calculateHandValue([...dealerHand.cards, cards[0]]);
                dispatch(updateHandValues({
                    playerHands: [], // No changes to player hands
                    dealerValue: newDealerHandValue.value,
                    dealerIsSoft: newDealerHandValue.isSoft,
                }));

                // Continue dealer turn after a delay for animation
                setTimeout(dealerTurnStep, 1000);
            }
        } else {
            // Dealer is done, resolve all hands
            dispatch(resolveHands());
        }
    };

    // Start dealer turn after a delay
    setTimeout(dealerTurnStep, 1000);
};

// Resolve all hands and determine game outcome
export const resolveHands = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const { playerHands, dealerHand } = state.game;

    // Calculate outcomes for each player hand
    const handOutcomes = playerHands.map(hand =>
        determineHandOutcome(hand, dealerHand)
    );

    // Determine overall game result
    const gameResult = determineGameResult(playerHands, dealerHand);

    // Format hand outcomes for the action
    const formattedOutcomes = handOutcomes.map((outcome, index) => ({
        handIndex: index,
        outcome
    }));

    dispatch(setHandOutcomes(formattedOutcomes));
    dispatch(setGameResult(gameResult));
    dispatch(setGamePhase('GAME_OVER'));
    dispatch(setAvailableActions([]));
};
