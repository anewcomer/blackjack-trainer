import { Card, PlayerHand } from '../blackjackTypes';
import { VALUES, calculateHandValue } from '../blackjackUtils';

/**
 * Parse query string parameters for dealer and player hands
 * 
 * Expected format:
 * - dealer=AS,2H (Ace of Spades, 2 of Hearts)
 * - player=10D,JC (10 of Diamonds, Jack of Clubs)
 * 
 * Each card is represented by its rank followed by its suit initial:
 * - Rank: A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K
 * - Suit: S (Spades ♠), H (Hearts ♥), D (Diamonds ♦), C (Clubs ♣)
 * 
 * @returns Object containing parsed cards or null if not present
 */
export const parseQueryParams = (): {
  dealerCards: Card[] | null;
  playerCards: Card[] | null;
} => {
  // Get the URL search params
  const urlParams = new URLSearchParams(window.location.search);
  
  // Default result
  const result: {
    dealerCards: Card[] | null;
    playerCards: Card[] | null;
  } = {
    dealerCards: null,
    playerCards: null
  };
  
  // Parse dealer cards if present
  const dealerParam = urlParams.get('dealer');
  if (dealerParam) {
    const cards = parseCardString(dealerParam);
    if (cards.length > 0) {
      result.dealerCards = cards;
    }
  }
  
  // Parse player cards if present
  const playerParam = urlParams.get('player');
  if (playerParam) {
    const cards = parseCardString(playerParam);
    if (cards.length > 0) {
      result.playerCards = cards;
    }
  }
  
  return result;
};

/**
 * Parse a string representation of cards into Card objects
 * Format: "AS,10D,QH" -> [Ace of Spades, 10 of Diamonds, Queen of Hearts]
 */
const parseCardString = (cardsString: string): Card[] => {
  const cards: Card[] = [];
  
  // Split the string by commas
  const cardCodes = cardsString.split(',');
  
  for (const cardCode of cardCodes) {
    // Skip empty codes
    if (!cardCode.trim()) continue;
    
    // Parse the card code
    const parsedCard = parseCardCode(cardCode.trim());
    if (parsedCard) {
      cards.push(parsedCard);
    }
  }
  
  return cards;
};

/**
 * Parse a single card code like "AS" into a Card object
 */
const parseCardCode = (cardCode: string): Card | null => {
  // The last character is the suit
  const suit = cardCode.slice(-1).toUpperCase();
  
  // Everything before the last character is the rank
  const rank = cardCode.slice(0, -1).toUpperCase();
  
  // Validate the rank and suit
  if (!isValidRank(rank) || !isValidSuit(suit)) {
    console.error(`Invalid card code: ${cardCode}`);
    return null;
  }
  
  // Map the suit code to the actual suit symbol
  const suitSymbol = getSuitSymbol(suit);
  
  // Return the card object
  return {
    rank,
    suit: suitSymbol,
    value: VALUES[rank],
    id: `${rank}-${suitSymbol}-query-${Math.random().toString(36).substr(2, 9)}`
  };
};

/**
 * Check if a rank is valid
 */
const isValidRank = (rank: string): boolean => {
  // Valid ranks: A, 2-10, J, Q, K
  return rank === 'A' || 
         rank === 'J' || 
         rank === 'Q' || 
         rank === 'K' || 
         (Number(rank) >= 2 && Number(rank) <= 10);
};

/**
 * Check if a suit code is valid
 */
const isValidSuit = (suit: string): boolean => {
  // Valid suits: S, H, D, C
  return ['S', 'H', 'D', 'C'].includes(suit);
};

/**
 * Convert a suit code to its symbol
 */
const getSuitSymbol = (suit: string): string => {
  switch (suit) {
    case 'S': return '♠';
    case 'H': return '♥';
    case 'D': return '♦';
    case 'C': return '♣';
    default: return '♠'; // Default to spades as fallback
  }
};

/**
 * Update the URL with the current game state without reloading the page
 */
export const updateUrlWithGameState = (dealerCards: Card[], playerCards: Card[]): void => {
  // Get current URL without the query string
  const baseUrl = window.location.href.split('?')[0];
  
  // Create the new query string
  const dealerParam = dealerCards.map(card => `${card.rank}${getSuitCode(card.suit)}`).join(',');
  const playerParam = playerCards.map(card => `${card.rank}${getSuitCode(card.suit)}`).join(',');
  
  // Construct the new URL
  const newUrl = `${baseUrl}?dealer=${dealerParam}&player=${playerParam}`;
  
  // Update the URL without refreshing the page
  window.history.replaceState({}, document.title, newUrl);
};

/**
 * Convert a suit symbol to its code
 */
const getSuitCode = (suitSymbol: string): string => {
  switch (suitSymbol) {
    case '♠': return 'S';
    case '♥': return 'H';
    case '♦': return 'D';
    case '♣': return 'C';
    default: return 'S'; // Default to spades as fallback
  }
};

/**
 * Determines if the dealer should automatically play based on the state of the game
 * Generally used for debug scenarios where we want to immediately see the outcome
 */
export const shouldAutoPlayDealer = (playerHands: PlayerHand[]): boolean => {
  // If all player hands are stood, busted, or have 21+, auto-play the dealer's turn
  return playerHands.every(hand => 
    hand.stood || hand.busted || calculateHandValue(hand.cards) >= 21
  );
};
