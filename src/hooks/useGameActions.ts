import { useCallback } from 'react';
import { 
  Card, 
  PlayerHand, 
  ActionLogEntry, 
  HighlightParams 
} from '../logic';
import { 
  calculateHandValue, 
  dealOneCard, 
  createNewDeck, 
  shuffleDeck 
} from '../logic';
import { getOptimalPlay } from '../logic/blackjackStrategy';
import { getStrategyKeysForHighlight } from '../logic/blackjackStrategy';
import { dealerPlayLogic } from '../logic/blackjackDealer';

import { 
  Card, 
  PlayerHand, 
  ActionLogEntry, 
  HighlightParams 
} from '../logic';
import { 
  calculateHandValue, 
  dealOneCard, 
  createNewDeck, 
  shuffleDeck 
} from '../logic';
import { getOptimalPlay } from '../logic/blackjackStrategy';
import { getStrategyKeysForHighlight } from '../logic/blackjackStrategy';
import { dealerPlayLogic } from '../logic/blackjackDealer';
import { parseQueryParams, updateUrlWithGameState, shouldAutoPlayDealer } from '../logic/utils/queryParamsUtils';

/**
 * Interface for the game state required by useGameActions
 */
interface GameStateForActions {
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
  currentRoundDealerActionsLog: any[]; 
  setCurrentRoundDealerActionsLog: React.Dispatch<React.SetStateAction<any[]>>;
}

/**
 * Hook for game action handlers
 * 
 * @param gameState The current game state
 * @returns Game actions like hit, stand, double, etc.
 */
export const useGameActions = (gameState: GameStateForActions) => {
  // Destructure the game state
  const {
    deck,
    setDeck,
    playerHands,
    setPlayerHands,
    currentHandIndex,
    setCurrentHandIndex,
    dealerHand,
    setDealerHand,
    setGameActive,
    setMessage,
    setHideDealerFirstCard,
    canSurrenderGlobal,
    setCanSurrenderGlobal,
    setHighlightParams,
    currentRoundDealerActionsLog,
    setCurrentRoundDealerActionsLog,
  } = gameState;

  /**
   * Determines the outcome of the game
   */
  const determineGameOutcome = useCallback((isInitialBlackjackRound: boolean = false, playerHadInitialBlackjack: boolean = false) => {
    console.log("==== DETERMINING GAME OUTCOME ====");
    console.log("Parameters:", { 
      isInitialBlackjackRound, 
      playerHadInitialBlackjack
    });
    
    // Make sure we have valid data
    if (!dealerHand || !dealerHand.length) {
      console.error("Invalid dealer hand when determining outcome:", dealerHand);
      return;
    }
    
    if (!playerHands || !playerHands.length) {
      console.error("Invalid player hands when determining outcome:", playerHands);
      return;
    }
    
    console.log("Current game state:", {
      dealerHand: dealerHand.map(c => `${c.rank}${c.suit}`),
      playerHands: playerHands.map(h => ({
        cards: h.cards.map(c => `${c.rank}${c.suit}`),
        value: calculateHandValue(h.cards),
        outcome: h.outcome,
        isBlackjack: h.isBlackjack,
        busted: h.busted,
        stood: h.stood
      }))
    });

    const finalDealerValue = calculateHandValue(dealerHand);
    const dealerBusted = finalDealerValue > 21;
    const dealerHasBlackjack = finalDealerValue === 21 && dealerHand.length === 2;
    
    console.log(`Dealer final value: ${finalDealerValue}, busted: ${dealerBusted}, blackjack: ${dealerHasBlackjack}`);
    
    // Create outcome data for each hand
    const updatedPlayerHands: PlayerHand[] = playerHands.map(hand => {
      let handOutcome: PlayerHand['outcome'] = hand.outcome; // Preserve if already set (e.g. surrender, initial BJ)
      
      if (!handOutcome) { // Only determine if not already set
        const playerValue = calculateHandValue(hand.cards);
        console.log(`Player hand value: ${playerValue}, dealer value: ${finalDealerValue}`);
        
        if (hand.busted) {
          console.log("Player busted, outcome is Loss");
          handOutcome = "Loss";
        }
        else if (dealerBusted) {
          console.log("Dealer busted, outcome is Win");
          handOutcome = "Win";
        }
        else if (playerValue > finalDealerValue) {
          console.log(`Player value ${playerValue} > dealer value ${finalDealerValue}, outcome is Win`);
          handOutcome = "Win";
        }
        else if (playerValue < finalDealerValue) {
          console.log(`Player value ${playerValue} < dealer value ${finalDealerValue}, outcome is Loss`);
          handOutcome = "Loss";
        }
        else {
          console.log(`Player value ${playerValue} = dealer value ${finalDealerValue}, outcome is Push`);
          handOutcome = "Push";
        }
      }
      
      return { ...hand, outcome: handOutcome };
    });

    // Create more visually-focused outcome message
    let outcomeMessage = '';
    let totalWins = 0;
    let totalLosses = 0;
    let totalPushes = 0;
    
    updatedPlayerHands.forEach(hand => {
      if (hand.outcome === "Win") totalWins++;
      else if (hand.outcome === "Loss") totalLosses++;
      else if (hand.outcome === "Push") totalPushes++;
    });
    
    // Create a friendly summary message
    if (updatedPlayerHands.length === 1) {
      const outcome = updatedPlayerHands[0].outcome;
      
      if (outcome === "Win") {
        outcomeMessage = updatedPlayerHands[0].isBlackjack ? "Blackjack! You win!" : "You win!";
      } else if (outcome === "Loss") {
        if (updatedPlayerHands[0].busted) outcomeMessage = "Busted! Dealer wins.";
        else if (updatedPlayerHands[0].surrendered) outcomeMessage = "You surrendered.";
        else outcomeMessage = "Dealer wins.";
      } else {
        outcomeMessage = "Push! It's a tie.";
      }
    } else {
      // Multiple hands summary
      outcomeMessage = `Results: ${totalWins} wins, ${totalLosses} losses, ${totalPushes} pushes`;
    }

    // Set all states in logical order
    setPlayerHands(updatedPlayerHands);
    setMessage(outcomeMessage);
    setGameActive(false);
    
    // dealerHand.length is automatically included in the dependency array through dealerHand
  }, [dealerHand, playerHands, setPlayerHands, setMessage, setGameActive]);

  /**
   * Advances to the next unresolved hand or triggers the dealer's turn
   */
  const advanceOrDealerTurn = useCallback((
    handsOverride?: PlayerHand[], 
    forceDealerTurn: boolean = false
  ) => {
    console.log("advanceOrDealerTurn called, checking if all hands resolved", 
      { forceDealerTurn, handsOverrideProvided: !!handsOverride });
    
    // Create a local copy to prevent closure issues - use override if provided
    const currentPlayerHands = handsOverride || [...playerHands];
    const allResolved = forceDealerTurn || 
      currentPlayerHands.every((h: PlayerHand) => h.busted || h.stood || h.surrendered);
    
    console.log("All hands resolved?", allResolved);
    console.log("Current hands status:", currentPlayerHands.map(h => ({
      busted: h.busted,
      stood: h.stood,
      surrendered: h.surrendered,
      outcome: h.outcome,
      isBlackjack: h.isBlackjack
    })));
    
    // Check if any hand already has an outcome (e.g., from blackjack)
    const anyHandHasOutcome = currentPlayerHands.some(h => h.outcome !== null);
    if (anyHandHasOutcome) {
      console.log("Game outcome already determined, skipping dealer play");
      return; // Skip dealer play if the outcome was already determined
    }
    
    // Batch state updates to prevent flickering
    if (allResolved) {
      // All hands are resolved, go to dealer's turn
      console.log("All hands resolved, starting dealer's turn");
      
      // Set message and reveal dealer's hole card
      setMessage("Dealer's turn");
      setHideDealerFirstCard(false);
      
      // Force update to ensure state is current
      setPlayerHands([...currentPlayerHands]);
      
      // Log the current dealer hand before play
      console.log("Dealer hand before play:", dealerHand.map(c => `${c.rank}${c.suit}`));
      console.log("Dealer value before play:", calculateHandValue(dealerHand));
      
      // First, ensure the dealer's hole card is revealed immediately
      setHideDealerFirstCard(false);
      
      // Use a more reliable approach with multiple timeouts to ensure state updates are applied
      window.setTimeout(() => {
        console.log("Preparing dealer play logic...");
        
        // Double-check that the state actually changed
        if (gameState.hideDealerFirstCard) {
          console.log("WARNING: Dealer card still hidden, forcing reveal");
          setHideDealerFirstCard(false);
        }
        
        // Now start dealer play after another short delay
        window.setTimeout(() => {
          console.log("Starting dealer play logic now");
          
          try {
            // Use the imported dealerPlayLogic directly with the LATEST state
            // This is critical - we must use the current state, not captured variables
            dealerPlayLogic(
              [...dealerHand], // Get fresh copies
              [...deck],
              [...currentRoundDealerActionsLog],
              setHideDealerFirstCard,
              setMessage,
              setDealerHand,
              setDeck,
              setCurrentRoundDealerActionsLog,
              determineGameOutcome
            );
          } catch (error) {
            console.error("Error during dealer play:", error);
            console.error(error);
            // Fall back to determine outcome in case of error
            determineGameOutcome(false, false);
          }
        }, 500);
      }, 500);
    } else {
      // Find next unresolved hand
      const nextIdx = playerHands.findIndex((h: PlayerHand, i: number) => i > currentHandIndex && !h.busted && !h.stood && !h.surrendered);
      
      if (nextIdx !== -1) {
        // Batch these state updates together
        setCurrentHandIndex(nextIdx);
        setMessage(`Your move - Hand ${nextIdx + 1}`);
      } else {
        const firstIdx = playerHands.findIndex((h: PlayerHand) => !h.busted && !h.stood && !h.surrendered);
        if (firstIdx !== -1) {
          // Batch these state updates together
          setCurrentHandIndex(firstIdx);
          setMessage(`Your move - Hand ${firstIdx + 1}`);
        }
      }
    }
  }, [playerHands, dealerHand, deck, currentRoundDealerActionsLog, setHideDealerFirstCard, setMessage, setDealerHand, setDeck, setCurrentRoundDealerActionsLog, currentHandIndex, setCurrentHandIndex, determineGameOutcome, gameState.hideDealerFirstCard, setPlayerHands]);

  /**
   * Logs player's action along with the optimal play
   */
  const logPlayerAction = useCallback((
    handIndex: number, 
    action: string, 
    cardDealt: Card | null = null, 
    newPlayerHands: PlayerHand[] = [...playerHands]
  ) => {
    // Get optimal play for the current hand situation
    // Note: We're assuming the first dealer card is the one that's visible when hideDealerFirstCard is true
    const dealerUpCard = gameState.hideDealerFirstCard && gameState.dealerHand.length > 1 
      ? gameState.dealerHand[1]  // If first card is hidden, use second card
      : gameState.dealerHand[0]; // Otherwise use first card
      
    const optimalPlay = getOptimalPlay(
      newPlayerHands[handIndex].cards, 
      dealerUpCard, // Pass the single dealer up card, not the whole hand
      gameState.hideDealerFirstCard,
      newPlayerHands[handIndex].splitFromPair,
      newPlayerHands.length > 1
    );
    const wasCorrect = action === optimalPlay;
    
    // Highlight the correct strategy box
    try {
      console.log("Getting highlight keys for strategy guide");
      // Make sure we're passing the full dealer hand for correct highlighting
      // The key issue is that we need to always pass the entire dealer hand
      // and let getStrategyKeysForHighlight determine which card to use
      const highlightKeys = getStrategyKeysForHighlight(
        newPlayerHands[handIndex],
        gameState.dealerHand, // Pass the entire dealer hand
        gameState.hideDealerFirstCard
      );
      console.log("Setting highlightParams:", highlightKeys);
      setHighlightParams({...highlightKeys}); // Force new object to trigger state update
    } catch (error) {
      console.error("Error setting highlight keys:", error);
    }
    
    // Create a log entry for the action
    const handValueBefore = calculateHandValue(newPlayerHands[handIndex].cards);
    
    // Add the action to the hand's log
    const logEntry: ActionLogEntry = {
      playerAction: action,
      optimalAction: optimalPlay,
      wasCorrect,
      handValueBefore,
      handValueAfter: handValueBefore, // Will be updated after card is added if applicable
      cardDealt: null // Will be filled in later if a card is dealt
    };
    
    newPlayerHands[handIndex] = {
      ...newPlayerHands[handIndex],
      actionsTakenLog: [...newPlayerHands[handIndex].actionsTakenLog, logEntry]
    };
    
    return { wasCorrect, newPlayerHands };
  }, [playerHands, gameState.dealerHand, gameState.hideDealerFirstCard, setHighlightParams]);

  /**
   * Handler for starting a new game
   */
  const newGameHandler = useCallback(() => {
    // Create a new deck and shuffle it
    const newDeck = shuffleDeck(createNewDeck());
    console.log("New game started with shuffled deck");
    
    // Check for query parameters
    const { dealerCards, playerCards } = parseQueryParams();
    
    // Variables to store our cards and final deck
    let playerCard1: Card, playerCard2: Card;
    let dealerCard1: Card, dealerCard2: Card;
    let finalDeck = newDeck;
    
    if (dealerCards && dealerCards.length >= 2 && playerCards && playerCards.length >= 2) {
      // Use cards from query parameters
      console.log("Using cards from query parameters");
      
      // Extract dealer cards
      dealerCard1 = dealerCards[0]; // Hole card
      dealerCard2 = dealerCards[1]; // Up card
      console.log(`Using dealer cards from URL: ${dealerCard1.rank}${dealerCard1.suit}, ${dealerCard2.rank}${dealerCard2.suit}`);
      
      // Extract player cards
      playerCard1 = playerCards[0];
      playerCard2 = playerCards[1];
      console.log(`Using player cards from URL: ${playerCard1.rank}${playerCard1.suit}, ${playerCard2.rank}${playerCard2.suit}`);
      
      // Remove these cards from the deck to avoid duplicates
      finalDeck = finalDeck.filter(card => 
        !(card.rank === dealerCard1.rank && card.suit === dealerCard1.suit) && 
        !(card.rank === dealerCard2.rank && card.suit === dealerCard2.suit) &&
        !(card.rank === playerCard1.rank && card.suit === playerCard1.suit) &&
        !(card.rank === playerCard2.rank && card.suit === playerCard2.suit)
      );
      
      // Update the URL to reflect the current game state
      updateUrlWithGameState([dealerCard1, dealerCard2], [playerCard1, playerCard2]);
    } else {
      // Deal cards normally
      console.log("Dealing cards normally (no valid query parameters)");
      
      const { card: pCard1, updatedDeck: deck1 } = dealOneCard(newDeck);
      playerCard1 = pCard1;
      console.log(`Dealt player card 1: ${playerCard1.rank}${playerCard1.suit}`);
      
      const { card: dCard1, updatedDeck: deck2 } = dealOneCard(deck1);
      dealerCard1 = dCard1;
      console.log(`Dealt dealer card 1 (hole card): ${dealerCard1.rank}${dealerCard1.suit}`);
      
      const { card: pCard2, updatedDeck: deck3 } = dealOneCard(deck2);
      playerCard2 = pCard2;
      console.log(`Dealt player card 2: ${playerCard2.rank}${playerCard2.suit}`);
      
      const { card: dCard2, updatedDeck: finalUpdatedDeck } = dealOneCard(deck3);
      dealerCard2 = dCard2;
      finalDeck = finalUpdatedDeck;
      console.log(`Dealt dealer card 2 (up card): ${dealerCard2.rank}${dealerCard2.suit}`);
      
      // Update the URL with the dealt cards
      updateUrlWithGameState([dealerCard1, dealerCard2], [playerCard1, playerCard2]);
    }
    
    // Handle additional cards from query parameters if present
    // The original query param parsing already happened at the beginning of the function
    // so we can use existing dealerCards and playerCards variables
    let additionalPlayerCards: Card[] = [];
    let additionalDealerCards: Card[] = [];
    
    // Get additional player cards beyond the first two
    if (playerCards && playerCards.length > 2) {
      additionalPlayerCards = playerCards.slice(2);
      console.log(`Using ${additionalPlayerCards.length} additional player cards from URL`);
      
      // Remove these cards from the deck
      for (const card of additionalPlayerCards) {
        finalDeck = finalDeck.filter(c => 
          !(c.rank === card.rank && c.suit === card.suit)
        );
      }
    }
    
    // Get additional dealer cards beyond the first two
    if (dealerCards && dealerCards.length > 2) {
      additionalDealerCards = dealerCards.slice(2);
      console.log(`Using ${additionalDealerCards.length} additional dealer cards from URL`);
      
      // Remove these cards from the deck
      for (const card of additionalDealerCards) {
        finalDeck = finalDeck.filter(c => 
          !(c.rank === card.rank && c.suit === card.suit)
        );
      }
    }
    
    // Create player hand with all cards
    const allPlayerCards = [playerCard1, playerCard2, ...additionalPlayerCards];
    
    // Create initial player hand
    const initialPlayerHand: PlayerHand = {
      cards: allPlayerCards,
      busted: false,
      stood: false,
      doubled: false,
      splitFromPair: false,
      surrendered: false,
      isBlackjack: false,
      outcome: null,
      initialCardsForThisHand: [playerCard1, playerCard2], // Only the initial two cards
      actionsTakenLog: []
    };

    // Create dealer hand with all cards
    const allDealerCards = [dealerCard1, dealerCard2, ...additionalDealerCards];

    const playerValue = calculateHandValue(allPlayerCards);
    const dealerValue = calculateHandValue(allDealerCards);
    const playerBlackjack = playerValue === 21 && allPlayerCards.length === 2;
    
    // Auto-stand if the player has 21+ (for test scenarios with many cards)
    if (playerValue >= 21 && additionalPlayerCards.length > 0) {
      initialPlayerHand.stood = true;
      if (playerValue > 21) {
        initialPlayerHand.busted = true;
      }
    }
    
    // Update all game state
    setDeck(finalDeck);
    setPlayerHands([initialPlayerHand]);
    setDealerHand(allDealerCards);
    setCurrentHandIndex(0);
    setGameActive(true);
    setHideDealerFirstCard(true);
    setCanSurrenderGlobal(true);
    setCurrentRoundDealerActionsLog([]);
    
    // Check for blackjack scenarios
    console.log("Checking initial blackjack scenarios:");
    console.log(`Player cards: ${allPlayerCards.map(c => c.rank + c.suit).join(', ')} = ${playerValue}`);
    console.log(`Dealer cards: ${allDealerCards.map(c => c.rank + c.suit).join(', ')} = ${dealerValue}`);
    
    const playerHasBlackjack = playerValue === 21 && initialPlayerHand.cards.length === 2;
    const dealerHasBlackjack = dealerValue === 21 && dealerHand.length === 2;
    
    console.log(`Player blackjack: ${playerHasBlackjack}, Dealer blackjack: ${dealerHasBlackjack}`);
    
    if (playerHasBlackjack || dealerHasBlackjack) {
      // Always reveal dealer's first card in blackjack scenarios
      setHideDealerFirstCard(false);
      
      // Create updated player hand with appropriate outcome
      let updatedPlayerHand: PlayerHand;
      let outcomeMessage: string;
      
      if (playerHasBlackjack && dealerHasBlackjack) {
        // Both have blackjack
        console.log("OUTCOME: Both have blackjack - Push");
        outcomeMessage = "Both have Blackjack! Push!";
        updatedPlayerHand = {
          ...initialPlayerHand,
          outcome: "Push",
          stood: true,
          isBlackjack: true
        };
      } else if (playerHasBlackjack) {
        // Player has blackjack
        console.log("OUTCOME: Player has blackjack - Win");
        outcomeMessage = "Blackjack! You win!";
        updatedPlayerHand = {
          ...initialPlayerHand,
          outcome: "Win",
          stood: true,
          isBlackjack: true
        };
      } else {
        // Dealer has blackjack
        console.log("OUTCOME: Dealer has blackjack - Loss");
        outcomeMessage = "Dealer has Blackjack! You lose.";
        updatedPlayerHand = {
          ...initialPlayerHand,
          outcome: "Loss",
          stood: true
        };
      }
      
      // Update state in a more reliable way
      setPlayerHands([updatedPlayerHand]);
      setMessage(outcomeMessage);
      
      // End the game since we have an immediate outcome
      determineGameOutcome(true, playerBlackjack);
    } else if (shouldAutoPlayDealer([initialPlayerHand])) {
      // Auto-play the dealer's turn for debug/test scenarios
      console.log("Auto-playing dealer's turn for debug scenario");
      setHideDealerFirstCard(false);
      setMessage("Dealer's turn (auto-play)");
      
      // Import the dealer logic and immediately play the dealer's turn
      const { dealerPlayLogic } = require('../logic/blackjackDealer');
      
      // Schedule dealer play to allow UI to update first
      setTimeout(() => {
        dealerPlayLogic(
          allDealerCards,
          finalDeck,
          [],
          setHideDealerFirstCard,
          setMessage,
          setDealerHand,
          setDeck,
          setCurrentRoundDealerActionsLog,
          determineGameOutcome
        );
      }, 800);
    } else {
      // Regular game - player's turn
      setMessage("Your move");
      
      // Set up strategy guide highlight for this situation
      const highlightKeys = getStrategyKeysForHighlight(
        initialPlayerHand, 
        [dealerCard2], // Dealer's upcard is the second card in a new game
        true // hideDealerFirstCard is true at this point
      );
      setHighlightParams(highlightKeys);
    }
    
    return {
      deck: finalDeck,
      playerHands: [initialPlayerHand],
      dealerHand: allDealerCards,
      setDeck, setPlayerHands, setDealerHand, setCurrentHandIndex, setGameActive,
      setHideDealerFirstCard, setCanSurrenderGlobal, setMessage, setHighlightParams,
      setCurrentRoundDealerActionsLog, determineGameOutcome
    };
  }, [setDeck, setPlayerHands, setDealerHand, setCurrentHandIndex, setMessage, setGameActive, setHideDealerFirstCard, setCanSurrenderGlobal, setCurrentRoundDealerActionsLog, determineGameOutcome, setHighlightParams, dealerHand.length]);

  /**
   * Handler for player hitting (taking another card)
   */
  const hitHandler = useCallback(() => {
    // Make sure this isn't called in an invalid game state
    if (!playerHands[currentHandIndex] || playerHands[currentHandIndex].busted) {
      return;
    }
    
    // Get the next card and updated deck
    const { card, updatedDeck } = dealOneCard(deck);
    setDeck(updatedDeck);
    
    // Log the player's action with the optimal play
    const { newPlayerHands: updatedHandsWithLog } = logPlayerAction(
      currentHandIndex,
      'Hit',
      card,
      [...playerHands]
    );
    
    // Add the card to the current hand
    const playerHand = updatedHandsWithLog[currentHandIndex];
    const updatedCards = [...playerHand.cards, card];
    const handValue = calculateHandValue(updatedCards);
    const busted = handValue > 21;
    
    // Update the hand with the new card and status
    updatedHandsWithLog[currentHandIndex] = {
      ...playerHand,
      cards: updatedCards,
      busted,
      // Update the last action log entry with the card and new hand value
      actionsTakenLog: playerHand.actionsTakenLog.map((log, idx) => {
        if (idx === playerHand.actionsTakenLog.length - 1) {
          return {
            ...log,
            cardDealt: card,
            handValueAfter: handValue
          };
        }
        return log;
      })
    };
    
    // Update the player hands state
    setPlayerHands(updatedHandsWithLog);
    
    if (busted) {
      setMessage("Busted! Value over 21");
      // Proceed to next hand or dealer's turn after a short delay
      setTimeout(() => {
        console.log("Hit handler timeout - triggering advance with updated state");
        advanceOrDealerTurn(updatedHandsWithLog);
      }, 1000);
    }
  }, [currentHandIndex, deck, playerHands, setDeck, setPlayerHands, 
      advanceOrDealerTurn, setMessage, logPlayerAction]);

  /**
   * Handler for player standing (no more cards)
   */
  const standHandler = useCallback(() => {
    // Make sure this isn't called in an invalid game state
    if (!playerHands[currentHandIndex] || playerHands[currentHandIndex].stood) {
      return;
    }
    
    // Log the player's action with the optimal play
    const { newPlayerHands } = logPlayerAction(
      currentHandIndex,
      'Stand',
      null,
      [...playerHands]
    );
    
    // Mark the hand as stood
    newPlayerHands[currentHandIndex] = {
      ...newPlayerHands[currentHandIndex],
      stood: true
    };
    
    // Update player hands state
    setPlayerHands(newPlayerHands);
    
    // Proceed to next hand or dealer's turn with a flag to ensure we're using the latest state
    // This is critical to prevent stale state issues with the async setState
    setTimeout(() => {
      console.log("Stand handler timeout - force dealer turn with updated state");
      // Force dealer's turn by directly passing the updated state to the function
      const forceDealerTurn = true;
      advanceOrDealerTurn(newPlayerHands, forceDealerTurn);
    }, 500);
  }, [currentHandIndex, playerHands, setPlayerHands, 
      advanceOrDealerTurn, logPlayerAction]);

  /**
   * Handler for player doubling down (double bet, take exactly one more card, then stand)
   */
  const doubleHandler = useCallback(() => {
    // Make sure this isn't called in an invalid game state
    if (!playerHands[currentHandIndex] || 
        playerHands[currentHandIndex].busted || 
        playerHands[currentHandIndex].cards.length !== 2) {
      return;
    }
    
    // Get the next card and updated deck
    const { card, updatedDeck } = dealOneCard(deck);
    setDeck(updatedDeck);
    
    // Log the player's action with the optimal play
    const { newPlayerHands } = logPlayerAction(
      currentHandIndex,
      'Double',
      card,
      [...playerHands]
    );
    
    // Add the card to the current hand
    const playerHand = newPlayerHands[currentHandIndex];
    const updatedCards = [...playerHand.cards, card];
    const handValue = calculateHandValue(updatedCards);
    const busted = handValue > 21;
    
    // Update the hand with the new card and status
    newPlayerHands[currentHandIndex] = {
      ...playerHand,
      cards: updatedCards,
      doubled: true,
      stood: true, // After doubling, player's turn for this hand is over
      busted,
      // Update the last action log entry with the card and new hand value
      actionsTakenLog: playerHand.actionsTakenLog.map((log, idx) => {
        if (idx === playerHand.actionsTakenLog.length - 1) {
          return {
            ...log,
            cardDealt: card,
            handValueAfter: handValue
          };
        }
        return log;
      })
    };
    
    // Update the player hands state
    setPlayerHands(newPlayerHands);
    
    if (busted) {
      setMessage("Doubled and busted! Value over 21");
    } else {
      setMessage(`Doubled with ${handValue}`);
    }
    
    // Proceed to next hand or dealer's turn with fresh state
    setTimeout(() => {
      console.log("Double handler timeout - triggering advance with updated state");
      advanceOrDealerTurn(newPlayerHands, true); // Force dealer's turn since this hand is done
    }, 1000);
  }, [currentHandIndex, deck, playerHands, setDeck, setPlayerHands, 
      advanceOrDealerTurn, setMessage, logPlayerAction]);

  /**
   * Handler for player splitting a pair
   */
  const splitHandler = useCallback(() => {
    // Check if hand can be split: must have 2 cards of same rank
    const currentHand = playerHands[currentHandIndex];
    
    if (!currentHand || currentHand.cards.length !== 2) {
      return;
    }
    
    const [card1, card2] = currentHand.cards;
    if (card1.rank !== card2.rank) {
      return;
    }
    
    // Get two new cards and update deck
    const { card: newCard1, updatedDeck: deck1 } = dealOneCard(deck);
    const { card: newCard2, updatedDeck: deck2 } = dealOneCard(deck1);
    
    // Log the player's action with the optimal play
    logPlayerAction(
      currentHandIndex,
      'Split',
      null,
      [...playerHands] 
    );
    
    // Create two new hands from the split pair
    const hand1: PlayerHand = {
      cards: [card1, newCard1],
      busted: false,
      stood: false,
      doubled: false,
      splitFromPair: true,
      surrendered: false,
      isBlackjack: false,
      outcome: null,
      initialCardsForThisHand: [card1],
      actionsTakenLog: []
    };
    
    const hand2: PlayerHand = {
      cards: [card2, newCard2],
      busted: false,
      stood: false,
      doubled: false,
      splitFromPair: true,
      surrendered: false,
      isBlackjack: false,
      outcome: null,
      initialCardsForThisHand: [card2],
      actionsTakenLog: []
    };
    
    // Check for Aces special rule (typically they get one card and then stand)
    if (card1.rank === 'A') {
      hand1.stood = true;
      hand2.stood = true;
      setMessage('Split Aces receive one card each and then stand');
    } else {
      setMessage('Pair split into two hands');
    }
    
    // Create the new player hands array by replacing the current hand with the two new hands
    const updatedHands = [
      ...playerHands.slice(0, currentHandIndex),
      hand1,
      hand2,
      ...playerHands.slice(currentHandIndex + 1)
    ];
    
    // Update game state
    setDeck(deck2);
    setPlayerHands(updatedHands);
    
    // Highlight strategy for the next hand
    const dealerUpCard = gameState.dealerHand[gameState.hideDealerFirstCard ? 1 : 0];
    const highlightKeys = getStrategyKeysForHighlight(hand1, [dealerUpCard], gameState.hideDealerFirstCard);
    setHighlightParams(highlightKeys);
    
    // Proceed to play the first of the split hands
    if (card1.rank === 'A') {
      // For split Aces, both hands are automatically stood, so move on
      setTimeout(() => {
        console.log("Split aces handler timeout - triggering advance with updated state");
        advanceOrDealerTurn(updatedHands);
      }, 1000);
    }
  }, [currentHandIndex, deck, playerHands, setDeck, setPlayerHands, 
      advanceOrDealerTurn, logPlayerAction, setMessage, setHighlightParams,
      gameState.dealerHand, gameState.hideDealerFirstCard]);

  /**
   * Handler for player surrendering (give up half the bet and end hand)
   */
  const surrenderHandler = useCallback(() => {
    // Can only surrender on first action (i.e., with original 2 cards)
    if (!canSurrenderGlobal || 
        !playerHands[currentHandIndex] || 
        playerHands[currentHandIndex].cards.length !== 2) {
      return;
    }
    
    // Log the player's action with the optimal play
    const { newPlayerHands } = logPlayerAction(
      currentHandIndex,
      'Surrender',
      null,
      [...playerHands]
    );
    
    // Mark the current hand as surrendered
    newPlayerHands[currentHandIndex] = {
      ...newPlayerHands[currentHandIndex],
      surrendered: true,
      outcome: 'Loss' // Surrender counts as a loss
    };
    
    // Update player hands state
    setPlayerHands(newPlayerHands);
    setMessage('Hand surrendered');
    
    // After any action, surrender is no longer available
    setCanSurrenderGlobal(false);
    
    // Proceed to next hand or dealer's turn with updated state
    setTimeout(() => {
      console.log("Surrender handler timeout - triggering advance with updated state");
      advanceOrDealerTurn(newPlayerHands);
    }, 500);
  }, [currentHandIndex, playerHands, canSurrenderGlobal, setPlayerHands, 
      advanceOrDealerTurn, setMessage, setCanSurrenderGlobal, logPlayerAction]);

  /**
   * Computed properties for UI controls
   */
  const currentHand = playerHands[currentHandIndex];
  
  // Player can hit if the current hand exists, isn't busted, hasn't stood, and hasn't surrendered
  const playerCanHit = !!currentHand && !currentHand.busted && !currentHand.stood && !currentHand.surrendered;
  
  // Player can stand if they can hit
  const playerCanStand = playerCanHit;
  
  // Player can double if they can hit and have exactly 2 cards in hand
  const playerCanDouble = playerCanHit && currentHand.cards.length === 2;
  
  // Player can split if they have exactly 2 cards with the same rank
  const playerCanSplit = playerCanHit && currentHand.cards.length === 2 && 
    currentHand.cards[0].rank === currentHand.cards[1].rank;
  
  // Player can surrender only on their first action
  const playerCanSurrender = playerCanHit && currentHand.cards.length === 2 && canSurrenderGlobal;

  return {
    // Game actions
    newGameHandler,
    hitHandler,
    standHandler,
    doubleHandler,
    splitHandler,
    surrenderHandler,
    
    // UI control flags
    playerCanHit,
    playerCanStand,
    playerCanDouble,
    playerCanSplit,
    playerCanSurrender
  };
};
