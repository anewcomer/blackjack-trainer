import React from 'react';
import { GameHistoryEntry, PlayerHandHistoryForModal } from '../../logic/game/historyTypes';

/**
 * Format a list of player actions for display
 */
export const formatActionsLogForDisplay = (actionsLogArray: PlayerHandHistoryForModal['actions']) => {
  if (!actionsLogArray || actionsLogArray.length === 0) return <span>N/A</span>;
  return (
    <ul 
      style={{ margin: 0, paddingLeft: '1.2em', textAlign: 'left' }}
      aria-label="Player actions"
    >
      {actionsLogArray.map((log, idx) => (
        <li 
          key={idx} 
          style={{ color: log.correct ? '#388e3c' : '#e65100' }}
          aria-label={`${log.action} ${log.cardDealt ? 'receiving ' + log.cardDealt : ''}, hand value from ${log.valueBefore} to ${log.valueAfter}, ${log.correct ? 'correct play' : 'mistake, optimal play was ' + log.optimal}`}
        >
          {log.action} {log.cardDealt ? `(${log.cardDealt})` : ''} [Val: {log.valueBefore} → {log.valueAfter}] {log.correct ? '(Correct)' : `(Mistake! Optimal: ${log.optimal})`}
        </li>
      ))}
    </ul>
  );
};

/**
 * Format a list of dealer actions for display
 */
export const formatDealerActionsForDisplay = (dealerActionsLogArray: Array<{action: string; cardDealt?: string | null; valueBefore: number; valueAfter: number}>) => {
  if (!dealerActionsLogArray || dealerActionsLogArray.length === 0) return <span>N/A</span>;
  return (
    <ul 
      style={{ margin: 0, paddingLeft: 0, listStylePosition: 'inside', textAlign: 'left' }}
      aria-label="Dealer actions"
    >
      {dealerActionsLogArray.map((log, idx: number) => (
        <li 
          key={idx}
          aria-label={`${log.action} ${log.cardDealt ? 'receiving ' + log.cardDealt : ''}, hand value from ${log.valueBefore} to ${log.valueAfter}`}
        >
          {log.action} {log.cardDealt ? `(${log.cardDealt})` : ''} [Val: {log.valueBefore} → {log.valueAfter}]
        </li>
      ))}
    </ul>
  );
};

/**
 * Format cards for display
 */
export const formatCardsForDisplay = (cards: string) => cards || 'N/A';

/**
 * Calculate percentage and format it as a string
 */
export const calculatePercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return ((value / total) * 100).toFixed(1) + '%';
};

/**
 * Generate a descriptive title for the game history entry
 */
export const getEntryDescription = (entry: GameHistoryEntry, index: number) => {
  const date = new Date(entry.timestamp).toLocaleDateString();
  const time = new Date(entry.timestamp).toLocaleTimeString();
  const outcome = entry.playerHands[0]?.outcome || 'Unknown';
  return `Game ${index + 1} played on ${date} at ${time}, outcome: ${outcome}`;
};

/**
 * Convert game history to CSV format for download
 */
export const convertHistoryToCSV = (history: GameHistoryEntry[]): string => {
  if (!history.length) return '';

  // CSV header
  const headers = [
    'Time', 'Hand Number', 'Initial Cards', 'Final Cards', 'Final Score', 
    'Actions', 'Was Correct', 'Optimal Play', 'Dealer Upcard', 'Dealer Final Cards',
    'Dealer Score', 'Outcome'
  ];
  
  const csvRows = [headers.join(',')];
  
  history.forEach((entry) => {
    entry.playerHands.forEach((hand, handIndex) => {
      const actions = hand.actions.map((a) => `${a.action}${a.cardDealt ? ' (' + a.cardDealt + ')' : ''}`).join('; ');
      const wasCorrect = hand.actions.map((a) => a.correct ? 'Yes' : 'No').join('; ');
      const optimalPlays = hand.actions.map((a) => a.optimal).join('; ');
      
      const row = [
        `"${new Date(entry.timestamp).toLocaleString()}"`,
        handIndex + 1,
        `"${hand.initialCards}"`,
        `"${hand.finalCards}"`,
        hand.finalScore + (hand.busted ? ' BUST' : '') + (hand.surrendered ? ' SURRENDER' : '') + (hand.isBlackjack ? ' BJ' : ''),
        `"${actions}"`,
        `"${wasCorrect}"`,
        `"${optimalPlays}"`,
        `"${entry.dealerUpCard}"`,
        `"${entry.dealerFinalCards}"`,
        entry.dealerFinalScore,
        hand.outcome
      ];
      
      csvRows.push(row.join(','));
    });
  });
  
  return csvRows.join('\n');
};

/**
 * Download CSV file
 */
export const downloadHistoryCSV = (history: GameHistoryEntry[]) => {
  const csvContent = convertHistoryToCSV(history);
  if (!csvContent) return;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `blackjack_history_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  // Add to document, click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
