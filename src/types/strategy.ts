// Strategy-related types for the Blackjack Trainer application

export type StrategyTableType = 'HARD' | 'SOFT' | 'PAIRS';

export type StrategyAction = 'H' | 'S' | 'D' | 'P' | 'R';

export interface StrategyCell {
  playerValue: number;
  dealerUpcard: number;
  action: StrategyAction;
  tableType: StrategyTableType;
}

export interface StrategyTable {
  type: StrategyTableType;
  title: string;
  rows: StrategyRow[];
}

export interface StrategyRow {
  playerValue: number;
  label: string;
  actions: StrategyAction[];
}

export interface StrategyDecision {
  playerHand: {
    cards: string[];
    value: number;
    isSoft: boolean;
    isPair: boolean;
  };
  dealerUpcard: number;
  availableActions: string[];
  optimalAction: StrategyAction;
  reasoning: string;
}

export interface StrategyEvaluation {
  playerAction: string;
  optimalAction: StrategyAction;
  wasCorrect: boolean;
  explanation: string;
  tableType: StrategyTableType;
  cellReference: StrategyCell;
}

// Strategy chart data structure
export interface StrategyChartData {
  hardTotals: StrategyRow[];
  softTotals: StrategyRow[];
  pairs: StrategyRow[];
}

// Legend for strategy actions
export interface StrategyLegend {
  action: StrategyAction;
  label: string;
  description: string;
  color: string;
}
