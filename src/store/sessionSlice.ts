import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SessionState, SessionStatistics, GameHistoryEntry, MistakePattern, ActionHistoryEntry } from '../types/session';

const createInitialSession = (): SessionStatistics => ({
  sessionId: `session-${Date.now()}`,
  sessionStart: Date.now(),
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
});

const initialState: SessionState = {
  currentSession: createInitialSession(),
  gameHistory: [],
  allTimeStats: createInitialSession(),
  mistakePatterns: [],
  skillLevel: 'BEGINNER',
  maxHistoryEntries: 100,
  trackingEnabled: true,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    // Session management
    startNewSession: (state) => {
      state.currentSession = createInitialSession();
    },

    endCurrentSession: (state) => {
      state.currentSession.sessionEnd = Date.now();

      // Update all-time stats
      state.allTimeStats.handsPlayed += state.currentSession.handsPlayed;
      state.allTimeStats.decisionsTotal += state.currentSession.decisionsTotal;
      state.allTimeStats.decisionsCorrect += state.currentSession.decisionsCorrect;
      state.allTimeStats.wins += state.currentSession.wins;
      state.allTimeStats.losses += state.currentSession.losses;
      state.allTimeStats.pushes += state.currentSession.pushes;
      state.allTimeStats.surrenders += state.currentSession.surrenders;
      state.allTimeStats.blackjacks += state.currentSession.blackjacks;
      state.allTimeStats.busts += state.currentSession.busts;

      // Recalculate all-time accuracy
      if (state.allTimeStats.decisionsTotal > 0) {
        state.allTimeStats.accuracy = (state.allTimeStats.decisionsCorrect / state.allTimeStats.decisionsTotal) * 100;
      }
    },

    // Decision tracking
    recordDecision: (state, action: PayloadAction<{
      wasCorrect: boolean;
      playerAction: string;
      optimalAction: string;
      scenario: {
        playerValue: number;
        dealerUpcard: number;
        tableType: string;
      };
    }>) => {
      const { wasCorrect, playerAction, optimalAction, scenario } = action.payload;

      // Update decision counters
      state.currentSession.decisionsTotal += 1;
      if (wasCorrect) {
        state.currentSession.decisionsCorrect += 1;
      }

      // Recalculate accuracy
      state.currentSession.accuracy = (state.currentSession.decisionsCorrect / state.currentSession.decisionsTotal) * 100;

      // Track mistake patterns
      if (!wasCorrect) {
        const mistakeKey = `${scenario.playerValue}-${scenario.dealerUpcard}-${scenario.tableType}`;
        const existingMistake = state.mistakePatterns.find(m =>
          m.scenario === mistakeKey
        );

        if (existingMistake) {
          existingMistake.frequency += 1;
          existingMistake.lastOccurrence = Date.now();
        } else {
          state.mistakePatterns.push({
            scenario: mistakeKey,
            playerValue: scenario.playerValue,
            dealerUpcard: scenario.dealerUpcard,
            tableType: scenario.tableType,
            playerAction,
            correctAction: optimalAction,
            frequency: 1,
            lastOccurrence: Date.now(),
          });
        }
      }
    },

    // Game outcome tracking
    recordGameResult: (state, action: PayloadAction<{
      wins: number;
      losses: number;
      pushes: number;
      surrenders: number;
      blackjacks: number;
      busts: number;
    }>) => {
      const { wins, losses, pushes, surrenders, blackjacks, busts } = action.payload;

      state.currentSession.handsPlayed += 1;
      state.currentSession.wins += wins;
      state.currentSession.losses += losses;
      state.currentSession.pushes += pushes;
      state.currentSession.surrenders += surrenders;
      state.currentSession.blackjacks += blackjacks;
      state.currentSession.busts += busts;

      // Update recent accuracy (last 10 hands)
      state.currentSession.recentAccuracy.push(state.currentSession.accuracy);
      if (state.currentSession.recentAccuracy.length > 10) {
        state.currentSession.recentAccuracy.shift();
      }

      // Calculate improvement trend
      if (state.currentSession.recentAccuracy.length >= 5) {
        const recent = state.currentSession.recentAccuracy.slice(-5);
        const older = state.currentSession.recentAccuracy.slice(-10, -5);
        if (older.length > 0) {
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
          state.currentSession.improvementTrend = recentAvg - olderAvg;
        }
      }
    },

    // Game history
    addHistoryEntry: (state, action: PayloadAction<GameHistoryEntry>) => {
      state.gameHistory.unshift(action.payload); // Add to beginning

      // Limit history size
      if (state.gameHistory.length > state.maxHistoryEntries) {
        state.gameHistory = state.gameHistory.slice(0, state.maxHistoryEntries);
      }
    },

    // History management
    clearHistory: (state) => {
      state.gameHistory = [];
    },

    setMaxHistoryEntries: (state, action: PayloadAction<number>) => {
      state.maxHistoryEntries = action.payload;

      // Trim history if necessary
      if (state.gameHistory.length > action.payload) {
        state.gameHistory = state.gameHistory.slice(0, action.payload);
      }
    },

    // Mistake pattern management
    clearMistakePatterns: (state) => {
      state.mistakePatterns = [];
    },

    removeMistakePattern: (state, action: PayloadAction<string>) => {
      state.mistakePatterns = state.mistakePatterns.filter(
        pattern => pattern.scenario !== action.payload
      );
    },

    // Skill level assessment
    updateSkillLevel: (state) => {
      const accuracy = state.currentSession.accuracy;
      const handsPlayed = state.currentSession.handsPlayed;

      if (handsPlayed >= 20) {
        if (accuracy >= 90) {
          state.skillLevel = 'ADVANCED';
        } else if (accuracy >= 75) {
          state.skillLevel = 'INTERMEDIATE';
        } else {
          state.skillLevel = 'BEGINNER';
        }
      }
    },

    // Settings
    setTrackingEnabled: (state, action: PayloadAction<boolean>) => {
      state.trackingEnabled = action.payload;
    },

    // Reset all data
    resetAllData: (state) => {
      return {
        ...initialState,
        currentSession: createInitialSession(),
      };
    },

    // Import data (for restore functionality)
    importSessionData: (state, action: PayloadAction<{
      gameHistory: GameHistoryEntry[];
      mistakePatterns: MistakePattern[];
      allTimeStats: SessionStatistics;
    }>) => {
      const { gameHistory, mistakePatterns, allTimeStats } = action.payload;
      state.gameHistory = gameHistory;
      state.mistakePatterns = mistakePatterns;
      state.allTimeStats = allTimeStats;
    },
  },
});

export const {
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
} = sessionSlice.actions;

export { sessionSlice };
export default sessionSlice.reducer;
