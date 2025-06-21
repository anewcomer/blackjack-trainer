// Session and history types for the Blackjack Trainer application

export interface SessionStatistics {
  // Session Tracking
  sessionId: string;
  sessionStart: number;
  sessionEnd: number | null;
  
  // Game Statistics
  handsPlayed: number;
  
  // Decision Tracking
  decisionsTotal: number;
  decisionsCorrect: number;
  accuracy: number;
  
  // Outcome Statistics
  wins: number;
  losses: number;
  pushes: number;
  surrenders: number;
  blackjacks: number;
  busts: number;
  
  // Learning Analytics
  recentAccuracy: number[]; // Last 10 hands accuracy
  improvementTrend: number; // Positive/negative trend
}

export interface GameHistoryEntry {
  id: string;
  timestamp: number;
  sessionId: string;
  
  // Initial Deal
  initialPlayerCards: string[];
  initialDealerCard: string;
  
  // Hand Progression
  playerHands: HandHistoryEntry[];
  dealerFinalHand: string[];
  dealerFinalValue: number;
  
  // Outcomes
  finalResult: {
    wins: number;
    losses: number;
    pushes: number;
    surrenders: number;
  };
  
  // Strategy Analysis
  totalDecisions: number;
  correctDecisions: number;
  handAccuracy: number;
  
  // Notable Events
  hadBlackjack: boolean;
  hadSplits: boolean;
  hadDoubles: boolean;
  hadSurrender: boolean;
}

export interface HandHistoryEntry {
  handId: string;
  handIndex: number;
  
  // Hand Details
  finalCards: string[];
  finalValue: number;
  wasSoft: boolean;
  
  // Actions Taken
  actions: ActionHistoryEntry[];
  
  // Hand Outcome
  outcome: string;
  wasSplit: boolean;
  wasDoubled: boolean;
  wasSurrendered: boolean;
  wasBusted: boolean;
  wasBlackjack: boolean;
}

export interface ActionHistoryEntry {
  action: string;
  optimalAction: string;
  wasCorrect: boolean;
  cardReceived: string | null;
  handValueBefore: number;
  handValueAfter: number;
  reasoning: string;
}

export interface MistakePattern {
  scenario: string;
  playerValue: number;
  dealerUpcard: number;
  tableType: string;
  playerAction: string;
  correctAction: string;
  frequency: number;
  lastOccurrence: number;
}

export interface SessionState {
  // Current Session
  currentSession: SessionStatistics;
  
  // Historical Data
  gameHistory: GameHistoryEntry[];
  allTimeStats: SessionStatistics;
  
  // Learning Analytics
  mistakePatterns: MistakePattern[];
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  
  // Preferences
  maxHistoryEntries: number;
  trackingEnabled: boolean;
}

// Export functionality
export interface SessionExportData {
  exportDate: string;
  sessionData: SessionStatistics;
  gameHistory: GameHistoryEntry[];
  mistakePatterns: MistakePattern[];
  summary: {
    totalHands: number;
    overallAccuracy: number;
    mostCommonMistakes: MistakePattern[];
    improvementAreas: string[];
  };
}
