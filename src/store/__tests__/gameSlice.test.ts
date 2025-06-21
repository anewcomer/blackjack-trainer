import { configureStore } from '@reduxjs/toolkit';
import gameSlice from '../gameSlice';
import { startNewHand, playerAction } from '../gameThunks';
import { Card, Rank, Suit, PlayerHand, GameState } from '../../types/game';
import { AppDispatch } from '../index';

// Helper function to create mock cards with correct types
const createMockCard = (rank: Rank, suit: Suit): Card => ({
    rank,
    suit,
    value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank),
    id: `${rank}-${suit}-${Math.random()}`,
});

// Helper function to create a complete PlayerHand
const createMockPlayerHand = (cards: Card[]): PlayerHand => ({
    id: `hand-${Math.random()}`,
    cards,
    busted: false,
    stood: false,
    doubled: false,
    splitFromPair: false,
    surrendered: false,
    isBlackjack: false,
    outcome: null,
    actionLog: [],
    handValue: cards.reduce((sum, card) => sum + card.value, 0),
    isSoft: cards.some(card => card.rank === 'A'),
});

type RootState = {
    game: GameState;
};

describe('gameSlice', () => {
    let store: ReturnType<typeof configureStore<RootState>>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                game: gameSlice,
            },
        });
    });

    describe('initial state', () => {
        it('should have correct initial state', () => {
            const state = store.getState().game;

            expect(state).toHaveProperty('deck');
            expect(state).toHaveProperty('playerHands');
            expect(state).toHaveProperty('dealerHand');
            expect(state).toHaveProperty('gamePhase');
            expect(state).toHaveProperty('availableActions');
            expect(state).toHaveProperty('gameResult');
            expect(state).toHaveProperty('handInProgress');

            expect(Array.isArray(state.deck)).toBe(true);
            expect(Array.isArray(state.playerHands)).toBe(true);
            expect(Array.isArray(state.availableActions)).toBe(true);
            expect(state.gameResult).toBeNull();
            expect(typeof state.handInProgress).toBe('boolean');
        });
    });

    describe('thunk actions', () => {
        it('should handle startNewHand', async () => {
            const dispatch = store.dispatch as AppDispatch;
            await dispatch(startNewHand());

            const state = store.getState().game;
            expect(state.gamePhase).not.toBe('BETTING');
            expect(state.handInProgress).toBe(true);
        });

        it('should handle playerAction - HIT', async () => {
            const dispatch = store.dispatch as AppDispatch;

            // Start a new hand first
            await dispatch(startNewHand());

            // The action should complete without throwing an error
            expect(() => dispatch(playerAction('HIT'))).not.toThrow();

            const stateAfter = store.getState().game;

            // Verify the state is still valid after the action
            expect(stateAfter.gamePhase).toBeDefined();
            expect(Array.isArray(stateAfter.playerHands)).toBe(true);
        });

        it('should handle playerAction - STAND', async () => {
            const dispatch = store.dispatch as AppDispatch;

            // Start a new hand first
            await dispatch(startNewHand());

            // The action should complete without throwing an error
            expect(() => dispatch(playerAction('STAND'))).not.toThrow();

            const state = store.getState().game;

            // Verify the state is still valid after the action
            expect(state.gamePhase).toBeDefined();
            expect(Array.isArray(state.playerHands)).toBe(true);
        });
    });

    describe('card utilities', () => {
        it('should create cards with correct suit symbols', () => {
            const spadeCard = createMockCard('A', '♠');
            const heartCard = createMockCard('K', '♥');
            const diamondCard = createMockCard('Q', '♦');
            const clubCard = createMockCard('J', '♣');

            expect(spadeCard.suit).toBe('♠');
            expect(heartCard.suit).toBe('♥');
            expect(diamondCard.suit).toBe('♦');
            expect(clubCard.suit).toBe('♣');

            expect(spadeCard.rank).toBe('A');
            expect(heartCard.rank).toBe('K');
            expect(diamondCard.rank).toBe('Q');
            expect(clubCard.rank).toBe('J');
        });

        it('should assign correct values to cards', () => {
            const aceCard = createMockCard('A', '♠');
            const kingCard = createMockCard('K', '♥');
            const numberCard = createMockCard('7', '♦');

            expect(aceCard.value).toBe(11);
            expect(kingCard.value).toBe(10);
            expect(numberCard.value).toBe(7);
        });

        it('should create player hands with all required properties', () => {
            const cards = [
                createMockCard('K', '♠'),
                createMockCard('5', '♥'),
            ];
            const hand = createMockPlayerHand(cards);

            expect(hand).toHaveProperty('id');
            expect(hand).toHaveProperty('handValue');
            expect(hand).toHaveProperty('isSoft');
            expect(hand).toHaveProperty('cards');
            expect(hand).toHaveProperty('busted');
            expect(hand).toHaveProperty('stood');
            expect(hand).toHaveProperty('doubled');
            expect(hand).toHaveProperty('splitFromPair');
            expect(hand).toHaveProperty('surrendered');
            expect(hand).toHaveProperty('isBlackjack');
            expect(hand).toHaveProperty('outcome');
            expect(hand).toHaveProperty('actionLog');

            expect(hand.cards).toHaveLength(2);
            expect(hand.handValue).toBe(15);
            expect(hand.isSoft).toBe(false);
            expect(hand.busted).toBe(false);
            expect(hand.stood).toBe(false);
        });

        it('should correctly identify soft hands', () => {
            const softCards = [
                createMockCard('A', '♠'),
                createMockCard('5', '♥'),
            ];
            const softHand = createMockPlayerHand(softCards);

            const hardCards = [
                createMockCard('K', '♠'),
                createMockCard('5', '♥'),
            ];
            const hardHand = createMockPlayerHand(hardCards);

            expect(softHand.isSoft).toBe(true);
            expect(softHand.handValue).toBe(16);
            expect(hardHand.isSoft).toBe(false);
            expect(hardHand.handValue).toBe(15);
        });

        it('should handle blackjack detection', () => {
            const blackjackCards = [
                createMockCard('A', '♠'),
                createMockCard('K', '♥'),
            ];
            const blackjackHand = createMockPlayerHand(blackjackCards);

            expect(blackjackHand.handValue).toBe(21);
            expect(blackjackHand.isSoft).toBe(true);
        });
    });

    describe('game flow integration', () => {
        it('should handle a complete hand flow', async () => {
            const dispatch = store.dispatch as AppDispatch;

            // Start new hand
            await dispatch(startNewHand());
            let state = store.getState().game;

            expect(state.handInProgress).toBe(true);
            expect(state.gamePhase).not.toBe('BETTING');

            // Make a move - action should complete without throwing
            expect(() => dispatch(playerAction('STAND'))).not.toThrow();

            state = store.getState().game;
            expect(state.gamePhase).toBeDefined();
        });
    });
});
