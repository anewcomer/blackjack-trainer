// Card data and game rules constants for Blackjack Trainer

export const SUITS: string[] = ['♠', '♥', '♦', '♣'];
export const RANKS: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const VALUES: { [key: string]: number } = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 10, 'A': 11 // Ace is 11 initially
};

export const GAME_RULES = {
  DEALER_STANDS_ON_SOFT_17: true, // Or false if dealer hits soft 17
  DOUBLE_AFTER_SPLIT_ALLOWED: true,
  MAX_SPLIT_HANDS: 4,
};
