import React from 'react';
import './Actions.css';

interface ActionsProps {
  onNewGame: () => void;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onSurrender: () => void;
  onShowHistory: () => void;
  playerCanHit: boolean;
  playerCanStand: boolean;
  playerCanDouble: boolean;
  playerCanSplit: boolean;
  playerCanSurrender: boolean;
}
const Actions: React.FC<ActionsProps> = ({
  onNewGame,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onSurrender,
  onShowHistory,
  playerCanHit,
  playerCanStand,
  playerCanDouble,
  playerCanSplit,
  playerCanSurrender,
}) => {
  return (
    <div className="actions">
      <button onClick={onHit} disabled={!playerCanHit} className="action-button">
        Hit
      </button>
      <button onClick={onStand} disabled={!playerCanStand} className="action-button">
        Stand
      </button>
      <button onClick={onDouble} disabled={!playerCanDouble} className="action-button">
        Double Down
      </button>
      <button onClick={onSplit} disabled={!playerCanSplit} className="action-button">
        Split
      </button>
      <button onClick={onSurrender} disabled={!playerCanSurrender} className="action-button">
        Surrender
      </button>
      <button onClick={onNewGame} className="action-button new-game-button">New Game</button>
      <button onClick={onShowHistory} className="action-button">Show History</button>
    </div>
  );
};

export default Actions;
