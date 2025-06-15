import { 
  Card, 
  PlayerHand 
} from '../logic/blackjackTypes';
import { 
  calculateHandValue, 
  dealOneCard, 
  createNewDeck, 
  shuffleDeck 
} from '../logic/blackjackUtils';
import { parseQueryParams, updateUrlWithGameState } from '../logic/utils/queryParamsUtils';

/**
 * The new game handler function factory - creates a new game with query string support
 */
export const createNewGameHandler = (
  setDeck: React.Dispatch<React.SetStateAction<Card[]>>,
  setPlayerHands: React.Dispatch<React.SetStateAction<PlayerHand[]>>,
  setDealerHand: React.Dispatch<React.SetStateAction<Card[]>>,
  setCurrentHandIndex: React.Dispatch<React.SetStateAction<number>>,
  setGameActive: React.Dispatch<React.SetStateAction<boolean>>,
  setHideDealerFirstCard: React.Dispatch<React.SetStateAction<boolean>>,
  setCanSurrenderGlobal: React.Dispatch<React.SetStateAction<boolean>>,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  setHighlightParams: React.Dispatch<React.SetStateAction<any>>,
  setCurrentRoundDealerActionsLog: React.Dispatch<React.SetStateAction<any[]>>,
  determineGameOutcome: (isInitialBlackjackRound?: boolean, playerHadInitialBlackjack?: boolean) => void,
  getStrategyKeysForHighlight: Function,
  dealerHand: Card[]
) => {
  return function() {
    // Create a new deck and shuffle it
    const newDeck = shuffleDeck(createNewDeck());
    console.log("New game started with shuffled deck");
    
    // Check for query parameters
    const queryParams = parseQueryParams();
    const queryDealerCards = queryParams.dealerCards;
    const queryPlayerCards = queryParams.playerCards;
    
    // Variables to store our cards and final deck
    let playerCard1: Card, playerCard2: Card;
    let dealerCard1: Card, dealerCard2: Card;
    let finalDeck = newDeck;
    
    // Variables for additional cards
    let additionalPlayerCards: Card[] = [];
    let additionalDealerCards: Card[] = [];
    
    if (queryDealerCards && queryDealerCards.length >= 2 && queryPlayerCards && queryPlayerCards.length >= 2) {
      // Use cards from query parameters
      console.log("Using cards from query parameters");
      
      // Extract dealer cards
      dealerCard1 = queryDealerCards[0]; // Hole card
      dealerCard2 = queryDealerCards[1]; // Up card
      console.log(`Using dealer cards from URL: ${dealerCard1.rank}${dealerCard1.suit}, ${dealerCard2.rank}${dealerCard2.suit}`);
      
      // Extract player cards
      playerCard1 = queryPlayerCards[0];
      playerCard2 = queryPlayerCards[1];
      console.log(`Using player cards from URL: ${playerCard1.rank}${playerCard1.suit}, ${playerCard2.rank}${playerCard2.suit}`);
      
      // Get additional cards beyond the first two
      if (queryPlayerCards.length > 2) {
        additionalPlayerCards = queryPlayerCards.slice(2);
        console.log(`Using ${additionalPlayerCards.length} additional player cards from URL`);
      }
      
      if (queryDealerCards.length > 2) {
        additionalDealerCards = queryDealerCards.slice(2);
        console.log(`Using ${additionalDealerCards.length} additional dealer cards from URL`);
      }
      
      // Remove all these cards from the deck to avoid duplicates
      const allCardsToRemove = [dealerCard1, dealerCard2, playerCard1, playerCard2, ...additionalDealerCards, ...additionalPlayerCards];
      finalDeck = finalDeck.filter(card => {
        return !allCardsToRemove.some(c => c.rank === card.rank && c.suit === card.suit);
      });
      
      // Update the URL to reflect the current game state
      updateUrlWithGameState(
        [dealerCard1, dealerCard2, ...additionalDealerCards], 
        [playerCard1, playerCard2, ...additionalPlayerCards]
      );
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
    const dealerHasBlackjack = dealerValue === 21 && allDealerCards.length === 2;
    
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
  };
};
