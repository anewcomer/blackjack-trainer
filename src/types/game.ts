// Core game types for the Blackjack Trainer application

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // Base value (11 for Ace, 10 for face cards)
  id: string; // Unique identifier for React keys
}

export interface PlayerHand {
  id: string;
  cards: Card[];
  busted: boolean;
  stood: boolean;
  doubled: boolean;
  splitFromPair: boolean;
  surrendered: boolean;
  isBlackjack: boolean;
  outcome: HandOutcome | null;
  actionLog: ActionLogEntry[];
  handValue: number;
  isSoft: boolean; // Contains an Ace counted as 11
}

export interface DealerHand {
  cards: Card[];
  handValue: number;
  isSoft: boolean;
  hideHoleCard: boolean;
}

export type GamePhase = 'INITIAL' | 'DEALING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'GAME_OVER';

export type ActionType = 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT' | 'SURRENDER';

export type HandOutcome = 'WIN' | 'LOSS' | 'PUSH' | 'BLACKJACK' | 'SURRENDER';

export interface ActionLogEntry {
  handId: string;
  action: ActionType;
  optimalAction: ActionType;
  wasCorrect: boolean;
  handValueBefore: number;
  handValueAfter: number;
  cardDealt: Card | null;
  timestamp: number;
}

export interface GameResult {
  playerHandsCount: number;
  wins: number;
  losses: number;
  pushes: number;
  surrenders: number;
  blackjacks: number;
  busts: number;
}

export interface GameState {
  // Core Game State
  deck: Card[];
  playerHands: PlayerHand[];
  currentHandIndex: number;
  dealerHand: DealerHand;
  gamePhase: GamePhase;
  
  // Game Rules and Options
  canSurrender: boolean;
  doubleAfterSplit: boolean;
  maxSplitHands: number;
  dealerHitsSoft17: boolean;
  
  // Current Turn State
  availableActions: ActionType[];
  lastAction: ActionLogEntry | null;
  
  // Hand Resolution
  gameResult: GameResult | null;
  handInProgress: boolean;
}

export interface ActionResult {
  success: boolean;
  message: string;
  newCard?: Card;
  handCompleted: boolean;
}
