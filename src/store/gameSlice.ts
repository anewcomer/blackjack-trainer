import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { GameState, PlayerHand, Card, ActionType, ActionLogEntry, HandOutcome } from '../types/game';

const initialState: GameState = {
  // Core Game State
  deck: [],
  playerHands: [],
  currentHandIndex: 0,
  dealerHand: {
    cards: [],
    handValue: 0,
    isSoft: false,
    hideHoleCard: true,
  },
  gamePhase: 'INITIAL',
  
  // Game Rules and Options
  canSurrender: true,
  doubleAfterSplit: true,
  maxSplitHands: 4,
  dealerHitsSoft17: true,
  
  // Current Turn State
  availableActions: [],
  lastAction: null,
  
  // Hand Resolution
  gameResult: null,
  handInProgress: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Game initialization
    initializeGame: (state) => {
      return { ...initialState };
    },
    
    // Deck management
    setDeck: (state, action: PayloadAction<Card[]>) => {
      state.deck = action.payload;
    },
    
    // Deal initial cards
    dealInitialCards: (state, action: PayloadAction<{ playerCards: Card[], dealerCards: Card[] }>) => {
      const { playerCards, dealerCards } = action.payload;
      
      // Create initial player hand
      state.playerHands = [{
        id: 'hand-0',
        cards: playerCards,
        busted: false,
        stood: false,
        doubled: false,
        splitFromPair: false,
        surrendered: false,
        isBlackjack: false,
        outcome: null,
        actionLog: [],
        handValue: 0,
        isSoft: false,
      }];
      
      // Set dealer hand
      state.dealerHand = {
        cards: dealerCards,
        handValue: 0,
        isSoft: false,
        hideHoleCard: true,
      };
      
      state.gamePhase = 'PLAYER_TURN';
      state.currentHandIndex = 0;
      state.handInProgress = true;
    },
    
    // Player actions
    playerHit: (state, action: PayloadAction<{ handIndex: number, card: Card }>) => {
      const { handIndex, card } = action.payload;
      const hand = state.playerHands[handIndex];
      if (hand) {
        hand.cards.push(card);
        // Hand value calculation will be done by selectors/utilities
      }
    },
    
    playerStand: (state, action: PayloadAction<{ handIndex: number }>) => {
      const { handIndex } = action.payload;
      const hand = state.playerHands[handIndex];
      if (hand) {
        hand.stood = true;
      }
    },
    
    playerDouble: (state, action: PayloadAction<{ handIndex: number, card: Card }>) => {
      const { handIndex, card } = action.payload;
      const hand = state.playerHands[handIndex];
      if (hand) {
        hand.cards.push(card);
        hand.doubled = true;
        hand.stood = true; // Double automatically ends the hand
      }
    },
    
    playerSplit: (state, action: PayloadAction<{ handIndex: number, newCards: Card[] }>) => {
      const { handIndex, newCards } = action.payload;
      const originalHand = state.playerHands[handIndex];
      
      if (originalHand && originalHand.cards.length === 2) {
        // Create new hand from the second card
        const newHand: PlayerHand = {
          id: `hand-${state.playerHands.length}`,
          cards: [originalHand.cards[1], newCards[1]],
          busted: false,
          stood: false,
          doubled: false,
          splitFromPair: true,
          surrendered: false,
          isBlackjack: false,
          outcome: null,
          actionLog: [],
          handValue: 0,
          isSoft: false,
        };
        
        // Update original hand
        originalHand.cards = [originalHand.cards[0], newCards[0]];
        originalHand.splitFromPair = true;
        
        // Insert new hand after the current one
        state.playerHands.splice(handIndex + 1, 0, newHand);
      }
    },
    
    playerSurrender: (state, action: PayloadAction<{ handIndex: number }>) => {
      const { handIndex } = action.payload;
      const hand = state.playerHands[handIndex];
      if (hand) {
        hand.surrendered = true;
        hand.outcome = 'SURRENDER';
      }
    },
    
    // Game state management
    setCurrentHandIndex: (state, action: PayloadAction<number>) => {
      state.currentHandIndex = action.payload;
    },
    
    setGamePhase: (state, action: PayloadAction<GameState['gamePhase']>) => {
      state.gamePhase = action.payload;
    },
    
    setAvailableActions: (state, action: PayloadAction<ActionType[]>) => {
      state.availableActions = action.payload;
    },
    
    // Hand value updates (from utilities)
    updateHandValues: (state, action: PayloadAction<{ 
      playerHands: Array<{ index: number, value: number, isSoft: boolean, isBlackjack: boolean, busted: boolean }>,
      dealerValue: number,
      dealerIsSoft: boolean
    }>) => {
      const { playerHands, dealerValue, dealerIsSoft } = action.payload;
      
      // Update player hands
      playerHands.forEach(({ index, value, isSoft, isBlackjack, busted }) => {
        if (state.playerHands[index]) {
          state.playerHands[index].handValue = value;
          state.playerHands[index].isSoft = isSoft;
          state.playerHands[index].isBlackjack = isBlackjack;
          state.playerHands[index].busted = busted;
        }
      });
      
      // Update dealer hand
      state.dealerHand.handValue = dealerValue;
      state.dealerHand.isSoft = dealerIsSoft;
    },
    
    // Dealer actions
    revealDealerHoleCard: (state) => {
      state.dealerHand.hideHoleCard = false;
    },
    
    dealerHit: (state, action: PayloadAction<Card>) => {
      state.dealerHand.cards.push(action.payload);
    },
    
    // Action logging
    logAction: (state, action: PayloadAction<ActionLogEntry>) => {
      const hand = state.playerHands[state.currentHandIndex];
      if (hand) {
        hand.actionLog.push(action.payload);
      }
      state.lastAction = action.payload;
    },
    
    // Game resolution
    setHandOutcomes: (state, action: PayloadAction<Array<{ handIndex: number, outcome: HandOutcome }>>) => {
      action.payload.forEach(({ handIndex, outcome }) => {
        if (state.playerHands[handIndex]) {
          state.playerHands[handIndex].outcome = outcome;
        }
      });
    },
    
    setGameResult: (state, action: PayloadAction<GameState['gameResult']>) => {
      state.gameResult = action.payload;
      state.handInProgress = false;
      state.gamePhase = 'GAME_OVER';
    },
    
    // Reset for new hand
    resetForNewHand: (state) => {
      state.deck = [];
      state.playerHands = [];
      state.currentHandIndex = 0;
      state.dealerHand = {
        cards: [],
        handValue: 0,
        isSoft: false,
        hideHoleCard: true,
      };
      state.gamePhase = 'INITIAL';
      state.availableActions = [];
      state.lastAction = null;
      state.gameResult = null;
      state.handInProgress = false;
    },
  },
});

export const {
  initializeGame,
  setDeck,
  dealInitialCards,
  playerHit,
  playerStand,
  playerDouble,
  playerSplit,
  playerSurrender,
  setCurrentHandIndex,
  setGamePhase,
  setAvailableActions,
  updateHandValues,
  revealDealerHoleCard,
  dealerHit,
  logAction,
  setHandOutcomes,
  setGameResult,
  resetForNewHand,
} = gameSlice.actions;

export default gameSlice.reducer;
