import { configureStore } from '@reduxjs/toolkit';
import sessionSlice, {
    startNewSession,
    endCurrentSession,
    recordDecision,
    recordGameResult,
    resetAllData,
} from '../sessionSlice';
import { SessionState } from '../../types/session';

type RootState = {
    session: SessionState;
};

describe('sessionSlice', () => {
    let store: ReturnType<typeof configureStore<RootState>>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                session: sessionSlice,
            },
        });
    });

    describe('initial state', () => {
        it('should have correct initial state', () => {
            const state = store.getState().session;

            expect(state.currentSession.handsPlayed).toBe(0);
            expect(state.currentSession.wins).toBe(0);
            expect(state.currentSession.losses).toBe(0);
            expect(state.currentSession.pushes).toBe(0);
            expect(state.currentSession.decisionsTotal).toBe(0);
            expect(state.currentSession.decisionsCorrect).toBe(0);
            expect(state.currentSession.accuracy).toBe(0);
            expect(state.skillLevel).toBe('BEGINNER');
            expect(state.gameHistory).toEqual([]);
            expect(state.mistakePatterns).toEqual([]);
            expect(state.trackingEnabled).toBe(true);
        });
    });

    describe('session management', () => {
        it('should start a new session correctly', () => {
            store.dispatch(startNewSession());
            const state = store.getState().session;

            expect(state.currentSession.sessionStart).toBeGreaterThan(0);
            expect(state.currentSession.sessionEnd).toBeNull();
            expect(state.currentSession.handsPlayed).toBe(0);
        });

        it('should end current session correctly', () => {
            // Start a session first
            store.dispatch(startNewSession());

            // Then end it
            store.dispatch(endCurrentSession());
            const state = store.getState().session;

            expect(state.currentSession.sessionEnd).toBeGreaterThan(0);
        });

        it('should reset session correctly', () => {
            // Add some data first
            store.dispatch(startNewSession());
            store.dispatch(recordGameResult({
                wins: 1,
                losses: 0,
                pushes: 0,
                surrenders: 0,
                blackjacks: 0,
                busts: 0,
            }));

            // Reset everything
            store.dispatch(resetAllData());
            const state = store.getState().session;

            expect(state.currentSession.handsPlayed).toBe(0);
            expect(state.currentSession.wins).toBe(0);
            expect(state.gameHistory).toEqual([]);
            expect(state.mistakePatterns).toEqual([]);
        });
    });

    describe('game result recording', () => {
        it('should record single hand win correctly', () => {
            const gameResult = {
                wins: 1,
                losses: 0,
                pushes: 0,
                surrenders: 0,
                blackjacks: 0,
                busts: 0,
            };

            store.dispatch(recordGameResult(gameResult));
            const state = store.getState().session;

            expect(state.currentSession.handsPlayed).toBe(1);
            expect(state.currentSession.wins).toBe(1);
            expect(state.currentSession.losses).toBe(0);
            expect(state.currentSession.pushes).toBe(0);
        });

        it('should record loss correctly', () => {
            const gameResult = {
                wins: 0,
                losses: 1,
                pushes: 0,
                surrenders: 0,
                blackjacks: 0,
                busts: 1,
            };

            store.dispatch(recordGameResult(gameResult));
            const state = store.getState().session;

            expect(state.currentSession.handsPlayed).toBe(1);
            expect(state.currentSession.wins).toBe(0);
            expect(state.currentSession.losses).toBe(1);
            expect(state.currentSession.pushes).toBe(0);
            expect(state.currentSession.busts).toBe(1);
        });

        it('should record push correctly', () => {
            const gameResult = {
                wins: 0,
                losses: 0,
                pushes: 1,
                surrenders: 0,
                blackjacks: 0,
                busts: 0,
            };

            store.dispatch(recordGameResult(gameResult));
            const state = store.getState().session;

            expect(state.currentSession.handsPlayed).toBe(1);
            expect(state.currentSession.wins).toBe(0);
            expect(state.currentSession.losses).toBe(0);
            expect(state.currentSession.pushes).toBe(1);
        });
    });

    describe('decision recording', () => {
        it('should record correct decision', () => {
            store.dispatch(recordDecision({
                wasCorrect: true,
                playerAction: 'STAND',
                optimalAction: 'STAND',
                scenario: {
                    playerValue: 16,
                    dealerUpcard: 10,
                    tableType: 'hard',
                },
            }));

            const state = store.getState().session;

            expect(state.currentSession.decisionsTotal).toBe(1);
            expect(state.currentSession.decisionsCorrect).toBe(1);
            expect(state.currentSession.accuracy).toBe(100);
        });

        it('should record incorrect decision', () => {
            store.dispatch(recordDecision({
                wasCorrect: false,
                playerAction: 'HIT',
                optimalAction: 'STAND',
                scenario: {
                    playerValue: 16,
                    dealerUpcard: 10,
                    tableType: 'hard',
                },
            }));

            const state = store.getState().session;

            expect(state.currentSession.decisionsTotal).toBe(1);
            expect(state.currentSession.decisionsCorrect).toBe(0);
            expect(state.currentSession.accuracy).toBe(0);
        });
    });

    describe('accuracy calculations', () => {
        it('should calculate accuracy correctly with multiple decisions', () => {
            // Record some correct and incorrect decisions
            store.dispatch(recordDecision({
                wasCorrect: true,
                playerAction: 'STAND',
                optimalAction: 'STAND',
                scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'hard' },
            }));

            store.dispatch(recordDecision({
                wasCorrect: false,
                playerAction: 'HIT',
                optimalAction: 'STAND',
                scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'hard' },
            }));

            store.dispatch(recordDecision({
                wasCorrect: true,
                playerAction: 'STAND',
                optimalAction: 'STAND',
                scenario: { playerValue: 19, dealerUpcard: 6, tableType: 'hard' },
            }));

            const state = store.getState().session;

            expect(state.currentSession.decisionsTotal).toBe(3);
            expect(state.currentSession.decisionsCorrect).toBe(2);
            expect(Math.round(state.currentSession.accuracy)).toBe(Math.round((2 / 3) * 100));
        });

        it('should handle zero decisions for accuracy calculation', () => {
            const state = store.getState().session;

            expect(state.currentSession.accuracy).toBe(0);
        });
    });
});
