import React from 'react';
import './HistoryModal.css';
import { GameHistoryEntry, SessionStats, PlayerHandHistoryForModal } from '../hooks/useBlackjackGame'; // Import core types

interface ActionLogForModal {
  action: string;
  cardDealt?: string | null; // cardDealt is string | null in PlayerHandHistoryForModal
  valueBefore: number;
  valueAfter: number;
  correct?: boolean;
  optimal?: string;
}
const formatAction = (actionLog: ActionLogForModal): string => {
  let text = `${actionLog.action}`;
  if (actionLog.cardDealt) text += ` (${actionLog.cardDealt})`;
  text += ` [Val: ${actionLog.valueBefore} → ${actionLog.valueAfter}]`;
  text += actionLog.correct ? ` (Correct: ${actionLog.optimal})` : ` (Mistake! Optimal: ${actionLog.optimal})`;
  return text;
};

interface DealerActionLogForModal {
    action: string;
    cardDealt?: string | null; // cardDealt is string | null in GameHistoryEntry.dealerActions
    valueBefore: number; // valueBefore is present in GameHistoryEntry.dealerActions
    valueAfter: number;
}
const formatDealerAction = (actionLog: DealerActionLogForModal): string => {
    let text = `${actionLog.action}`;
    if (actionLog.cardDealt) text += ` (${actionLog.cardDealt})`;
    if (actionLog.action !== 'Reveal' && actionLog.action !== 'Blackjack!') { // Blackjack and Reveal don't always have before/after change
      text += ` [Val: ${actionLog.valueBefore} → ${actionLog.valueAfter}]`;
    } else {
      text += ` (Val: ${actionLog.valueAfter})`;
    }
    return text;
};

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: GameHistoryEntry[];
  stats: SessionStats;
  onNewSession: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, stats, onNewSession }) => {
  if (!isOpen) {
    return null;
  }

  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0%';
    return ((value / total) * 100).toFixed(1) + '%';
  };

  const renderPlayerHandHistory = (playerHand: PlayerHandHistoryForModal, handIndex: number) => (
    <div key={`player-hand-${handIndex}`} className="history-player-hand-details">
      <p><strong>Player Hand {handIndex + 1}:</strong> Initial: {playerHand.initialCards}, Final: {playerHand.finalCards} (Score: {playerHand.finalScore}{playerHand.busted ? " BUST" : ""}{playerHand.surrendered ? " SURRENDER" : ""}), Outcome: {playerHand.outcome} {playerHand.isBlackjack ? "(Blackjack)" : ""}</p>
      {playerHand.actions.length > 0 && <h5>Actions:</h5>}
      <ul>
        {playerHand.actions.map((act, i) => <li key={i} className={act.correct ? 'action-correct' : 'action-mistake'}>{formatAction(act)}</li>)}
      </ul>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div className="modal-content" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose} aria-label="Close history modal">
          &times;
        </button>
        <h2>Game History</h2>
        {history.length === 0 ? (
          <p>No game history yet. Start a new game!</p>
        ) : (
          <ul className="history-log">
            {history.slice().reverse().map((entry) => (
              <li key={entry.id} className="history-entry">
                <p><strong>Game @ {new Date(entry.timestamp).toLocaleString()}</strong></p>
                {entry.playerBlackjackOnInit && <p><em>Player Blackjack!</em></p>}
                {entry.dealerBlackjackOnInit && <p><em>Dealer Blackjack!</em></p>}

                {entry.playerHands.map((ph, idx) => renderPlayerHandHistory(ph, idx))}

                <div className="history-dealer-details">
                  <p><strong>Dealer:</strong> Upcard: {entry.dealerUpCard}, Hole: {entry.dealerHoleCard}, Final: {entry.dealerFinalCards} (Score: {entry.dealerFinalScore}{entry.dealerBusted ? " BUST" : ""})</p>
                  {entry.dealerActions.length > 0 && <h5>Actions:</h5>}
                  <ul>
                    {entry.dealerActions.map((act, i) => <li key={i}>{formatDealerAction(act)}</li>)}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
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
            <button onClick={onNewSession} className="action-button new-session-button">New Session (Reset Stats)</button>
        </div>
      </div>
    </div>
  );
};
export default HistoryModal;