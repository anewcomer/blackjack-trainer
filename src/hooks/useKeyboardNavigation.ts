import { useEffect, useCallback } from 'react';
import { useBlackjack } from '../context/BlackjackContext';

/**
 * Custom hook to handle keyboard navigation and shortcuts for the game
 * This improves accessibility by allowing users to play with keyboard only
 * 
 * @returns void
 */
export const useKeyboardNavigation = (): void => {
  const {
    hitHandler,
    standHandler,
    doubleHandler,
    splitHandler,
    surrenderHandler,
    newGameHandler,
    showHistoryHandler,
    playerCanHit,
    playerCanStand,
    playerCanDouble,
    playerCanSplit,
    playerCanSurrender,
    gameActive,
  } = useBlackjack();

  /**
   * Handle keydown events for game actions
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if focus is on an input, button, or dialog (modal) is open
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'BUTTON' ||
      document.activeElement?.tagName === 'TEXTAREA' ||
      document.querySelector('[role="dialog"][aria-modal="true"]')
    ) {
      return;
    }

    const key = e.key.toUpperCase();

    switch (key) {
      case 'H': // Hit
        if (gameActive && playerCanHit) {
          hitHandler();
          e.preventDefault();
        }
        break;
      case 'S': // Stand
        if (gameActive && playerCanStand) {
          standHandler();
          e.preventDefault();
        }
        break;
      case 'D': // Double
        if (gameActive && playerCanDouble) {
          doubleHandler();
          e.preventDefault();
        }
        break;
      case 'P': // Split
        if (gameActive && playerCanSplit) {
          splitHandler();
          e.preventDefault();
        }
        break;
      case 'R': // Surrender
        if (gameActive && playerCanSurrender) {
          surrenderHandler();
          e.preventDefault();
        }
        break;
      case 'N': // New Game
        newGameHandler();
        e.preventDefault();
        break;
      case 'I': // History
        showHistoryHandler();
        e.preventDefault();
        break;
      default:
        break;
    }
  }, [
    gameActive,
    playerCanHit,
    playerCanStand,
    playerCanDouble,
    playerCanSplit,
    playerCanSurrender,
    hitHandler,
    standHandler,
    doubleHandler,
    splitHandler,
    surrenderHandler,
    newGameHandler,
    showHistoryHandler,
  ]);

  // Set up and clean up event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardNavigation;
