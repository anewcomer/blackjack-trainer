import { Card, PlayerHand, DealerActionLogEntry } from './blackjackTypes';
import { calculateHandValue, dealOneCard } from './blackjackUtils';
import { GAME_RULES } from './blackjackConstants';

export function dealerPlayLogic(
  dealerHand: Card[],
  deck: Card[],
  currentRoundDealerActionsLog: DealerActionLogEntry[],
  setHideDealerFirstCard: (b: boolean) => void,
  setMessage: (msg: string) => void,
  setDealerHand: (cards: Card[]) => void,
  setDeck: (cards: Card[]) => void,
  setCurrentRoundDealerActionsLog: (log: DealerActionLogEntry[]) => void,
  determineGameOutcome: (isInitialBlackjackRound: boolean, playerHadInitialBlackjack: boolean) => void
) {
  setHideDealerFirstCard(false);
  setMessage("Dealer's turn...");
  let localDealerHand: Card[] = [...dealerHand];
  let localDeck: Card[] = [...deck];
  let localDealerActionsLog: DealerActionLogEntry[] = [...currentRoundDealerActionsLog];
  const dealerInitialValue = calculateHandValue(localDealerHand);
  if ((dealerInitialValue !== 21 || localDealerHand.length > 2) && !localDealerActionsLog.some(a => a.action === 'Reveal')) {
    localDealerActionsLog.push({ action: 'Reveal', handValueBefore: dealerInitialValue, handValueAfter: dealerInitialValue });
  } else if (dealerInitialValue === 21 && localDealerHand.length === 2 && !localDealerActionsLog.some(a => a.action === 'Blackjack!')) {
    localDealerActionsLog.push({ action: 'Blackjack!', handValueBefore: dealerInitialValue, handValueAfter: dealerInitialValue });
  }
  function performDealerHit(): void {
    let currentDealerValue = calculateHandValue(localDealerHand);
    let isSoft17 = false;
    if (currentDealerValue === 17) {
      let aceAsElevenMakes17 = false;
      let numAces = 0;
      let valueWithoutAces = 0;
      localDealerHand.forEach(c => {
        if (c.rank === 'A') numAces++;
        else valueWithoutAces += c.value;
      });
      if (numAces > 0 && (valueWithoutAces + 11 + (numAces - 1) === 17)) {
        aceAsElevenMakes17 = true;
      }
      isSoft17 = aceAsElevenMakes17;
    }
    if (currentDealerValue < 17 || (currentDealerValue === 17 && isSoft17 && !GAME_RULES.DEALER_STANDS_ON_SOFT_17)) {
      const { card, updatedDeck } = dealOneCard(localDeck);
      localDeck = updatedDeck;
      const valueBeforeHit = calculateHandValue(localDealerHand);
      localDealerHand.push(card);
      const valueAfterHit = calculateHandValue(localDealerHand);
      localDealerActionsLog.push({ action: 'H', handValueBefore: valueBeforeHit, handValueAfter: valueAfterHit, cardDealt: card });
      setDealerHand([...localDealerHand]);
      setDeck(localDeck);
      if (valueAfterHit > 21) {
        localDealerActionsLog.push({ action: 'Bust', handValueBefore: valueAfterHit, handValueAfter: valueAfterHit });
        finalizeDealerTurn();
      } else {
        setTimeout(performDealerHit, 1000);
      }
    } else {
      localDealerActionsLog.push({ action: 'S', handValueBefore: currentDealerValue, handValueAfter: currentDealerValue });
      finalizeDealerTurn();
    }
  }
  function finalizeDealerTurn(): void {
    setCurrentRoundDealerActionsLog(localDealerActionsLog);
    determineGameOutcome(false, false);
  }
  if (dealerInitialValue === 21 && localDealerHand.length === 2) {
    finalizeDealerTurn();
  } else {
    setTimeout(performDealerHit, 500);
  }
}
