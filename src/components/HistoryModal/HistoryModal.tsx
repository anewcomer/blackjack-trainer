import React from 'react';
import './HistoryModal.css';
import { GameHistoryEntry, SessionStats, PlayerHandHistoryForModal } from '../../logic/types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameHistoryEntry[];
  stats: SessionStats;
  onNewSession: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, stats, onNewSession }) => {
  if (!isOpen) return null;

  // Helper to format actions as a list
  const formatActionsLogForDisplay = (actionsLogArray: PlayerHandHistoryForModal['actions']) => {
    if (!actionsLogArray || actionsLogArray.length === 0) return <span>N/A</span>;
    return (
      <ol style={{ margin: 0, paddingLeft: '1.2em', textAlign: 'left' }}>
        {actionsLogArray.map((log, idx) => (
          <li key={idx} className={log.correct ? 'action-correct' : 'action-mistake'}>
            {log.action} {log.cardDealt ? `(${log.cardDealt})` : ''} [Val: {log.valueBefore} → {log.valueAfter}] {log.correct ? '(Correct)' : `(Mistake! Optimal: ${log.optimal})`}
          </li>
        ))}
      </ol>
    );
  };

  // Helper to format dealer actions
  const formatDealerActionsForDisplay = (dealerActionsLogArray: GameHistoryEntry['dealerActions']) => {
    if (!dealerActionsLogArray || dealerActionsLogArray.length === 0) return <span>N/A</span>;
    return (
      <ol style={{ margin: 0, paddingLeft: 0, listStylePosition: 'inside', textAlign: 'left' }}>
        {dealerActionsLogArray.map((log, idx) => (
          <li key={idx}>
            {log.action} {log.cardDealt ? `(${log.cardDealt})` : ''} [Val: {log.valueBefore} → {log.valueAfter}]
          </li>
        ))}
      </ol>
    );
  };

  // Helper to format cards
  const formatCardsForDisplay = (cards: string) => cards || 'N/A';

  // Session stats as in the modal
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  return (
    <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose} aria-label="Close history modal">&times;</button>
        <div id="history-log-container">
          <h2>Game History</h2>
          <table id="history-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Hand(s)</th>
                <th>Actions</th>
                <th>Dealer</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={5}>No game history yet. Start a new game!</td></tr>
              ) : (
                history.slice().reverse().map(entry => (
                  <tr key={entry.id}>
                    <td>{new Date(entry.timestamp).toLocaleString()}</td>
                    <td>
                      {entry.playerHands.map((ph, idx) => (
                        <div key={idx}>
                          <strong>Hand {idx + 1}:</strong> {formatCardsForDisplay(ph.initialCards)} → {formatCardsForDisplay(ph.finalCards)} (Score: {ph.finalScore}{ph.busted ? ' BUST' : ''}{ph.surrendered ? ' SURRENDER' : ''}{ph.isBlackjack ? ' (Blackjack)' : ''})
                        </div>
                      ))}
                    </td>
                    <td>
                      {entry.playerHands.map((ph, idx) => (
                        <div key={idx}>{formatActionsLogForDisplay(ph.actions)}</div>
                      ))}
                    </td>
                    <td>
                      <div>Upcard: {entry.dealerUpCard}</div>
                      <div>Hole: {entry.dealerHoleCard}</div>
                      <div>Final: {entry.dealerFinalCards} (Score: {entry.dealerFinalScore}{entry.dealerBusted ? ' BUST' : ''}{entry.dealerBlackjackOnInit ? ' (Blackjack)' : ''})</div>
                      {formatDealerActionsForDisplay(entry.dealerActions)}
                    </td>
                    <td>
                      {entry.playerHands.map((ph, idx) => (
                        <div key={idx}>{ph.outcome}</div>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div id="session-stats">
            <h3>Session Statistics</h3>
            <p>Correct Decisions: <span className="stat-value">{stats.correctMoves}</span> (<span className="percentage">{calculatePercentage(stats.correctMoves, stats.totalDecisions)}</span>)</p>
            <p>Incorrect Decisions: <span className="stat-value">{stats.incorrectMoves}</span> (<span className="percentage">{calculatePercentage(stats.incorrectMoves, stats.totalDecisions)}</span>)</p>
            <p>Total Decisions: <span className="stat-value">{stats.totalDecisions}</span></p>
            <hr />
            <p>Wins: <span className="stat-value">{stats.wins}</span> (<span className="percentage">{calculatePercentage(stats.wins, stats.handsPlayed)}</span>)</p>
            <p>Losses: <span className="stat-value">{stats.losses}</span> (<span className="percentage">{calculatePercentage(stats.losses, stats.handsPlayed)}</span>)</p>
            <p>Pushes: <span className="stat-value">{stats.pushes}</span> (<span className="percentage">{calculatePercentage(stats.pushes, stats.handsPlayed)}</span>)</p>
            <p>Total Hands Played: <span className="stat-value">{stats.handsPlayed}</span></p>
            <button onClick={onNewSession} className="action-button new-game-button" id="new-session-button">New Session</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
