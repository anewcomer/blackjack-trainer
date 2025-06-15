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
    const finalDealerValue = calculateHandValue(dealerHand);
    const dealerBusted = finalDealerValue > 21;
    
    // Create outcome data for each hand
    const updatedPlayerHands: PlayerHand[] = playerHands.map(hand => {
      let handOutcome: PlayerHand['outcome'] = hand.outcome; // Preserve if already set (e.g. surrender, initial BJ)
      
      if (!handOutcome) { // Only determine if not already set
        const playerValue = calculateHandValue(hand.cards);
        
        if (hand.busted) handOutcome = "Loss";
        else if (dealerBusted) handOutcome = "Win";
        else if (playerValue > finalDealerValue) handOutcome = "Win";
        else if (playerValue < finalDealerValue) handOutcome = "Loss";
        else handOutcome = "Push";
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
  }, [dealerHand, playerHands, setPlayerHands, setMessage, setGameActive]);

  /**
   * Advances to the next unresolved hand or triggers the dealer's turn
   */
  const advanceOrDealerTurn = useCallback(() => {
    const allResolved = playerHands.every((h: PlayerHand) => h.busted || h.stood || h.surrendered);
    
    // Batch state updates to prevent flickering
    if (allResolved) {
      // All hands are resolved, go to dealer's turn
      const { dealerPlayLogic } = require('../logic/blackjackDealer');
      
      // Set message and reveal dealer's hole card
      setMessage("Dealer's turn");
      setHideDealerFirstCard(false);
      
      // Delay dealer play to allow animations to complete
      setTimeout(() => {
        dealerPlayLogic(
          dealerHand,
          deck,
          currentRoundDealerActionsLog,
          setHideDealerFirstCard,
          setMessage,
          setDealerHand,
          setDeck,
          setCurrentRoundDealerActionsLog,
          determineGameOutcome
        );
      }, 800);
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
  }, [playerHands, dealerHand, deck, currentRoundDealerActionsLog, setHideDealerFirstCard, setMessage, setDealerHand, setDeck, setCurrentRoundDealerActionsLog, currentHandIndex, setCurrentHandIndex, determineGameOutcome]);

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
    const highlightKeys = getStrategyKeysForHighlight(
      newPlayerHands[handIndex], 
      [dealerUpCard], 
      gameState.hideDealerFirstCard
    );
    setHighlightParams(highlightKeys);
    
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
    
    // Deal the initial cards
    const { card: playerCard1, updatedDeck: deck1 } = dealOneCard(newDeck);
    const { card: dealerCard1, updatedDeck: deck2 } = dealOneCard(deck1);
    const { card: playerCard2, updatedDeck: deck3 } = dealOneCard(deck2);
    const { card: dealerCard2, updatedDeck: finalDeck } = dealOneCard(deck3);
    
    // Create initial player hand
    const initialPlayerHand: PlayerHand = {
      cards: [playerCard1, playerCard2],
      busted: false,
      stood: false,
      doubled: false,
      splitFromPair: false,
      surrendered: false,
      isBlackjack: false,
      outcome: null,
      initialCardsForThisHand: [playerCard1, playerCard2],
      actionsTakenLog: []
    };

    const playerValue = calculateHandValue([playerCard1, playerCard2]);
    const dealerValue = calculateHandValue([dealerCard1, dealerCard2]);
    const playerBlackjack = playerValue === 21;
    
    // Update all game state
    setDeck(finalDeck);
    setPlayerHands([initialPlayerHand]);
    setDealerHand([dealerCard1, dealerCard2]);
    setCurrentHandIndex(0);
    setGameActive(true);
    setHideDealerFirstCard(true);
    setCanSurrenderGlobal(true);
    setCurrentRoundDealerActionsLog([]);
    
    // Check for blackjack scenarios
    if (playerBlackjack || dealerValue === 21) {
      setHideDealerFirstCard(false);
      
      if (playerBlackjack && dealerValue === 21) {
        // Both have blackjack
        setMessage("Both have Blackjack! Push!");
        setPlayerHands([{
          ...initialPlayerHand,
          outcome: "Push",
          stood: true,
          isBlackjack: true
        }]);
      } else if (playerBlackjack) {
        // Player has blackjack
        setMessage("Blackjack! You win!");
        setPlayerHands([{
          ...initialPlayerHand,
          outcome: "Win",
          stood: true,
          isBlackjack: true
        }]);
      } else {
        // Dealer has blackjack
        setMessage("Dealer has Blackjack! You lose.");
        setPlayerHands([{
          ...initialPlayerHand,
          outcome: "Loss",
          stood: true
        }]);
      }
      
      // End the game since we have an immediate outcome
      determineGameOutcome(true, playerBlackjack);
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
      dealerHand: [dealerCard1, dealerCard2],
      setDeck, setPlayerHands, setDealerHand, setCurrentHandIndex, setGameActive,
      setHideDealerFirstCard, setCanSurrenderGlobal, setMessage, setHighlightParams,
      setCurrentRoundDealerActionsLog, determineGameOutcome
    };
  }, [setDeck, setPlayerHands, setDealerHand, setCurrentHandIndex, setMessage, setGameActive, setHideDealerFirstCard, setCanSurrenderGlobal, setCurrentRoundDealerActionsLog, determineGameOutcome, setHighlightParams]);

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
      setTimeout(() => advanceOrDealerTurn(), 1000);
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
    
    // Proceed to next hand or dealer's turn
    setTimeout(() => advanceOrDealerTurn(), 500);
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
    
    // Proceed to next hand or dealer's turn
    setTimeout(() => advanceOrDealerTurn(), 1000);
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
      setTimeout(() => advanceOrDealerTurn(), 1000);
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
    
    // Proceed to next hand or dealer's turn
    setTimeout(() => advanceOrDealerTurn(), 500);
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
