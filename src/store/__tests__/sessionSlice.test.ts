import { configureStore } from '@reduxjs/toolkit';
import sessionReducer, {
    startNewSession,
    endCurrentSession,
    recordDecision,
    recordGameResult,
    addHistoryEntry,
    clearHistory,
    setMaxHistoryEntries,
    clearMistakePatterns,
    removeMistakePattern,
    updateSkillLevel,
    setTrackingEnabled,
    resetAllData,
    importSessionData,
    sessionSlice,
} from '../sessionSlice';
import { SessionState, SessionStatistics, GameHistoryEntry, MistakePattern } from '../../types/session';

// Helper functions to create mock data
const createMockSessionStats = (overrides?: Partial<SessionStatistics>): SessionStatistics => ({
    sessionId: 'test-session-123',
    sessionStart: 1640995200000, // Jan 1, 2022
    sessionEnd: null,
    handsPlayed: 0,
    decisionsTotal: 0,
    decisionsCorrect: 0,
    accuracy: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    surrenders: 0,
    blackjacks: 0,
    busts: 0,
    recentAccuracy: [],
    improvementTrend: 0,
    ...overrides,
});

const createMockGameHistoryEntry = (overrides?: Partial<GameHistoryEntry>): GameHistoryEntry => ({
    id: 'game-123',
    timestamp: Date.now(),
    sessionId: 'session-123',
    initialPlayerCards: ['A♠', 'K♥'],
    initialDealerCard: '7♦',
    playerHands: [],
    dealerFinalHand: ['7♦', '10♣'],
    dealerFinalValue: 17,
    finalResult: {
        wins: 1,
        losses: 0,
        pushes: 0,
        surrenders: 0,
    },
    totalDecisions: 1,
    correctDecisions: 1,
    handAccuracy: 100,
    hadBlackjack: true,
    hadSplits: false,
    hadDoubles: false,
    hadSurrender: false,
    ...overrides,
});

const createMockMistakePattern = (overrides?: Partial<MistakePattern>): MistakePattern => ({
    scenario: '16-10-standard',
    playerValue: 16,
    dealerUpcard: 10,
    tableType: 'standard',
    playerAction: 'HIT',
    correctAction: 'STAND',
    frequency: 1,
    lastOccurrence: Date.now(),
    ...overrides,
});

const createTestStore = (initialState?: Partial<SessionState>) => {
    return configureStore({
        reducer: {
            session: sessionReducer,
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
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        store = createTestStore();
    });

    describe('initial state', () => {
        it('should have correct initial state', () => {
            const state = store.getState().session;

            expect(state).toHaveProperty('currentSession');
            expect(state).toHaveProperty('gameHistory');
            expect(state).toHaveProperty('allTimeStats');
            expect(state).toHaveProperty('mistakePatterns');
            expect(state).toHaveProperty('skillLevel');
            expect(state).toHaveProperty('maxHistoryEntries');
            expect(state).toHaveProperty('trackingEnabled');

            expect(state.currentSession.handsPlayed).toBe(0);
            expect(state.currentSession.decisionsTotal).toBe(0);
            expect(state.currentSession.accuracy).toBe(0);
            expect(state.gameHistory).toEqual([]);
            expect(state.mistakePatterns).toEqual([]);
            expect(state.skillLevel).toBe('BEGINNER');
            expect(state.maxHistoryEntries).toBe(100);
            expect(state.trackingEnabled).toBe(true);
        });

        it('should create session with unique ID and timestamp', () => {
            const state = store.getState().session;

            expect(state.currentSession.sessionId).toMatch(/^session-\d+$/);
            expect(state.currentSession.sessionStart).toBeLessThanOrEqual(Date.now());
            expect(state.currentSession.sessionEnd).toBeNull();
        });
    });

    describe('session management', () => {
        it('should start a new session', () => {
            const oldSessionId = store.getState().session.currentSession.sessionId;

            store.dispatch(startNewSession());

            const state = store.getState().session;
            expect(state.currentSession.sessionId).not.toBe(oldSessionId);
            expect(state.currentSession.sessionId).toMatch(/^session-\d+$/);
            expect(state.currentSession.handsPlayed).toBe(0);
            expect(state.currentSession.decisionsTotal).toBe(0);
            expect(state.currentSession.decisionsCorrect).toBe(0);
            expect(state.currentSession.accuracy).toBe(0);
        });

        it('should end current session and update all-time stats', () => {
            // Set up current session with some data
            store.dispatch(recordDecision({
                wasCorrect: true,
                playerAction: 'HIT',
                optimalAction: 'HIT',
                scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
            }));
            store.dispatch(recordGameResult({
                wins: 1,
                losses: 0,
                pushes: 0,
                surrenders: 0,
                blackjacks: 1,
                busts: 0
            }));

            const beforeEnd = store.getState().session;
            const sessionHandsPlayed = beforeEnd.currentSession.handsPlayed;
            const sessionDecisionsTotal = beforeEnd.currentSession.decisionsTotal;

            store.dispatch(endCurrentSession());

            const state = store.getState().session;

            expect(state.currentSession.sessionEnd).toBeLessThanOrEqual(Date.now());
            expect(state.allTimeStats.handsPlayed).toBe(sessionHandsPlayed);
            expect(state.allTimeStats.decisionsTotal).toBe(sessionDecisionsTotal);
            expect(state.allTimeStats.accuracy).toBeGreaterThan(0);
        });
    });

    describe('decision tracking', () => {
        it('should record correct decision', () => {
            store.dispatch(recordDecision({
                wasCorrect: true,
                playerAction: 'HIT',
                optimalAction: 'HIT',
                scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
            }));

            const state = store.getState().session;

            expect(state.currentSession.decisionsTotal).toBe(1);
            expect(state.currentSession.decisionsCorrect).toBe(1);
            expect(state.currentSession.accuracy).toBe(100);
            expect(state.mistakePatterns).toHaveLength(0);
        });

        it('should record incorrect decision and create mistake pattern', () => {
            store.dispatch(recordDecision({
                wasCorrect: false,
                playerAction: 'HIT',
                optimalAction: 'STAND',
                scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'standard' }
            }));

            const state = store.getState().session;

            expect(state.currentSession.decisionsTotal).toBe(1);
            expect(state.currentSession.decisionsCorrect).toBe(0);
            expect(state.currentSession.accuracy).toBe(0);
            expect(state.mistakePatterns).toHaveLength(1);

            const mistake = state.mistakePatterns[0];
            expect(mistake.scenario).toBe('16-10-standard');
            expect(mistake.playerValue).toBe(16);
            expect(mistake.dealerUpcard).toBe(10);
            expect(mistake.tableType).toBe('standard');
            expect(mistake.playerAction).toBe('HIT');
            expect(mistake.correctAction).toBe('STAND');
            expect(mistake.frequency).toBe(1);
        });

        it('should increment frequency for repeated mistakes', () => {
            const decisionPayload = {
                wasCorrect: false,
                playerAction: 'HIT',
                optimalAction: 'STAND',
                scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'standard' }
            };

            store.dispatch(recordDecision(decisionPayload));
            store.dispatch(recordDecision(decisionPayload));

            const state = store.getState().session;

            expect(state.mistakePatterns).toHaveLength(1);
            expect(state.mistakePatterns[0].frequency).toBe(2);
        });

        it('should calculate accuracy correctly with mixed decisions', () => {
            store.dispatch(recordDecision({
                wasCorrect: true,
                playerAction: 'HIT',
                optimalAction: 'HIT',
                scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
            }));
            store.dispatch(recordDecision({
                wasCorrect: false,
                playerAction: 'HIT',
                optimalAction: 'STAND',
                scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'standard' }
            }));
            store.dispatch(recordDecision({
                wasCorrect: true,
                playerAction: 'STAND',
                optimalAction: 'STAND',
                scenario: { playerValue: 17, dealerUpcard: 8, tableType: 'standard' }
            }));

            const state = store.getState().session;

            expect(state.currentSession.decisionsTotal).toBe(3);
            expect(state.currentSession.decisionsCorrect).toBe(2);
            expect(state.currentSession.accuracy).toBeCloseTo(66.67, 1);
        });
    });

    describe('game result tracking', () => {
        it('should record game results', () => {
            store.dispatch(recordGameResult({
                wins: 1,
                losses: 0,
                pushes: 0,
                surrenders: 0,
                blackjacks: 1,
                busts: 0
            }));

            const state = store.getState().session;

            expect(state.currentSession.handsPlayed).toBe(1);
            expect(state.currentSession.wins).toBe(1);
            expect(state.currentSession.blackjacks).toBe(1);
        });

        it('should update recent accuracy array', () => {
            // First record some decisions to have accuracy
            store.dispatch(recordDecision({
                wasCorrect: true,
                playerAction: 'HIT',
                optimalAction: 'HIT',
                scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
            }));

            store.dispatch(recordGameResult({
                wins: 1,
                losses: 0,
                pushes: 0,
                surrenders: 0,
                blackjacks: 0,
                busts: 0
            }));

            const state = store.getState().session;

            expect(state.currentSession.recentAccuracy).toHaveLength(1);
            expect(state.currentSession.recentAccuracy[0]).toBe(100);
        });

        it('should limit recent accuracy to 10 entries', () => {
            // Record 12 games to test the limit
            for (let i = 0; i < 12; i++) {
                store.dispatch(recordDecision({
                    wasCorrect: true,
                    playerAction: 'HIT',
                    optimalAction: 'HIT',
                    scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
                }));

                store.dispatch(recordGameResult({
                    wins: 1,
                    losses: 0,
                    pushes: 0,
                    surrenders: 0,
                    blackjacks: 0,
                    busts: 0
                }));
            }

            const state = store.getState().session;

            expect(state.currentSession.recentAccuracy).toHaveLength(10);
        });

        it('should calculate improvement trend', () => {
            // Create pattern: 5 games with lower accuracy, then 5 with higher
            for (let i = 0; i < 5; i++) {
                store.dispatch(recordDecision({
                    wasCorrect: false,
                    playerAction: 'HIT',
                    optimalAction: 'STAND',
                    scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'standard' }
                }));

                store.dispatch(recordGameResult({
                    wins: 0,
                    losses: 1,
                    pushes: 0,
                    surrenders: 0,
                    blackjacks: 0,
                    busts: 0
                }));
            }

            for (let i = 0; i < 5; i++) {
                store.dispatch(recordDecision({
                    wasCorrect: true,
                    playerAction: 'STAND',
                    optimalAction: 'STAND',
                    scenario: { playerValue: 17, dealerUpcard: 8, tableType: 'standard' }
                }));

                store.dispatch(recordGameResult({
                    wins: 1,
                    losses: 0,
                    pushes: 0,
                    surrenders: 0,
                    blackjacks: 0,
                    busts: 0
                }));
            }

            const state = store.getState().session;

            expect(state.currentSession.improvementTrend).toBeGreaterThan(0);
        });
    });

    describe('game history', () => {
        it('should add history entry', () => {
            const historyEntry = createMockGameHistoryEntry();

            store.dispatch(addHistoryEntry(historyEntry));

            const state = store.getState().session;

            expect(state.gameHistory).toHaveLength(1);
            expect(state.gameHistory[0]).toEqual(historyEntry);
        });

        it('should add new entries to the beginning of history', () => {
            const entry1 = createMockGameHistoryEntry({ id: 'game-1' });
            const entry2 = createMockGameHistoryEntry({ id: 'game-2' });

            store.dispatch(addHistoryEntry(entry1));
            store.dispatch(addHistoryEntry(entry2));

            const state = store.getState().session;

            expect(state.gameHistory[0].id).toBe('game-2');
            expect(state.gameHistory[1].id).toBe('game-1');
        });

        it('should limit history to maxHistoryEntries', () => {
            // First set a small limit
            store.dispatch(setMaxHistoryEntries(3));

            // Add 5 entries
            for (let i = 0; i < 5; i++) {
                store.dispatch(addHistoryEntry(createMockGameHistoryEntry({ id: `game-${i}` })));
            }

            const state = store.getState().session;

            expect(state.gameHistory).toHaveLength(3);
            expect(state.gameHistory[0].id).toBe('game-4'); // Most recent
            expect(state.gameHistory[2].id).toBe('game-2'); // Oldest kept
        });

        it('should clear history', () => {
            store.dispatch(addHistoryEntry(createMockGameHistoryEntry()));
            store.dispatch(clearHistory());

            const state = store.getState().session;

            expect(state.gameHistory).toHaveLength(0);
        });

        it('should set max history entries and trim if necessary', () => {
            // Add 5 entries
            for (let i = 0; i < 5; i++) {
                store.dispatch(addHistoryEntry(createMockGameHistoryEntry({ id: `game-${i}` })));
            }

            // Set limit to 3
            store.dispatch(setMaxHistoryEntries(3));

            const state = store.getState().session;

            expect(state.maxHistoryEntries).toBe(3);
            expect(state.gameHistory).toHaveLength(3);
        });
    });

    describe('mistake pattern management', () => {
        it('should clear mistake patterns', () => {
            store.dispatch(recordDecision({
                wasCorrect: false,
                playerAction: 'HIT',
                optimalAction: 'STAND',
                scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'standard' }
            }));

            store.dispatch(clearMistakePatterns());

            const state = store.getState().session;

            expect(state.mistakePatterns).toHaveLength(0);
        });

        it('should remove specific mistake pattern', () => {
            store.dispatch(recordDecision({
                wasCorrect: false,
                playerAction: 'HIT',
                optimalAction: 'STAND',
                scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'standard' }
            }));
            store.dispatch(recordDecision({
                wasCorrect: false,
                playerAction: 'STAND',
                optimalAction: 'HIT',
                scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
            }));

            store.dispatch(removeMistakePattern('16-10-standard'));

            const state = store.getState().session;

            expect(state.mistakePatterns).toHaveLength(1);
            expect(state.mistakePatterns[0].scenario).toBe('12-6-standard');
        });
    });

    describe('skill level assessment', () => {
        it('should update skill level to ADVANCED with high accuracy', () => {
            // Play 20+ hands with 90%+ accuracy
            for (let i = 0; i < 19; i++) {
                store.dispatch(recordDecision({
                    wasCorrect: true,
                    playerAction: 'HIT',
                    optimalAction: 'HIT',
                    scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
                }));
                store.dispatch(recordGameResult({
                    wins: 1,
                    losses: 0,
                    pushes: 0,
                    surrenders: 0,
                    blackjacks: 0,
                    busts: 0
                }));
            }

            // One mistake to get exactly 95% accuracy (19/20)
            store.dispatch(recordDecision({
                wasCorrect: false,
                playerAction: 'HIT',
                optimalAction: 'STAND',
                scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'standard' }
            }));
            store.dispatch(recordGameResult({
                wins: 0,
                losses: 1,
                pushes: 0,
                surrenders: 0,
                blackjacks: 0,
                busts: 0
            }));

            store.dispatch(updateSkillLevel());

            const state = store.getState().session;

            expect(state.skillLevel).toBe('ADVANCED');
        });

        it('should update skill level to INTERMEDIATE with medium accuracy', () => {
            // Play 20+ hands with 75-90% accuracy
            for (let i = 0; i < 15; i++) {
                store.dispatch(recordDecision({
                    wasCorrect: true,
                    playerAction: 'HIT',
                    optimalAction: 'HIT',
                    scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
                }));
                store.dispatch(recordGameResult({
                    wins: 1,
                    losses: 0,
                    pushes: 0,
                    surrenders: 0,
                    blackjacks: 0,
                    busts: 0
                }));
            }

            // 5 mistakes to get 75% accuracy (15/20)
            for (let i = 0; i < 5; i++) {
                store.dispatch(recordDecision({
                    wasCorrect: false,
                    playerAction: 'HIT',
                    optimalAction: 'STAND',
                    scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'standard' }
                }));
                store.dispatch(recordGameResult({
                    wins: 0,
                    losses: 1,
                    pushes: 0,
                    surrenders: 0,
                    blackjacks: 0,
                    busts: 0
                }));
            }

            store.dispatch(updateSkillLevel());

            const state = store.getState().session;

            expect(state.skillLevel).toBe('INTERMEDIATE');
        });

        it('should keep BEGINNER with low accuracy', () => {
            // Play 20+ hands with <75% accuracy
            for (let i = 0; i < 10; i++) {
                store.dispatch(recordDecision({
                    wasCorrect: true,
                    playerAction: 'HIT',
                    optimalAction: 'HIT',
                    scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
                }));
                store.dispatch(recordGameResult({
                    wins: 1,
                    losses: 0,
                    pushes: 0,
                    surrenders: 0,
                    blackjacks: 0,
                    busts: 0
                }));
            }

            for (let i = 0; i < 10; i++) {
                store.dispatch(recordDecision({
                    wasCorrect: false,
                    playerAction: 'HIT',
                    optimalAction: 'STAND',
                    scenario: { playerValue: 16, dealerUpcard: 10, tableType: 'standard' }
                }));
                store.dispatch(recordGameResult({
                    wins: 0,
                    losses: 1,
                    pushes: 0,
                    surrenders: 0,
                    blackjacks: 0,
                    busts: 0
                }));
            }

            store.dispatch(updateSkillLevel());

            const state = store.getState().session;

            expect(state.skillLevel).toBe('BEGINNER');
        });

        it('should not update skill level with insufficient hands', () => {
            // Play only 10 hands (less than 20 required)
            for (let i = 0; i < 10; i++) {
                store.dispatch(recordDecision({
                    wasCorrect: true,
                    playerAction: 'HIT',
                    optimalAction: 'HIT',
                    scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
                }));
                store.dispatch(recordGameResult({
                    wins: 1,
                    losses: 0,
                    pushes: 0,
                    surrenders: 0,
                    blackjacks: 0,
                    busts: 0
                }));
            }

            store.dispatch(updateSkillLevel());

            const state = store.getState().session;

            expect(state.skillLevel).toBe('BEGINNER'); // Should remain unchanged
        });
    });

    describe('settings', () => {
        it('should set tracking enabled', () => {
            store.dispatch(setTrackingEnabled(false));

            const state = store.getState().session;

            expect(state.trackingEnabled).toBe(false);
        });

        it('should toggle tracking enabled', () => {
            store.dispatch(setTrackingEnabled(false));
            store.dispatch(setTrackingEnabled(true));

            const state = store.getState().session;

            expect(state.trackingEnabled).toBe(true);
        });
    });

    describe('data management', () => {
        it('should reset all data', () => {
            // Add some data first
            store.dispatch(recordDecision({
                wasCorrect: true,
                playerAction: 'HIT',
                optimalAction: 'HIT',
                scenario: { playerValue: 12, dealerUpcard: 6, tableType: 'standard' }
            }));
            store.dispatch(addHistoryEntry(createMockGameHistoryEntry()));

            store.dispatch(resetAllData());

            const state = store.getState().session;

            expect(state.currentSession.decisionsTotal).toBe(0);
            expect(state.gameHistory).toHaveLength(0);
            expect(state.mistakePatterns).toHaveLength(0);
            expect(state.allTimeStats.decisionsTotal).toBe(0);
            expect(state.skillLevel).toBe('BEGINNER');
            expect(state.trackingEnabled).toBe(true);
        });

        it('should import session data', () => {
            const mockData = {
                gameHistory: [createMockGameHistoryEntry()],
                mistakePatterns: [createMockMistakePattern()],
                allTimeStats: createMockSessionStats({
                    handsPlayed: 100,
                    decisionsTotal: 200,
                    accuracy: 85
                })
            };

            store.dispatch(importSessionData(mockData));

            const state = store.getState().session;

            expect(state.gameHistory).toHaveLength(1);
            expect(state.mistakePatterns).toHaveLength(1);
            expect(state.allTimeStats.handsPlayed).toBe(100);
            expect(state.allTimeStats.decisionsTotal).toBe(200);
            expect(state.allTimeStats.accuracy).toBe(85);
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle division by zero in accuracy calculation', () => {
            const state = store.getState().session;

            expect(state.currentSession.accuracy).toBe(0);
            expect(state.allTimeStats.accuracy).toBe(0);
        });

        it('should handle empty recent accuracy array in improvement trend', () => {
            store.dispatch(recordGameResult({
                wins: 1,
                losses: 0,
                pushes: 0,
                surrenders: 0,
                blackjacks: 0,
                busts: 0
            }));

            const state = store.getState().session;

            expect(state.currentSession.improvementTrend).toBe(0);
        });

        it('should handle removing non-existent mistake pattern', () => {
            store.dispatch(removeMistakePattern('non-existent-scenario'));

            const state = store.getState().session;

            expect(state.mistakePatterns).toHaveLength(0);
        });

        it('should handle setting max history entries to 0', () => {
            store.dispatch(addHistoryEntry(createMockGameHistoryEntry()));
            store.dispatch(setMaxHistoryEntries(0));

            const state = store.getState().session;

            expect(state.maxHistoryEntries).toBe(0);
            expect(state.gameHistory).toHaveLength(0);
        });
    });
});
