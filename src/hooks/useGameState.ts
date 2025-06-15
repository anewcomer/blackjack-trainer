import { useState } from 'react';
import { Card, PlayerHand, HighlightParams } from '../logic/blackjackTypes';
import { createNewDeck, shuffleDeck } from '../logic/blackjackUtils';

/**
 * Type definition for the game state returned by useGameState
 */
interface GameState {
  deck: Card[];
  setDeck: React.Dispatch<React.SetStateAction<Card[]>>;
  playerHands: PlayerHand[];
  setPlayerHands: React.Dispatch<React.SetStateAction<PlayerHand[]>>;
  currentHandIndex: number;
  setCurrentHandIndex: React.Dispatch<React.SetStateAction<number>>;
  dealerHand: Card[];
  setDealerHand: React.Dispatch<React.SetStateAction<Card[]>>;
  gameActive: boolean;
  setGameActive: React.Dispatch<React.SetStateAction<boolean>>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  hideDealerFirstCard: boolean;
  setHideDealerFirstCard: React.Dispatch<React.SetStateAction<boolean>>;
  canSurrenderGlobal: boolean;
  setCanSurrenderGlobal: React.Dispatch<React.SetStateAction<boolean>>;
  highlightParams: HighlightParams;
  setHighlightParams: React.Dispatch<React.SetStateAction<HighlightParams>>;
  currentRoundDealerActionsLog: any[]; // We'll define the proper type later
  setCurrentRoundDealerActionsLog: React.Dispatch<React.SetStateAction<any[]>>;
}

/**
 * Custom hook for managing the basic game state in Blackjack
 * 
 * @returns {GameState} The game state
 */
export const useGameState = (): GameState => {
  // Core game state
  const [deck, setDeck] = useState<Card[]>(shuffleDeck(createNewDeck()));
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>([]);
  const [currentHandIndex, setCurrentHandIndex] = useState<number>(0);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Click "New Game" to start.');
  const [hideDealerFirstCard, setHideDealerFirstCard] = useState<boolean>(true);
  const [canSurrenderGlobal, setCanSurrenderGlobal] = useState<boolean>(false);
  
  // Strategy highlighting
  const [highlightParams, setHighlightParams] = useState<HighlightParams>({ 
    type: null, 
    playerKey: null, 
    dealerKey: null 
  });

  // Dealer action log
  const [currentRoundDealerActionsLog, setCurrentRoundDealerActionsLog] = useState<any[]>([]);

  return {
    deck,
    setDeck,
    playerHands,
    setPlayerHands,
    currentHandIndex,
    setCurrentHandIndex,
    dealerHand,
    setDealerHand,
    gameActive,
    setGameActive,
    message,
    setMessage,
    hideDealerFirstCard,
    setHideDealerFirstCard,
    canSurrenderGlobal,
    setCanSurrenderGlobal,
    highlightParams,
    setHighlightParams,
    currentRoundDealerActionsLog,
    setCurrentRoundDealerActionsLog,
  };
};
