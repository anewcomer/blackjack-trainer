import { Card, DealerActionLogEntry } from './blackjackTypes';
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
  // Set message first for a smoother transition
  setMessage("Dealer's turn...");
  
  // Create local variables to track state through async operations
  let localDealerHand: Card[] = [...dealerHand];
  let localDeck: Card[] = [...deck];
  let localDealerActionsLog: DealerActionLogEntry[] = [...currentRoundDealerActionsLog];
  const dealerInitialValue = calculateHandValue(localDealerHand);
  
  // Add a slight delay before revealing the dealer's hole card
  setTimeout(() => {
    setHideDealerFirstCard(false);
    
    // Log the reveal action
    if ((dealerInitialValue !== 21 || localDealerHand.length > 2) && !localDealerActionsLog.some(a => a.action === 'Reveal')) {
      localDealerActionsLog.push({ action: 'Reveal', handValueBefore: dealerInitialValue, handValueAfter: dealerInitialValue });
    } else if (dealerInitialValue === 21 && localDealerHand.length === 2 && !localDealerActionsLog.some(a => a.action === 'Blackjack!')) {
      localDealerActionsLog.push({ action: 'Blackjack!', handValueBefore: dealerInitialValue, handValueAfter: dealerInitialValue });
    }
    
    // Update the log to show the reveal action
    setCurrentRoundDealerActionsLog([...localDealerActionsLog]);
  }, 800); // Delay before revealing card
  function performDealerHit(): void {
    let currentDealerValue = calculateHandValue(localDealerHand);
    let isSoft17 = false;
    
    // Check for soft 17
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
    
    // Dealer must hit on < 17 or on soft 17 if the rule is to hit soft 17
    if (currentDealerValue < 17 || (currentDealerValue === 17 && isSoft17 && !GAME_RULES.DEALER_STANDS_ON_SOFT_17)) {
      // Update message to show dealer is hitting
      setMessage(`Dealer hits at ${currentDealerValue}${isSoft17 ? ' (soft)' : ''}...`);
      
      const { card, updatedDeck } = dealOneCard(localDeck);
      localDeck = updatedDeck;
      const valueBeforeHit = calculateHandValue(localDealerHand);
      localDealerHand.push(card);
      const valueAfterHit = calculateHandValue(localDealerHand);
      
      // Log the hit action
      localDealerActionsLog.push({ 
        action: 'H', 
        handValueBefore: valueBeforeHit, 
        handValueAfter: valueAfterHit, 
        cardDealt: card 
      });
      
      // Update state to show the new card
      setDealerHand([...localDealerHand]);
      setDeck(localDeck);
      setCurrentRoundDealerActionsLog([...localDealerActionsLog]);
      
      if (valueAfterHit > 21) {
        // Dealer busted
        setMessage(`Dealer busts with ${valueAfterHit}!`);
        localDealerActionsLog.push({ 
          action: 'Bust', 
          handValueBefore: valueAfterHit, 
          handValueAfter: valueAfterHit 
        });
        finalizeDealerTurn();
      } else {
        // Continue dealer action after delay
        setTimeout(performDealerHit, 1800);
      }
    } else {
      // Dealer stands
      setMessage(`Dealer stands at ${currentDealerValue}${isSoft17 ? ' (soft)' : ''}.`);
      localDealerActionsLog.push({ 
        action: 'S', 
        handValueBefore: currentDealerValue, 
        handValueAfter: currentDealerValue 
      });
      finalizeDealerTurn();
    }
  }
  function finalizeDealerTurn(): void {
    // Update the dealer actions log
    setCurrentRoundDealerActionsLog(localDealerActionsLog);
    
    // Add a brief pause before showing the final result
    setTimeout(() => {
      setMessage("Determining winner...");
      
      // Add a slight delay before showing results
      setTimeout(() => {
        determineGameOutcome(false, false);
      }, 800);
    }, 800);
  }
  // Start dealer actions after a delay or finalize immediately if dealer has blackjack
  setTimeout(() => {
    console.log("==== DEALER PLAY EXECUTION ====");
    console.log(`Dealer initial hand: ${localDealerHand.map(c => `${c.rank}${c.suit}`).join(', ')}`);
    console.log("Dealer initial value:", dealerInitialValue);
    
    // Extra validation to make sure we have a valid dealer hand
    if (!Array.isArray(localDealerHand) || localDealerHand.length === 0) {
      console.error("Invalid dealer hand received:", localDealerHand);
      // Try to recover - just determine outcome
      determineGameOutcome(false, false);
      return;
    }
    
    if (dealerInitialValue === 21 && localDealerHand.length === 2) {
      console.log("Dealer has natural blackjack, finalizing turn");
      localDealerActionsLog.push({ 
        action: 'Natural Blackjack', 
        handValueBefore: 21, 
        handValueAfter: 21 
      });
      setCurrentRoundDealerActionsLog([...localDealerActionsLog]);
      finalizeDealerTurn();
    } else {
      console.log("Starting dealer hit/stand procedure");
      // Make sure all states are current before proceeding
      setDealerHand([...localDealerHand]);
      setDeck([...localDeck]);
      setCurrentRoundDealerActionsLog([...localDealerActionsLog]);
      performDealerHit(); 
    }
  }, 1000); // Wait a bit after the card reveal before starting dealer actions
}
