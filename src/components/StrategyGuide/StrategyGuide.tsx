import React, { useState, useEffect } from 'react';
import { hardTotalsData, softTotalsData, pairSplittingData } from '../../data/strategyData';
import './StrategyGuide.css';

// Helper function to render a strategy table
type PlayerHandType = 'pairs' | 'soft' | 'hard';

interface StrategyGuideProps {
  highlightType: 'hard' | 'soft' | 'pairs' | null;
  highlightPlayerKey: string | null;
  highlightDealerKey: string | null;
} // Props for highlighting (currently unused in rendering logic)

const renderStrategyTable = (title: string, data: { [key: string]: string }, playerHandType: PlayerHandType, highlightPlayerKey?: string | null, highlightDealerKey?: string | null) => {
    // Player hand values (rows) - customize as needed
    const playerValues: string[] = playerHandType === 'pairs'
        ? ['A,A', 'T,T', '9,9', '8,8', '7,7', '6,6', '5,5', '4,4', '3,3', '2,2']
        : playerHandType === 'soft'
            ? ['A,9', 'A,8', 'A,7', 'A,6', 'A,5', 'A,4', 'A,3', 'A,2']
            : ['17+', '16', '15', '14', '13', '12', '11', '10', '9', '8', '5-7']; // Hard totals

    // Dealer card values (columns)
    const dealerValues: string[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'A'];
    const strategyData = data;

    const getActionClass = (action: string): string => {
        if (!action) return '';
        return `bs-${action.toLowerCase()}`;
    };
    const isHighlighted = (playerVal: string, dealerVal: string): boolean => {
        // Basic check, can be made more robust based on how keys are structured
        return playerVal === highlightPlayerKey && dealerVal === highlightDealerKey;
    };

    return (
        <div className="bs-table">
            <h4>{title}</h4>
            <table>
                <thead>
                    <tr>
                        <th>Player</th>
                        {dealerValues.map(dealerVal => <th key={dealerVal}>{dealerVal}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {playerValues.map(playerVal => (
                        <tr key={playerVal}>
                            <td>{playerVal}</td>
                            {dealerValues.map(dealerVal => {
                                const action = strategyData[`${playerVal}-${dealerVal}`] || '-'; // Default or placeholder
                                const highlighted = isHighlighted(playerVal, dealerVal);
                                return (
                                    <td key={`${playerVal}-${dealerVal}`} className={`bs-action ${getActionClass(action)} ${highlighted ? 'bs-highlight' : ''}`}>
                                        {action}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const StrategyGuide: React.FC<StrategyGuideProps> = ({ highlightType, highlightPlayerKey, highlightDealerKey }) => {
    const [activeTab, setActiveTab] = useState<PlayerHandType>('hard');

    // Automatically switch to the correct tab when highlightType changes
    useEffect(() => {
        if (highlightType === 'hard' || highlightType === 'soft' || highlightType === 'pairs') {
            setActiveTab(highlightType);
        }
    }, [highlightType]);

    const getTableHighlightKeys = (tableType: PlayerHandType) => highlightType === tableType ? { playerKey: highlightPlayerKey, dealerKey: highlightDealerKey } : {};

    return (
        <div id="strategy-guide-container" className="bs-table">
            <h3>Basic Strategy Reference (H17, DAS)</h3>
            <p>S: Stand, H: Hit, D: Double Down, P: Split, R: Surrender (R/H means Surrender if allowed, else Hit)</p>
            <div className="tab-buttons">
                <button
                    className={`tab-button ${activeTab === 'hard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hard')}
                >
                    Hard Totals
                </button>
                <button
                    className={`tab-button ${activeTab === 'soft' ? 'active' : ''}`}
                    onClick={() => setActiveTab('soft')}
                >
                    Soft Totals
                </button>
                <button
                    className={`tab-button ${activeTab === 'pairs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pairs')}
                >
                    Pairs
                </button>
            </div>

            <div className={`tab-content ${activeTab === 'hard' ? 'active' : ''}`}>
                {renderStrategyTable("Hard Totals", hardTotalsData, "hard", getTableHighlightKeys('hard').playerKey, getTableHighlightKeys('hard').dealerKey)}
            </div>
            <div className={`tab-content ${activeTab === 'soft' ? 'active' : ''}`}>
                {renderStrategyTable("Soft Totals", softTotalsData, "soft", getTableHighlightKeys('soft').playerKey, getTableHighlightKeys('soft').dealerKey)}
            </div>
            <div className={`tab-content ${activeTab === 'pairs' ? 'active' : ''}`}>
                {renderStrategyTable("Pairs", pairSplittingData, "pairs", getTableHighlightKeys('pairs').playerKey, getTableHighlightKeys('pairs').dealerKey)}
            </div>

            <div style={{ marginTop: '20px', fontSize: '0.8em', textAlign: 'center' }}>
                <p><strong>Legend:</strong></p>
                <p><span className="bs-action bs-s" style={{padding: '2px 5px', borderRadius: '3px', marginRight: '5px'}}>S</span> Stand</p>
                <p><span className="bs-action bs-h" style={{padding: '2px 5px', borderRadius: '3px', marginRight: '5px'}}>H</span> Hit</p>
                <p><span className="bs-action bs-d" style={{padding: '2px 5px', borderRadius: '3px', marginRight: '5px'}}>D</span> Double</p>
                <p><span className="bs-action bs-p" style={{padding: '2px 5px', borderRadius: '3px', marginRight: '5px'}}>P</span> Split</p>
                <p><span className="bs-action bs-r" style={{padding: '2px 5px', borderRadius: '3px', marginRight: '5px'}}>R</span> Surrender (if allowed, otherwise Hit)</p>
            </div>
        </div>
    );
};

export default StrategyGuide;
