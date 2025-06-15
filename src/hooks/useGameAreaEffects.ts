import { useState, useEffect, useRef } from 'react';
import { Card as CardType } from '../logic/game/cardTypes';
import { ActionLogEntry } from '../logic/game/gameTypes';
import { useBlackjack } from '../context/BlackjackContext';

/**
 * Hook to manage animations and visual feedback for the game area
 */
export function useGameAreaEffects() {
  const {
    dealerHand,
    playerHands,
    currentHandIndex,
    hideDealerFirstCard,
    gameActive,
    message
  } = useBlackjack();

  // Track previously rendered cards to detect new ones for animations
  const prevDealerHandRef = useRef<CardType[]>([]);
  const prevPlayerHandRef = useRef<CardType[]>([]);
  
  // State to track newly added cards for animations
  const [newDealerCards, setNewDealerCards] = useState<string[]>([]);
  const [newPlayerCards, setNewPlayerCards] = useState<string[]>([]);

  // State for visual feedback effects
  const [playerFlash, setPlayerFlash] = useState<'correct' | 'mistake' | null>(null);
  const [activeArea, setActiveArea] = useState<'player' | 'dealer' | null>(null);
  const [winnerArea, setWinnerArea] = useState<'player' | 'dealer' | 'push' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Get the recent action from the current player hand if available
  const recentAction: ActionLogEntry | undefined = playerHands[currentHandIndex]?.actionsTakenLog?.slice(-1)[0];

  // Effect to determine active play area
  useEffect(() => {
    if (!gameActive) {
      setActiveArea(null);
      return;
    }

    if (hideDealerFirstCard) {
      setActiveArea('player');
    } else {
      setActiveArea('dealer');
    }
  }, [gameActive, hideDealerFirstCard]);

  // Effect to show feedback on player decisions
  useEffect(() => {
    if (recentAction) {
      setPlayerFlash(recentAction.wasCorrect ? 'correct' : 'mistake');
      
      // Reset flash after a short delay
      const timer = setTimeout(() => {
        setPlayerFlash(null);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [recentAction]);

  // Effect to display outcome at end of hand
  useEffect(() => {
    if (!gameActive && playerHands.length > 0) {
      const currentHand = playerHands[currentHandIndex];
      
      if (currentHand) {
        if (currentHand.outcome === 'Win') {
          setWinnerArea('player');
          setStatusMessage('Player wins!');
        } else if (currentHand.outcome === 'Loss') {
          setWinnerArea('dealer');
          setStatusMessage('Dealer wins!');
        } else if (currentHand.outcome === 'Push') {
          setWinnerArea('push');
          setStatusMessage('Push!');
        }
      }
    } else {
      setWinnerArea(null);
      setStatusMessage(null);
    }
  }, [gameActive, playerHands, currentHandIndex]);

  // Message parsing for status display
  useEffect(() => {
    if (message && !statusMessage) {
      // Show strategic advice or important game messages
      if (message.includes('Correct:') || message.includes('Mistake!')) {
        setStatusMessage(message);
        const timer = setTimeout(() => {
          setStatusMessage(null);
        }, 3000);
        return () => clearTimeout(timer);
      }
      
      if (message.includes('Blackjack')) {
        setStatusMessage(message);
      }
    }
  }, [message, statusMessage]);

  // Effect to detect new dealer cards for animation
  useEffect(() => {
    if (dealerHand.length > prevDealerHandRef.current.length) {
      const newCards = dealerHand
        .filter((card: CardType) => !prevDealerHandRef.current.some(prevCard => prevCard.id === card.id))
        .map((card: CardType) => card.id);
      
      setNewDealerCards(newCards);
      
      // Reset animation flags after a delay
      const timer = setTimeout(() => {
        setNewDealerCards([]);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    prevDealerHandRef.current = dealerHand;
  }, [dealerHand]);
  
  // Effect to detect new player cards for animation
  useEffect(() => {
    const currentHand = playerHands[currentHandIndex]?.cards || [];
    const prevHand = prevPlayerHandRef.current;
    
    if (currentHand.length > prevHand.length) {
      const newCards = currentHand
        .filter((card: CardType) => !prevHand.some(prevCard => prevCard.id === card.id))
        .map((card: CardType) => card.id);
      
      setNewPlayerCards(newCards);
      
      // Reset animation flags after a delay
      const timer = setTimeout(() => {
        setNewPlayerCards([]);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    prevPlayerHandRef.current = currentHand;
  }, [playerHands, currentHandIndex]);

  return {
    newDealerCards,
    newPlayerCards,
    playerFlash,
    activeArea,
    winnerArea,
    statusMessage
  };
}
