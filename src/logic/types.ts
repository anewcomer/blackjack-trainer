// DEPRECATED: Use '../logic/blackjackTypes' for all type imports. This file is obsolete and should not be used.

// Core type and interface definitions for Blackjack Trainer

export interface Card {
  rank: string;
  suit: string;
  value: number;
  id: string;
}

export interface ActionLogEntry {
  playerAction: string;
  optimalAction: string;
  wasCorrect: boolean;
  handValueBefore: number;
  handValueAfter: number;
  cardDealt: Card | null;
}

export interface PlayerHand {
  cards: Card[];
  busted: boolean;
  stood: boolean;
  doubled: boolean;
  splitFromPair: boolean;
  surrendered: boolean;
  isBlackjack: boolean;
  outcome: 'Win' | 'Loss' | 'Push' | null;
  initialCardsForThisHand: Card[];
  actionsTakenLog: ActionLogEntry[];
}

export interface DealerActionLogEntry {
  action: string;
  handValueBefore: number;
  handValueAfter: number;
  cardDealt?: Card | null;
}

export interface SessionStats {
  correctMoves: number;
  incorrectMoves: number;
  totalDecisions: number;
  wins: number;
  losses: number;
  pushes: number;
  handsPlayed: number;
}

export interface PlayerHandHistoryForModal {
  initialCards: string;
  actions: Array<{
    action: string;
    optimal: string;
    correct: boolean;
    valueBefore: number;
    valueAfter: number;
    cardDealt: string | null;
  }>;
  finalCards: string;
  finalScore: number;
  outcome: 'Win' | 'Loss' | 'Push' | null;
  busted: boolean;
  surrendered: boolean;
  isBlackjack: boolean;
}

export interface GameHistoryEntry {
  id: number;
  timestamp: string;
  playerHands: PlayerHandHistoryForModal[];
  dealerUpCard: string;
  dealerHoleCard: string;
  dealerActions: Array<{
    action: string;
    valueBefore: number;
    valueAfter: number;
    cardDealt: string | null;
  }>;
  dealerFinalCards: string;
  dealerFinalScore: number;
  dealerBusted: boolean;
  dealerBlackjackOnInit: boolean;
  playerBlackjackOnInit: boolean;
}

export interface HighlightParams {
  type: 'hard' | 'soft' | 'pairs' | null;
  playerKey: string | null;
  dealerKey: string | null;
}

export interface BlackjackGameHook {
  playerHands: PlayerHand[];
  currentHandIndex: number;
  dealerHand: Card[];
  gameActive: boolean;
  message: string;
  hideDealerFirstCard: boolean;
  highlightParams: HighlightParams;
  gameHistory: GameHistoryEntry[];
  showHistoryModal: boolean;
  sessionStats: SessionStats;
  newGameHandler: () => void;
  hitHandler: () => Promise<{ success: boolean; message: string }>;
  standHandler: () => void;
  doubleHandler: () => void;
  splitHandler: () => void;
  surrenderHandler: () => void;
  showHistoryHandler: () => void;
  closeHistoryModalHandler: () => void;
  resetSessionStats: () => void;
  getHandScoreText: (handCards: Card[]) => string;
  playerCanHit: boolean;
  playerCanStand: boolean;
  playerCanDouble: boolean;
  playerCanSplit: boolean;
  playerCanSurrender: boolean;
}
