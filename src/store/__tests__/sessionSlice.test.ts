import { configureStore } from '@reduxjs/toolkit';
import sessionSlice, {
    startSession,
    recordGameResult,
    recordPlayerAction,
    resetSession,
    updateSkillLevel,
    SessionState,
} from '../sessionSlice';
import { GameResult, PlayerActionRecord } from '../../types/session';

const createTestStore = (initialState?: Partial<SessionState>) => {
    return configureStore({
        reducer: {
            session: sessionSlice.reducer,
        },
        preloadedState: {
            session: {
                ...sessionSlice.getInitialState(),
                ...initialState,
            },
        },
    });
};

describe('sessionSlice', () => {
    describe('initial state', () => {
        it('should have correct initial state', () => {
            const state = sessionSlice.getInitialState();

            expect(state.isActive).toBe(false);
            expect(state.startTime).toBeNull();
            expect(state.endTime).toBeNull();
            expect(state.handsPlayed).toBe(0);
            expect(state.correctDecisions).toBe(0);
            expect(state.totalDecisions).toBe(0);
            expect(state.wins).toBe(0);
            expect(state.losses).toBe(0);
            expect(state.pushes).toBe(0);
            expect(state.skillLevel).toBe('BEGINNER');
            expect(state.gameHistory).toEqual([]);
            expect(state.actionHistory).toEqual([]);
            expect(state.mistakePatterns).toEqual([]);
        });
    });

    describe('session management', () => {
        it('should start a session correctly', () => {
            const store = createTestStore();
            const startTime = Date.now();

            store.dispatch(startSession());
            const state = store.getState().session;

            expect(state.isActive).toBe(true);
            expect(state.startTime).toBeGreaterThanOrEqual(startTime);
            expect(state.endTime).toBeNull();
        });

        it('should reset session correctly', () => {
            const store = createTestStore({
                isActive: true,
                handsPlayed: 10,
                correctDecisions: 8,
                totalDecisions: 15,
                wins: 5,
                losses: 4,
                pushes: 1,
                skillLevel: 'INTERMEDIATE',
                gameHistory: [
                    {
                        handId: 'test-1',
                        playerHands: [],
                        dealerHand: [],
                        outcomes: ['WIN'],
                        timestamp: Date.now(),
                        actionsLog: [],
                    }
                ],
            });

            store.dispatch(resetSession());
            const state = store.getState().session;

            expect(state.isActive).toBe(false);
            expect(state.startTime).toBeNull();
            expect(state.handsPlayed).toBe(0);
            expect(state.correctDecisions).toBe(0);
            expect(state.totalDecisions).toBe(0);
            expect(state.wins).toBe(0);
            expect(state.losses).toBe(0);
            expect(state.pushes).toBe(0);
            expect(state.skillLevel).toBe('BEGINNER');
            expect(state.gameHistory).toEqual([]);
            expect(state.actionHistory).toEqual([]);
            expect(state.mistakePatterns).toEqual([]);
        });
    });

    describe('game result recording', () => {
        it('should record single hand win correctly', () => {
            const store = createTestStore({ isActive: true });

            const gameResult: GameResult = {
                handId: 'test-hand-1',
                playerHands: [
                    {
                        cards: [{ rank: 'K', suit: 'hearts', value: 10 }, { rank: '9', suit: 'spades', value: 9 }],
                        busted: false,
                        stood: true,
                        doubled: false,
                        splitFromPair: false,
                        surrendered: false,
                        isBlackjack: false,
                        outcome: 'WIN',
                        actionLog: [],
                    }
                ],
                dealerHand: [
                    { rank: '10', suit: 'clubs', value: 10 },
                    { rank: '8', suit: 'diamonds', value: 8 }
                ],
                outcomes: ['WIN'],
                timestamp: Date.now(),
                actionsLog: [],
            };

            store.dispatch(recordGameResult(gameResult));
            const state = store.getState().session;

            expect(state.handsPlayed).toBe(1);
            expect(state.wins).toBe(1);
            expect(state.losses).toBe(0);
            expect(state.pushes).toBe(0);
            expect(state.gameHistory).toHaveLength(1);
            expect(state.gameHistory[0]).toEqual(gameResult);
        });

        it('should record multi-hand results correctly', () => {
            const store = createTestStore({ isActive: true });

            const gameResult: GameResult = {
                handId: 'test-split-hand',
                playerHands: [
                    {
                        cards: [{ rank: '8', suit: 'hearts', value: 8 }, { rank: '10', suit: 'spades', value: 10 }],
                        busted: false,
                        stood: true,
                        doubled: false,
                        splitFromPair: true,
                        surrendered: false,
                        isBlackjack: false,
                        outcome: 'WIN',
                        actionLog: [],
                    },
                    {
                        cards: [{ rank: '8', suit: 'clubs', value: 8 }, { rank: '5', suit: 'diamonds', value: 5 }, { rank: '9', suit: 'hearts', value: 9 }],
                        busted: true,
                        stood: false,
                        doubled: false,
                        splitFromPair: true,
                        surrendered: false,
                        isBlackjack: false,
                        outcome: 'LOSS',
                        actionLog: [],
                    }
                ],
                dealerHand: [
                    { rank: 'Q', suit: 'spades', value: 10 },
                    { rank: '7', suit: 'clubs', value: 7 }
                ],
                outcomes: ['WIN', 'LOSS'],
                timestamp: Date.now(),
                actionsLog: [],
            };

            store.dispatch(recordGameResult(gameResult));
            const state = store.getState().session;

            expect(state.handsPlayed).toBe(1); // One game, even though split
            expect(state.wins).toBe(1);
            expect(state.losses).toBe(1);
            expect(state.pushes).toBe(0);
        });

        it('should handle push results correctly', () => {
            const store = createTestStore({ isActive: true });

            const gameResult: GameResult = {
                handId: 'test-push',
                playerHands: [
                    {
                        cards: [{ rank: 'K', suit: 'hearts', value: 10 }, { rank: '10', suit: 'spades', value: 10 }],
                        busted: false,
                        stood: true,
                        doubled: false,
                        splitFromPair: false,
                        surrendered: false,
                        isBlackjack: false,
                        outcome: 'PUSH',
                        actionLog: [],
                    }
                ],
                dealerHand: [
                    { rank: 'J', suit: 'clubs', value: 10 },
                    { rank: 'Q', suit: 'diamonds', value: 10 }
                ],
                outcomes: ['PUSH'],
                timestamp: Date.now(),
                actionsLog: [],
            };

            store.dispatch(recordGameResult(gameResult));
            const state = store.getState().session;

            expect(state.handsPlayed).toBe(1);
            expect(state.wins).toBe(0);
            expect(state.losses).toBe(0);
            expect(state.pushes).toBe(1);
        });
    });

    describe('action recording and accuracy tracking', () => {
        it('should record correct player action', () => {
            const store = createTestStore({ isActive: true });

            const actionRecord: PlayerActionRecord = {
                handContext: {
                    playerCards: [{ rank: '10', suit: 'hearts', value: 10 }, { rank: '6', suit: 'spades', value: 6 }],
                    dealerUpcard: { rank: '5', suit: 'clubs', value: 5 },
                    handValue: 16,
                    canDouble: false,
                    canSplit: false,
                    canSurrender: true,
                },
                playerAction: 'STAND',
                optimalAction: 'STAND',
                wasCorrect: true,
                timestamp: Date.now(),
            };

            store.dispatch(recordPlayerAction(actionRecord));
            const state = store.getState().session;

            expect(state.totalDecisions).toBe(1);
            expect(state.correctDecisions).toBe(1);
            expect(state.actionHistory).toHaveLength(1);
            expect(state.actionHistory[0]).toEqual(actionRecord);
            expect(state.mistakePatterns).toHaveLength(0);
        });

        it('should record incorrect player action and create mistake pattern', () => {
            const store = createTestStore({ isActive: true });

            const actionRecord: PlayerActionRecord = {
                handContext: {
                    playerCards: [{ rank: '10', suit: 'hearts', value: 10 }, { rank: '6', suit: 'spades', value: 6 }],
                    dealerUpcard: { rank: '5', suit: 'clubs', value: 5 },
                    handValue: 16,
                    canDouble: false,
                    canSplit: false,
                    canSurrender: false,
                },
                playerAction: 'HIT',
                optimalAction: 'STAND',
                wasCorrect: false,
                timestamp: Date.now(),
            };

            store.dispatch(recordPlayerAction(actionRecord));
            const state = store.getState().session;

            expect(state.totalDecisions).toBe(1);
            expect(state.correctDecisions).toBe(0);
            expect(state.actionHistory).toHaveLength(1);
            expect(state.mistakePatterns).toHaveLength(1);

            const mistake = state.mistakePatterns[0];
            expect(mistake.scenario).toBe('16 vs 5');
            expect(mistake.playerAction).toBe('HIT');
            expect(mistake.correctAction).toBe('STAND');
            expect(mistake.frequency).toBe(1);
        });

        it('should increment existing mistake pattern frequency', () => {
            const store = createTestStore({
                isActive: true,
                mistakePatterns: [
                    {
                        scenario: '16 vs 5',
                        playerAction: 'HIT',
                        correctAction: 'STAND',
                        frequency: 1,
                        lastOccurrence: Date.now() - 1000,
                    }
                ]
            });

            const actionRecord: PlayerActionRecord = {
                handContext: {
                    playerCards: [{ rank: '9', suit: 'hearts', value: 9 }, { rank: '7', suit: 'spades', value: 7 }],
                    dealerUpcard: { rank: '5', suit: 'clubs', value: 5 },
                    handValue: 16,
                    canDouble: false,
                    canSplit: false,
                    canSurrender: false,
                },
                playerAction: 'HIT',
                optimalAction: 'STAND',
                wasCorrect: false,
                timestamp: Date.now(),
            };

            store.dispatch(recordPlayerAction(actionRecord));
            const state = store.getState().session;

            expect(state.mistakePatterns).toHaveLength(1);
            expect(state.mistakePatterns[0].frequency).toBe(2);
        });
    });

    describe('skill level calculation', () => {
        it('should update skill level to INTERMEDIATE with good accuracy', () => {
            const store = createTestStore({
                isActive: true,
                totalDecisions: 20,
                correctDecisions: 18, // 90% accuracy
            });

            store.dispatch(updateSkillLevel());
            const state = store.getState().session;

            expect(state.skillLevel).toBe('INTERMEDIATE');
        });

        it('should update skill level to ADVANCED with excellent accuracy', () => {
            const store = createTestStore({
                isActive: true,
                totalDecisions: 50,
                correctDecisions: 48, // 96% accuracy
            });

            store.dispatch(updateSkillLevel());
            const state = store.getState().session;

            expect(state.skillLevel).toBe('ADVANCED');
        });

        it('should remain BEGINNER with low accuracy', () => {
            const store = createTestStore({
                isActive: true,
                totalDecisions: 10,
                correctDecisions: 6, // 60% accuracy
            });

            store.dispatch(updateSkillLevel());
            const state = store.getState().session;

            expect(state.skillLevel).toBe('BEGINNER');
        });

        it('should require minimum decisions for skill level upgrade', () => {
            const store = createTestStore({
                isActive: true,
                totalDecisions: 5, // Too few decisions
                correctDecisions: 5, // 100% accuracy but not enough data
            });

            store.dispatch(updateSkillLevel());
            const state = store.getState().session;

            expect(state.skillLevel).toBe('BEGINNER');
        });
    });

    describe('derived calculations', () => {
        it('should calculate accuracy correctly', () => {
            const store = createTestStore({
                totalDecisions: 20,
                correctDecisions: 16,
            });

            const state = store.getState().session;
            const accuracy = state.totalDecisions > 0 ? (state.correctDecisions / state.totalDecisions) * 100 : 0;

            expect(accuracy).toBe(80);
        });

        it('should handle zero decisions for accuracy calculation', () => {
            const store = createTestStore({
                totalDecisions: 0,
                correctDecisions: 0,
            });

            const state = store.getState().session;
            const accuracy = state.totalDecisions > 0 ? (state.correctDecisions / state.totalDecisions) * 100 : 0;

            expect(accuracy).toBe(0);
        });

        it('should calculate session duration correctly', () => {
            const startTime = Date.now() - 60000; // 1 minute ago
            const endTime = Date.now();

            const store = createTestStore({
                startTime,
                endTime,
            });

            const state = store.getState().session;
            const duration = state.endTime && state.startTime ? state.endTime - state.startTime : 0;

            expect(duration).toBeGreaterThanOrEqual(59000);
            expect(duration).toBeLessThanOrEqual(61000);
        });
    });
});
