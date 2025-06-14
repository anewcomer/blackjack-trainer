import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import GameArea from './components/GameArea';
import Actions from './components/Actions';
import StrategyGuide from './components/StrategyGuide'; // Import StrategyGuide

// --- Card Data (moved from global scope of index.html) ---
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 10, 'A': 11 // Ace is 11 initially
};

function App() {
  const [deck, setDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState([]); // Array of hand objects: { cards: [], busted: false, stood: false, ... }
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [message, setMessage] = useState('Click "New Game" to start.');
  const [hideDealerFirstCard, setHideDealerFirstCard] = useState(true);
  const [canSurrenderGlobal, setCanSurrenderGlobal] = useState(false);
  const [highlightParams, setHighlightParams] = useState({ type: null, playerKey: null, dealerKey: null });

  // --- Core Game Logic (migrated and adapted from index.html) ---

  const calculateHandValue = useCallback((handCards) => {
    if (!handCards || handCards.length === 0) return 0;
    let value = 0;
    let numAces = 0;
    for (const card of handCards) {
        value += card.value;
        if (card.rank === 'A') {
            numAces++;
        }
    }
    while (value > 21 && numAces > 0) {
        value -= 10; // Convert an Ace from 11 to 1
        numAces--;
    }
    return value;
  }, []);

  const getHandScoreText = useCallback((handCards) => {
    if (!handCards || handCards.length === 0) return '';
    const currentScore = calculateHandValue(handCards);
    let text = `${currentScore}`;

    let hasAce = false;
    let scoreWithAllAcesAsOne = 0;
    for (const card of handCards) {
        if (card.rank === 'A') {
            hasAce = true;
            scoreWithAllAcesAsOne += 1;
        } else {
            scoreWithAllAcesAsOne += card.value;
        }
    }

    if (hasAce && currentScore > scoreWithAllAcesAsOne && currentScore <= 21) {
        text += " (Soft)";
    }
    return text;
  }, [calculateHandValue]);

  const createNewDeck = useCallback(() => {
    const newDeck = [];
    // Using a smaller deck for faster testing during development, can increase to 6 later
    for (let i = 0; i < 1; i++) { // Original: 6 decks
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                // Added unique id for React keys
                newDeck.push({ rank, suit, value: VALUES[rank], id: `${rank}-${suit}-${i}-${Math.random().toString(36).substr(2, 9)}` });
            }
        }
    }
    return newDeck;
  }, []);

  const shuffleDeck = useCallback((deckToShuffle) => {
    let shuffledDeck = [...deckToShuffle];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    return shuffledDeck;
  }, []);

  const newGameHandler = useCallback(() => {
    setMessage("Setting up new game...");
    let currentDeck = shuffleDeck(createNewDeck());

    const dealOne = (deck) => {
        if (!deck || deck.length === 0) {
            console.warn("Deck is empty, reshuffling.");
            const newFreshDeck = shuffleDeck(createNewDeck());
            const cardFromNew = newFreshDeck.pop();
            return { card: cardFromNew, deckAfterDeal: newFreshDeck };
        }
        const newDeck = [...deck];
        const card = newDeck.pop();
        return { card, deckAfterDeal: newDeck };
    };

    let card1, card2, card3, card4;
    let deckAfterDeal = currentDeck;

    ({ card: card1, deckAfterDeal } = dealOne(deckAfterDeal)); // Player card 1
    ({ card: card2, deckAfterDeal } = dealOne(deckAfterDeal)); // Dealer card 1
    ({ card: card3, deckAfterDeal } = dealOne(deckAfterDeal)); // Player card 2
    ({ card: card4, deckAfterDeal } = dealOne(deckAfterDeal)); // Dealer card 2

    const playerCards = [card1, card3].filter(Boolean);
    const dealerCards = [card2, card4].filter(Boolean);

    setDeck(deckAfterDeal);
    setPlayerHands([{
        cards: playerCards, busted: false, stood: false, doubled: false,
        splitFromPair: false, surrendered: false,
        initialCardsForThisHand: [...playerCards], actionsTakenLog: []
    }]);
    setDealerHand(dealerCards);
    setCurrentHandIndex(0);
    setGameActive(true);
    setHideDealerFirstCard(true);
    setCanSurrenderGlobal(true); // Player can surrender on first move
    setMessage("Your turn. What's your move?");
    // TODO: Implement Blackjack check immediately after deal
  }, [createNewDeck, shuffleDeck]);

  const getStrategyKeysForHighlight = useCallback((playerHandObj, dealerCards, isDealerCardHidden) => {
    if (!playerHandObj || playerHandObj.cards.length === 0 || !dealerCards || dealerCards.length === 0) {
      return { type: null, playerKey: null, dealerKey: null };
    }

    const dealerUpCard = isDealerCardHidden ? dealerCards[1] : dealerCards[0];
    if (!dealerUpCard) {
      return { type: null, playerKey: null, dealerKey: null };
    }

    const dealerRank = dealerUpCard.rank;
    let tempDealerKey = (['K', 'Q', 'J'].includes(dealerRank)) ? 'T' : dealerRank;
    if (!['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'A'].includes(tempDealerKey)) {
        tempDealerKey = null; // Invalid dealer card for strategy
    }
    const dealerKey = tempDealerKey;

    const playerCards = playerHandObj.cards;
    const numPlayerCards = playerCards.length;
    const playerValue = calculateHandValue(playerCards);

    let type = null;
    let playerKey = null;

    // 1. Check for Pairs
    if (numPlayerCards === 2 && playerCards[0].rank === playerCards[1].rank) {
      type = 'pairs';
      const rank = playerCards[0].rank;
      const rankStr = (['K', 'Q', 'J'].includes(rank)) ? 'T' : rank;
      playerKey = `${rankStr},${rankStr}`;
      const validPairKeys = ['A,A', 'T,T', '9,9', '8,8', '7,7', '6,6', '5,5', '4,4', '3,3', '2,2'];
      if (!validPairKeys.includes(playerKey)) {
        type = null; playerKey = null; // Should not happen with valid ranks
      }
    }

    // 2. Check for Soft Totals (if not a pair)
    if (!type) {
      let hasAce = false;
      let nonAceTotal = 0;
      let aceCount = 0;
      playerCards.forEach(card => {
        if (card.rank === 'A') {
          hasAce = true;
          aceCount++;
        } else {
          nonAceTotal += VALUES[card.rank];
        }
      });

      if (hasAce && playerValue > nonAceTotal + aceCount) { // Ace is counted as 11
        type = 'soft';
        const otherValue = playerValue - 11; // Value of cards other than the one Ace counted as 11
        if (otherValue >= 2 && otherValue <= 9) {
          playerKey = `A,${otherValue}`;
        } else {
          type = null; playerKey = null; // Not a standard A,2-A,9 soft hand for the chart
        }
      }
    }

    // 3. Hard Totals (if not a pair or soft)
    if (!type) {
      type = 'hard';
      if (playerValue >= 17) playerKey = '17+';
      else if (playerValue <= 7 && playerValue >= 5) playerKey = '5-7';
      else if (playerValue < 5) playerKey = '5-7'; // Treat very low totals as '5-7' (all Hit)
      else playerKey = playerValue.toString();

      const validHardKeys = ['17+', '16', '15', '14', '13', '12', '11', '10', '9', '8', '5-7'];
      if (!validHardKeys.includes(playerKey)) {
         playerKey = null; // Value doesn't map to a hard key (e.g. if logic error)
      }
    }

    return { type, playerKey, dealerKey };
  }, [calculateHandValue]);

  // Placeholder action handlers - to be implemented
  const hitHandler = () => { setMessage("Player Hits - Action not fully implemented"); setCanSurrenderGlobal(false);};
  const standHandler = () => { setMessage("Player Stands - Action not fully implemented"); setCanSurrenderGlobal(false);};
  const doubleHandler = () => { setMessage("Player Doubles - Action not fully implemented"); setCanSurrenderGlobal(false);};
  const splitHandler = () => { setMessage("Player Splits - Action not fully implemented"); setCanSurrenderGlobal(false);};
  const surrenderHandler = () => { setMessage("Player Surrenders - Action not fully implemented"); setCanSurrenderGlobal(false);};
  const showHistoryHandler = () => { setMessage("Show History - Action not fully implemented"); };

  const currentPlayerHand = playerHands.length > 0 && currentHandIndex < playerHands.length ? playerHands[currentHandIndex] : null;

  const playerCanHit = gameActive && currentPlayerHand && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered;
  const playerCanStand = gameActive && currentPlayerHand && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered;
  const playerCanDouble = gameActive && currentPlayerHand && currentPlayerHand.cards.length === 2 && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered && !currentPlayerHand.splitFromPair;
  const playerCanSplit = gameActive && currentPlayerHand && currentPlayerHand.cards.length === 2 && currentPlayerHand.cards[0]?.rank === currentPlayerHand.cards[1]?.rank && playerHands.length < 4 && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered;
  const playerCanSurrender = gameActive && currentPlayerHand && canSurrenderGlobal && currentPlayerHand.cards.length === 2 && !currentPlayerHand.splitFromPair && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered;

  useEffect(() => {
    if (gameActive && currentPlayerHand && dealerHand.length > 0 && currentPlayerHand.cards.length > 0) {
      const params = getStrategyKeysForHighlight(
        currentPlayerHand,
        dealerHand,
        hideDealerFirstCard
      );
      setHighlightParams(params);
    } else {
      // Reset highlights if game is not active or hands are not ready
      setHighlightParams({ type: null, playerKey: null, dealerKey: null });
    }
  }, [gameActive, currentPlayerHand, dealerHand, hideDealerFirstCard, getStrategyKeysForHighlight]);

  return (
    <div className="main-game-area">
      <div className="game-container">
        <h1>Blackjack Trainer</h1>
        <GameArea
          dealerHand={dealerHand}
          playerHands={playerHands}
          currentHandIndex={currentHandIndex}
          hideDealerFirstCard={hideDealerFirstCard}
          getHandScoreText={getHandScoreText}
        />
        <Actions
          onNewGame={newGameHandler}
          onHit={hitHandler} onStand={standHandler} onDouble={doubleHandler}
          onSplit={splitHandler} onSurrender={surrenderHandler} onShowHistory={showHistoryHandler}
          playerCanHit={playerCanHit} playerCanStand={playerCanStand} playerCanDouble={playerCanDouble}
          playerCanSplit={playerCanSplit} playerCanSurrender={playerCanSurrender}
        />
        <div id="message" className="message">{message}</div>
      </div>
      <StrategyGuide
        highlightType={highlightParams.type}
        highlightPlayerKey={highlightParams.playerKey}
        highlightDealerKey={highlightParams.dealerKey}
      />
    </div>
  );
}
export default App;
