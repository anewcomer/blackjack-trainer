import React, { useState, useEffect, useCallback } from 'react';

// --- Card Data (moved from App.js) ---
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 10, 'A': 11 // Ace is 11 initially
};

const GAME_RULES = {
  DEALER_STANDS_ON_SOFT_17: true, // Or false if dealer hits soft 17
  DOUBLE_AFTER_SPLIT_ALLOWED: true,
  MAX_SPLIT_HANDS: 4,
};

export const useBlackjackGame = () => {
  const [deck, setDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState([]);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [message, setMessage] = useState('Click "New Game" to start.');
  const [hideDealerFirstCard, setHideDealerFirstCard] = useState(true);
  const [canSurrenderGlobal, setCanSurrenderGlobal] = useState(false);
  const [highlightParams, setHighlightParams] = useState({ type: null, playerKey: null, dealerKey: null });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [gameHistory, setGameHistory] = useState([]); // Stores detailed round summaries
  const [currentRoundDealerActionsLog, setCurrentRoundDealerActionsLog] = useState([]);
  const [sessionStats, setSessionStats] = useState({
    correctMoves: 0, incorrectMoves: 0, totalDecisions: 0,
    wins: 0, losses: 0, pushes: 0, handsPlayed: 0
  });

  // Forward declaration for use in getOptimalPlay
  let getOptimalPlayRef = React.useRef(null);

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
    for (let i = 0; i < 1; i++) { // Using 1 deck for easier testing
        for (const suit of SUITS) {
            for (const rank of RANKS) {
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

  const dealOneCard = useCallback((currentDeck) => {
    let deckToDealFrom = [...currentDeck];
    if (deckToDealFrom.length < 20) { // Reshuffle if deck is low
        setMessage("Shuffling new deck...");
        deckToDealFrom = shuffleDeck(createNewDeck());
    }
    const card = deckToDealFrom.pop();
    return { card, updatedDeck: deckToDealFrom };
  }, [createNewDeck, shuffleDeck]);


  const logRoundToHistory = useCallback((resolvedPlayerHands, finalDealerHand, finalDealerActionsLog, dealerBlackjack, playerBlackjackOnInit) => {
    const roundEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      playerHands: resolvedPlayerHands.map(hand => ({
        initialCards: hand.initialCardsForThisHand.map(c => `${c.rank}${c.suit}`).join(', '),
        actions: hand.actionsTakenLog.map(log => ({
          action: log.playerAction,
          optimal: log.optimalAction,
          correct: log.wasCorrect,
          valueBefore: log.handValueBefore,
          valueAfter: log.handValueAfter,
          cardDealt: log.cardDealt ? `${log.cardDealt.rank}${log.cardDealt.suit}` : null
        })),
        finalCards: hand.cards.map(c => `${c.rank}${c.suit}`).join(', '),
        finalScore: calculateHandValue(hand.cards),
        outcome: hand.outcome,
        busted: hand.busted,
        surrendered: hand.surrendered,
        isBlackjack: hand.isBlackjack,
      })),
      dealerUpCard: finalDealerHand.length > 0 ? `${finalDealerHand[0].rank}${finalDealerHand[0].suit}` : 'N/A', // This should be the actual upcard shown
      dealerHoleCard: finalDealerHand.length > 1 ? `${finalDealerHand[1].rank}${finalDealerHand[1].suit}` : 'N/A',
      dealerActions: finalDealerActionsLog.map(log => ({
        action: log.action,
        valueBefore: log.handValueBefore,
        valueAfter: log.handValueAfter,
        cardDealt: log.cardDealt ? `${log.cardDealt.rank}${log.cardDealt.suit}` : null
      })),
      dealerFinalCards: finalDealerHand.map(c => `${c.rank}${c.suit}`).join(', '),
      dealerFinalScore: calculateHandValue(finalDealerHand),
      dealerBusted: calculateHandValue(finalDealerHand) > 21,
      dealerBlackjackOnInit: dealerBlackjack, // Was dealer Blackjack at the start?
      playerBlackjackOnInit: playerBlackjackOnInit, // Was player Blackjack at the start?
    };
    setGameHistory(prev => [...prev, roundEntry]);
  }, [calculateHandValue]);

  // Moved up: determineGameOutcome (used by newGameHandler, dealerPlayLogic)
  const determineGameOutcome = useCallback((isInitialBlackjackRound = false, playerHadInitialBlackjack = false) => {
    const finalDealerValue = calculateHandValue(dealerHand);
    const dealerBusted = finalDealerValue > 21;
    let finalMessages = [];

    const updatedPlayerHands = playerHands.map(hand => {
        let handOutcome = hand.outcome; // Preserve if already set (e.g. surrender, initial BJ)
        if (!handOutcome) { // Only determine if not already set
            const playerValue = calculateHandValue(hand.cards);
            if (hand.busted) handOutcome = "Loss";
            else if (dealerBusted) handOutcome = "Win";
            else if (playerValue > finalDealerValue) handOutcome = "Win";
            else if (playerValue < finalDealerValue) handOutcome = "Loss";
            else handOutcome = "Push";
        }
        finalMessages.push(`Hand ${playerHands.indexOf(hand) + 1}: ${handOutcome}`);
        return { ...hand, outcome: handOutcome };
    });

    setPlayerHands(updatedPlayerHands);
    setMessage(finalMessages.join(' | '));
    setGameActive(false);
    logRoundToHistory(updatedPlayerHands, dealerHand, currentRoundDealerActionsLog, isInitialBlackjackRound && calculateHandValue(dealerHand) === 21, playerHadInitialBlackjack);

    // Update session stats
    setSessionStats(prevStats => {
        let newWins = prevStats.wins;
        let newLosses = prevStats.losses;
        let newPushes = prevStats.pushes;
        updatedPlayerHands.forEach(hand => {
            if (hand.outcome === "Win") newWins++;
            else if (hand.outcome === "Loss") newLosses++;
            else if (hand.outcome === "Push") newPushes++;
        });
        return { ...prevStats, wins: newWins, losses: newLosses, pushes: newPushes, handsPlayed: prevStats.handsPlayed + updatedPlayerHands.length };
    });
  }, [dealerHand, playerHands, calculateHandValue, currentRoundDealerActionsLog, logRoundToHistory]);

  const newGameHandler = useCallback(() => {
    setMessage("Setting up new game...");
    let currentDeck = shuffleDeck(createNewDeck());

    const dealOne = (deck) => {
        if (!deck || deck.length === 0) {
            return dealOneCard(shuffleDeck(createNewDeck())); // Use the main dealOneCard
        }
        return dealOneCard(deck);
    };

    let card1, card2, card3, card4;
    let deckAfterDeal = currentDeck;

    ({ card: card1, deckAfterDeal } = dealOne(deckAfterDeal));
    ({ card: card2, deckAfterDeal } = dealOne(deckAfterDeal));
    ({ card: card3, deckAfterDeal } = dealOne(deckAfterDeal));
    ({ card: card4, deckAfterDeal } = dealOne(deckAfterDeal));

    const playerCards = [card1, card3].filter(Boolean);
    const dealerCards = [card2, card4].filter(Boolean);

    const initialPlayerHand = {
        cards: playerCards, busted: false, stood: false, doubled: false,
        splitFromPair: false, surrendered: false,
        isBlackjack: false, outcome: null,
        initialCardsForThisHand: [...playerCards], actionsTakenLog: [],
    };

    setDeck(deckAfterDeal);
    setPlayerHands([initialPlayerHand]);
    setDealerHand(dealerCards);
    setCurrentHandIndex(0);
    // setGameActive(true); // Will be set after BJ check or at start of player turn
    setHideDealerFirstCard(true);
    setCanSurrenderGlobal(true);
    setCurrentRoundDealerActionsLog([]);

    const playerValue = calculateHandValue(playerCards);
    const dealerValue = calculateHandValue(dealerCards);
    const playerHasBlackjack = playerValue === 21 && playerCards.length === 2;
    const dealerHasBlackjack = dealerValue === 21 && dealerCards.length === 2;

    if (playerHasBlackjack || dealerHasBlackjack) {
        setGameActive(false); // Game ends immediately
        setPlayerHands(prev => [{ ...prev[0], isBlackjack: playerHasBlackjack, stood: true }]);
        setHideDealerFirstCard(false);
        if (playerHasBlackjack && dealerHasBlackjack) {
            setMessage("Push! Both have Blackjack.");
            setPlayerHands(prev => [{ ...prev[0], outcome: "Push" }]);
        } else if (playerHasBlackjack) {
            setMessage("Blackjack! You win!");
            setPlayerHands(prev => [{ ...prev[0], outcome: "Win" }]);
        } else { // Dealer Blackjack
            setMessage("Dealer Blackjack! You lose.");
            setPlayerHands(prev => [{ ...prev[0], outcome: "Loss" }]);
        }
        determineGameOutcome(true, playerHasBlackjack); // Pass flags for initial blackjacks
    } else {
        setGameActive(true); // Game is active for player's turn
        setMessage("Your turn. What's your move?");
    }
  }, [createNewDeck, shuffleDeck, dealOneCard, calculateHandValue, determineGameOutcome]);

  // --- Strategy and Mistake Checking ---
  const getStrategyKeysForHighlight = useCallback((playerHandObj, dealerCards, isDealerCardHidden) => {
    if (!playerHandObj || playerHandObj.cards.length === 0 || !dealerCards || dealerCards.length === 0) {
      return { type: null, playerKey: null, dealerKey: null };
    }
    const dealerUpCard = isDealerCardHidden ? dealerCards[1] : dealerCards[0];
    if (!dealerUpCard) return { type: null, playerKey: null, dealerKey: null };

    const dealerRank = dealerUpCard.rank;
    let tempDealerKey = (['K', 'Q', 'J'].includes(dealerRank)) ? 'T' : dealerRank;
    if (!['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'A'].includes(tempDealerKey)) tempDealerKey = null;
    const dealerKey = tempDealerKey;

    const playerCards = playerHandObj.cards;
    const numPlayerCards = playerCards.length;
    const playerValue = calculateHandValue(playerCards);
    let type = null, playerKey = null;

    if (numPlayerCards === 2 && playerCards[0].rank === playerCards[1].rank) {
      type = 'pairs';
      const rank = playerCards[0].rank;
      const rankStr = (['K', 'Q', 'J'].includes(rank)) ? 'T' : rank;
      playerKey = `${rankStr},${rankStr}`;
      if (!['A,A', 'T,T', '9,9', '8,8', '7,7', '6,6', '5,5', '4,4', '3,3', '2,2'].includes(playerKey)) {
        type = null; playerKey = null;
      }
    } else {
      let hasAce = false, nonAceTotal = 0, aceCount = 0;
      playerCards.forEach(card => {
        if (card.rank === 'A') { hasAce = true; aceCount++; }
        else { nonAceTotal += VALUES[card.rank]; }
      });
      if (hasAce && playerValue > nonAceTotal + aceCount) {
        type = 'soft';
        const otherValue = playerValue - 11;
        if (otherValue >= 2 && otherValue <= 9) playerKey = `A,${otherValue}`;
        else { type = null; playerKey = null; }
      } else {
        type = 'hard';
        if (playerValue >= 17) playerKey = '17+';
        else if (playerValue <= 7 && playerValue >= 5) playerKey = '5-7';
        else if (playerValue < 5) playerKey = '5-7';
        else playerKey = playerValue.toString();
        if (!['17+', '16', '15', '14', '13', '12', '11', '10', '9', '8', '5-7'].includes(playerKey)) {
           playerKey = null;
        }
      }
    }
    return { type, playerKey, dealerKey };
  }, [calculateHandValue]);

  const getOptimalPlay = useCallback((playerHandCards, dealerUpCard, canSplit, canDouble, canSurrenderNow) => {
    const playerValue = calculateHandValue(playerHandCards);
    const dealerCardRank = dealerUpCard.rank;
    const dealerIsAce = dealerCardRank === 'A';
    const dealerIsTen = ['10', 'J', 'Q', 'K'].includes(dealerCardRank);

    const isPlayerPair = playerHandCards.length === 2 && playerHandCards[0].rank === playerHandCards[1].rank;
    let isPlayerSoft = false;
    if (playerHandCards.some(c => c.rank === 'A')) {
        let nonAceTotal = 0;
        let aceCount = 0;
        playerHandCards.forEach(c => {
            if (c.rank === 'A') aceCount++; else nonAceTotal += VALUES[c.rank];
        });
        if (aceCount > 0 && nonAceTotal + 11 + (aceCount - 1) === playerValue && playerValue <= 21) {
            isPlayerSoft = true;
        }
    }

    // Basic Strategy (H17, DAS - Dealer Stands on Soft 17, Double After Split allowed)
    // This is a simplified version. A full strategy chart is more complex.
    // Refer to `strategyData.js` for the actual chart data.
    // This function should ideally use the chart data. For now, a direct logic:

    if (canSurrenderNow && playerHandCards.length === 2 && !isPlayerPair) {
        if (playerValue === 16 && (dealerCardRank === '9' || dealerIsTen || dealerIsAce)) return 'R';
        if (playerValue === 15 && (dealerIsTen || dealerIsAce)) return 'R';
    }

    if (isPlayerPair && canSplit) {
        const pRank = playerHandCards[0].rank;
        if (pRank === 'A' || pRank === '8') return 'P';
        if (pRank === '10' || pRank === 'J' || pRank === 'Q' || pRank === 'K') return 'S';
        if (pRank === '9') {
            if (['7', '10', 'J', 'Q', 'K', 'A'].includes(dealerCardRank)) return 'S';
            return 'P';
        }
        if (pRank === '7') return (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 7) ? 'P' : 'H';
        if (pRank === '6') return (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 6) ? 'P' : 'H';
        if (pRank === '5') return (canDouble && VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 9) ? 'D' : 'H';
        if (pRank === '4') {
            if (GAME_RULES.DOUBLE_AFTER_SPLIT_ALLOWED && (VALUES[dealerCardRank] === 5 || VALUES[dealerCardRank] === 6)) return 'P';
            return 'H';
        }
        if (pRank === '3' || pRank === '2') {
            if (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 7) return 'P';
            return 'H';
        }
    }

    if (isPlayerSoft) {
        // const otherCardValue = playerValue - 11; // Value of non-Ace cards or Aces as 1 // This was unused
        if (playerValue >= 20) return 'S'; // A,9 or A,8+other
        if (playerValue === 19) { // A,8
             return (canDouble && VALUES[dealerCardRank] === 6 && GAME_RULES.DEALER_STANDS_ON_SOFT_17) ? 'D' : 'S';
        }
        if (playerValue === 18) { // A,7
            if (canDouble && VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 6) return 'D';
            if (VALUES[dealerCardRank] <= 8) return 'S';
            return 'H';
        }
        if (playerValue === 17) { // A,6
            if (canDouble && VALUES[dealerCardRank] >= 3 && VALUES[dealerCardRank] <= 6) return 'D';
            return 'H';
        }
        if (playerValue <= 16) { // A,5 down to A,2
            if (canDouble && VALUES[dealerCardRank] >= 4 && VALUES[dealerCardRank] <= 6 && (playerValue === 15 || playerValue === 16)) return 'D';
            if (canDouble && VALUES[dealerCardRank] >= 5 && VALUES[dealerCardRank] <= 6 && (playerValue === 13 || playerValue === 14)) return 'D';
            return 'H';
        }
    }

    // Hard Totals
    if (playerValue >= 17) return 'S';
    if (playerValue === 16 || playerValue === 15 || playerValue === 14 || playerValue === 13) {
        return (VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 6) ? 'S' : 'H';
    }
    if (playerValue === 12) return (VALUES[dealerCardRank] >= 4 && VALUES[dealerCardRank] <= 6) ? 'S' : 'H';
    if (playerValue === 11) return canDouble ? 'D' : 'H';
    if (playerValue === 10) return (canDouble && VALUES[dealerCardRank] >= 2 && VALUES[dealerCardRank] <= 9) ? 'D' : 'H';
    if (playerValue === 9) return (canDouble && VALUES[dealerCardRank] >= 3 && VALUES[dealerCardRank] <= 6) ? 'D' : 'H';
    return 'H'; // 8 or less
  }, [calculateHandValue]);

  getOptimalPlayRef.current = getOptimalPlay;

  // Define these before logPlayerAction and action handlers
  const currentPlayerHand = playerHands.length > 0 && currentHandIndex < playerHands.length ? playerHands[currentHandIndex] : null;
  const playerCanHit = gameActive && currentPlayerHand && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered;
  const playerCanStand = gameActive && currentPlayerHand && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered;
  const playerCanDouble = gameActive && currentPlayerHand && currentPlayerHand.cards.length === 2 && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered && !currentPlayerHand.splitFromPair;
  const playerCanSplit = gameActive && currentPlayerHand && currentPlayerHand.cards.length === 2 && currentPlayerHand.cards[0]?.rank === currentPlayerHand.cards[1]?.rank && playerHands.length < GAME_RULES.MAX_SPLIT_HANDS && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered;
  const playerCanSurrender = gameActive && currentPlayerHand && canSurrenderGlobal && currentPlayerHand.cards.length === 2 && !currentPlayerHand.splitFromPair && !currentPlayerHand.busted && !currentPlayerHand.stood && !currentPlayerHand.surrendered;

  // Moved up: dealerPlayLogic (used by advanceToNextHandOrDealerTurn)
  const dealerPlayLogic = useCallback(() => {
    setHideDealerFirstCard(false);
    setMessage("Dealer's turn...");
    let localDealerHand = [...dealerHand];
    let localDeck = [...deck];
    let localDealerActionsLog = [];

    // Log initial reveal if not Blackjack
    if (calculateHandValue(localDealerHand) !== 21 || localDealerHand.length > 2) {
         localDealerActionsLog.push({ action: 'Reveal', handValueBefore: calculateHandValue(localDealerHand), handValueAfter: calculateHandValue(localDealerHand) });
    }

    function performDealerHit() {
        let currentDealerValue = calculateHandValue(localDealerHand);
        if (currentDealerValue < 17 || (currentDealerValue === 17 && localDealerHand.some(c => c.rank === 'A') && !GAME_RULES.DEALER_STANDS_ON_SOFT_17 && calculateHandValue(localDealerHand.map(c => c.rank === 'A' ? {...c, value: 1} : c)) + 10 === currentDealerValue )) {
            const { card, updatedDeck } = dealOneCard(localDeck);
            localDeck = updatedDeck;
            // const handBeforeHit = [...localDealerHand]; // This was unused
            localDealerHand.push(card);
            const valueAfterHit = calculateHandValue(localDealerHand);
            localDealerActionsLog.push({ action: 'H', handValueBefore: currentDealerValue, handValueAfter: valueAfterHit, cardDealt: card });
            setDealerHand([...localDealerHand]); // Update UI
            setDeck(localDeck);

            if (valueAfterHit > 21) {
                localDealerActionsLog.push({ action: 'Bust', handValueBefore: valueAfterHit, handValueAfter: valueAfterHit });
                finalizeDealerTurn();
            } else {
                setTimeout(performDealerHit, 1000); // Next hit
            }
        } else {
            localDealerActionsLog.push({ action: 'S', handValueBefore: currentDealerValue, handValueAfter: currentDealerValue });
            finalizeDealerTurn();
        }
    }

    function finalizeDealerTurn() {
        setCurrentRoundDealerActionsLog(localDealerActionsLog);
        setDealerHand(localDealerHand); // Final update
        determineGameOutcome(false, false); // Not initial blackjacks
    }

    setTimeout(performDealerHit, 1000); // Start dealer's play
  }, [dealerHand, deck, dealOneCard, calculateHandValue, determineGameOutcome]);


  const logPlayerAction = useCallback((playerActionCode, cardDealt = null) => {
    setPlayerHands(prevPlayerHands => {
        const currentHand = prevPlayerHands[currentHandIndex];
        if (!currentHand || !dealerHand[0]) return prevPlayerHands;

        const handCardsForDecision = cardDealt ? currentHand.cards.slice(0, -1) : [...currentHand.cards];
        const handValueBefore = calculateHandValue(handCardsForDecision);
        const handValueAfter = calculateHandValue(currentHand.cards);

        const dealerUpCard = dealerHand[1] || dealerHand[0]; // dealerHand[1] is upcard if not hidden

        const optimalAction = getOptimalPlayRef.current(
            handCardsForDecision,
            dealerUpCard,
            playerCanSplit, // These should reflect capabilities *before* the action
            playerCanDouble,
            canSurrenderGlobal && currentHand.cards.length === 2 && !currentHand.splitFromPair
        );

        const wasCorrect = playerActionCode === optimalAction;

        if (wasCorrect) {
            setMessage(`Correct: ${playerActionCode}`);
        } else {
            setMessage(`Mistake! You: ${playerActionCode}, Optimal: ${optimalAction}`);
        }

        setSessionStats(s => ({
            ...s,
            totalDecisions: s.totalDecisions + 1,
            correctMoves: wasCorrect ? s.correctMoves + 1 : s.correctMoves,
            incorrectMoves: !wasCorrect ? s.incorrectMoves + 1 : s.incorrectMoves,
        }));

        const updatedHand = {
            ...currentHand,
            actionsTakenLog: [
                ...currentHand.actionsTakenLog,
                { playerAction: playerActionCode, optimalAction, wasCorrect, handValueBefore, handValueAfter, cardDealt }
            ]
        };
        const newPlayerHands = [...prevPlayerHands];
        newPlayerHands[currentHandIndex] = updatedHand;
        return newPlayerHands;
    });
    setCanSurrenderGlobal(false);
  }, [currentHandIndex, dealerHand, playerCanSplit, playerCanDouble, canSurrenderGlobal, calculateHandValue]);


  const advanceToNextHandOrDealerTurn = useCallback(() => {
    let nextIndex = -1;
    for (let i = currentHandIndex + 1; i < playerHands.length; i++) {
        if (!playerHands[i].stood && !playerHands[i].busted && !playerHands[i].surrendered) {
            nextIndex = i;
            break;
        }
    }

    if (nextIndex !== -1) {
        setCurrentHandIndex(nextIndex);
        setMessage(`Playing Hand ${nextIndex + 1}. Your move.`);
        setCanSurrenderGlobal(playerHands[nextIndex].cards.length === 2 && !playerHands[nextIndex].splitFromPair);
    } else {
        dealerPlayLogic();
    }
  }, [currentHandIndex, playerHands, dealerPlayLogic]);


  const hitHandler = useCallback(() => {
    if (!gameActive || !playerCanHit) return;
    const { card, updatedDeck } = dealOneCard(deck);
    setDeck(updatedDeck);
    setPlayerHands(prev => {
        const newHands = [...prev];
        const currentHand = { ...newHands[currentHandIndex] };
        currentHand.cards = [...currentHand.cards, card];
        newHands[currentHandIndex] = currentHand;
        return newHands;
    });
    logPlayerAction('H', card); // Log after state update that adds card

    // Check bust/21 after logging, as logPlayerAction uses pre-action state for optimal play
    // Need to use a timeout or useEffect to react to playerHands update for bust check
    // For now, let's assume playerHands is updated for the check below
    // This is tricky due to async nature of setState. A better way is to calculate value directly.
    const newHandValue = calculateHandValue([...playerHands[currentHandIndex].cards, card]);

    if (newHandValue > 21) {
        setPlayerHands(prev => prev.map((h, i) => i === currentHandIndex ? { ...h, busted: true, stood: true } : h));
        setMessage(`Hand ${currentHandIndex + 1} Busted!`);
        setTimeout(() => advanceToNextHandOrDealerTurn(), 50); // Timeout to allow state to settle
    } else if (newHandValue === 21) {
        setPlayerHands(prev => prev.map((h, i) => i === currentHandIndex ? { ...h, stood: true } : h));
        setTimeout(() => advanceToNextHandOrDealerTurn(), 50);
    }
  }, [gameActive, playerCanHit, deck, dealOneCard, currentHandIndex, logPlayerAction, advanceToNextHandOrDealerTurn, playerHands, calculateHandValue]);

  const standHandler = useCallback(() => {
    if (!gameActive || !playerCanStand) return;
    logPlayerAction('S');
    setPlayerHands(prev => prev.map((h, i) => i === currentHandIndex ? { ...h, stood: true } : h));
    advanceToNextHandOrDealerTurn();
  }, [gameActive, playerCanStand, currentHandIndex, logPlayerAction, advanceToNextHandOrDealerTurn]);

  const doubleHandler = useCallback(() => {
    if (!gameActive || !playerCanDouble) return;
    const { card, updatedDeck } = dealOneCard(deck);
    setDeck(updatedDeck);
    setPlayerHands(prev => {
        const newHands = [...prev];
        const currentHand = { ...newHands[currentHandIndex] };
        currentHand.cards = [...currentHand.cards, card];
        currentHand.doubled = true;
        currentHand.stood = true; // Player stands after double
        if (calculateHandValue(currentHand.cards) > 21) {
            currentHand.busted = true;
        }
        newHands[currentHandIndex] = currentHand;
        return newHands;
    });
    logPlayerAction('D', card);
    advanceToNextHandOrDealerTurn();
  }, [gameActive, playerCanDouble, deck, dealOneCard, currentHandIndex, logPlayerAction, advanceToNextHandOrDealerTurn, calculateHandValue]);

  const surrenderHandler = useCallback(() => {
    if (!gameActive || !playerCanSurrender) return;
    logPlayerAction('R');
    setPlayerHands(prev => prev.map((h, i) => i === currentHandIndex ? { ...h, surrendered: true, stood: true, outcome: "Loss" } : h));
    advanceToNextHandOrDealerTurn();
  }, [gameActive, playerCanSurrender, currentHandIndex, logPlayerAction, advanceToNextHandOrDealerTurn]);

  const splitHandler = useCallback(() => {
    if (!gameActive || !playerCanSplit) return;

    logPlayerAction('P'); // Log split decision for the original hand

    setPlayerHands(prevPlayerHands => {
        const hands = [...prevPlayerHands];
        const handToSplit = hands[currentHandIndex];
        const card1 = handToSplit.cards[0];
        const card2 = handToSplit.cards[1];

        let { card: newCardForHand1, updatedDeck: deckAfterCard1 } = dealOneCard(deck);
        let { card: newCardForHand2, updatedDeck: deckAfterCard2 } = dealOneCard(deckAfterCard1);
        setDeck(deckAfterCard2);

        const firstSplitHand = {
            ...handToSplit, // carry over initial bet etc. if implemented
            cards: [card1, newCardForHand1],
            splitFromPair: true,
            doubled: false, stood: false, busted: false, surrendered: false, isBlackjack: false, outcome: null,
            initialCardsForThisHand: [card1, newCardForHand1], // New initial cards
            actionsTakenLog: [] // Reset actions log for this new hand
        };

        const secondSplitHand = {
            ...handToSplit,
            cards: [card2, newCardForHand2],
            splitFromPair: true,
            doubled: false, stood: false, busted: false, surrendered: false, isBlackjack: false, outcome: null,
            initialCardsForThisHand: [card2, newCardForHand2],
            actionsTakenLog: []
        };

        // Handle Aces - usually only one card and stand
        if (card1.rank === 'A') {
            firstSplitHand.stood = true;
            secondSplitHand.stood = true;
        }

        hands.splice(currentHandIndex, 1, firstSplitHand, secondSplitHand);
        return hands;
    });

    // After splitting, the game continues with the first of the split hands (at currentHandIndex)
    // unless it was split Aces which auto-stand.
    // If Aces were split, advance. Otherwise, the current hand is now the first split hand.
    if (playerHands[currentHandIndex].cards[0].rank === 'A') {
         advanceToNextHandOrDealerTurn();
    } else {
        setMessage(`Playing Hand ${currentHandIndex + 1} (Split). Your move.`);
        setCanSurrenderGlobal(false); // Cannot surrender after split generally
    }
  }, [gameActive, playerCanSplit, currentHandIndex, deck, dealOneCard, logPlayerAction, advanceToNextHandOrDealerTurn, playerHands]);


  const showHistoryHandler = useCallback(() => { setShowHistoryModal(true); }, []);
  const closeHistoryModalHandler = useCallback(() => { setShowHistoryModal(false); }, []);

  useEffect(() => {
    if (gameActive && currentPlayerHand && dealerHand.length > 0 && currentPlayerHand.cards.length > 0) {
        const dealerUpCardForHighlight = hideDealerFirstCard ? dealerHand[1] : dealerHand[0];
        if (dealerUpCardForHighlight) { // Ensure dealer upcard is available
            const params = getStrategyKeysForHighlight(
                currentPlayerHand,
                // Pass only the upcard for strategy guide, not the whole hand if one is hidden
                hideDealerFirstCard ? [dealerHand[1]] : dealerHand,
                hideDealerFirstCard
            );
            setHighlightParams(params);
        } else {
             setHighlightParams({ type: null, playerKey: null, dealerKey: null });
        }
    } else {
      setHighlightParams({ type: null, playerKey: null, dealerKey: null });
    }
  }, [gameActive, currentPlayerHand, dealerHand, hideDealerFirstCard, getStrategyKeysForHighlight]);

  return {
    playerHands, currentHandIndex, dealerHand, gameActive, message, hideDealerFirstCard,
    highlightParams, gameHistory, showHistoryModal, sessionStats,
    newGameHandler, hitHandler, standHandler, doubleHandler, splitHandler, surrenderHandler,
    showHistoryHandler, closeHistoryModalHandler,
    getHandScoreText,
    playerCanHit, playerCanStand, playerCanDouble, playerCanSplit, playerCanSurrender,
  };
};