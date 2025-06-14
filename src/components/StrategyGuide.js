import React, { useState } from 'react';

// Helper function to render a strategy table
const renderStrategyTable = (title, data, playerHandType) => {
    // Player hand values (rows) - customize as needed
    const playerValues = playerHandType === 'pairs'
        ? ['A,A', 'T,T', '9,9', '8,8', '7,7', '6,6', '5,5', '4,4', '3,3', '2,2']
        : playerHandType === 'soft'
            ? ['A,9', 'A,8', 'A,7', 'A,6', 'A,5', 'A,4', 'A,3', 'A,2']
            : ['17+', '16', '15', '14', '13', '12', '11', '10', '9', '8', '5-7']; // Hard totals

    // Dealer card values (columns)
    const dealerValues = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'A'];

    const strategyData = data; // Use the passed-in data directly

    const getActionClass = (action) => {
        if (!action) return '';
        return `bs-${action.toLowerCase()}`;
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
                                return (
                                    <td key={`${playerVal}-${dealerVal}`} className={`bs-action ${getActionClass(action)}`}>
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

const StrategyGuide = () => {
    const [activeTab, setActiveTab] = useState('hard'); // 'hard', 'soft', 'pairs'

    const hardTotalsData = {
        // Player 5-7
        '5-7-2': 'H', '5-7-3': 'H', '5-7-4': 'H', '5-7-5': 'H', '5-7-6': 'H', '5-7-7': 'H', '5-7-8': 'H', '5-7-9': 'H', '5-7-T': 'H', '5-7-A': 'H',
        // Player 8
        '8-2': 'H', '8-3': 'H', '8-4': 'H', '8-5': 'H', '8-6': 'H', '8-7': 'H', '8-8': 'H', '8-9': 'H', '8-T': 'H', '8-A': 'H',
        // Player 9
        '9-2': 'H', '9-3': 'D', '9-4': 'D', '9-5': 'D', '9-6': 'D', '9-7': 'H', '9-8': 'H', '9-9': 'H', '9-T': 'H', '9-A': 'H',
        // Player 10
        '10-2': 'D', '10-3': 'D', '10-4': 'D', '10-5': 'D', '10-6': 'D', '10-7': 'D', '10-8': 'D', '10-9': 'D', '10-T': 'H', '10-A': 'H',
        // Player 11
        '11-2': 'D', '11-3': 'D', '11-4': 'D', '11-5': 'D', '11-6': 'D', '11-7': 'D', '11-8': 'D', '11-9': 'D', '11-T': 'D', '11-A': 'H', // Some charts D vs A, H is common for S17
        // Player 12
        '12-2': 'H', '12-3': 'H', '12-4': 'S', '12-5': 'S', '12-6': 'S', '12-7': 'H', '12-8': 'H', '12-9': 'H', '12-T': 'H', '12-A': 'H',
        // Player 13
        '13-2': 'S', '13-3': 'S', '13-4': 'S', '13-5': 'S', '13-6': 'S', '13-7': 'H', '13-8': 'H', '13-9': 'H', '13-T': 'H', '13-A': 'H',
        // Player 14
        '14-2': 'S', '14-3': 'S', '14-4': 'S', '14-5': 'S', '14-6': 'S', '14-7': 'H', '14-8': 'H', '14-9': 'H', '14-T': 'H', '14-A': 'H', // Some R vs A
        // Player 15
        '15-2': 'S', '15-3': 'S', '15-4': 'S', '15-5': 'S', '15-6': 'S', '15-7': 'H', '15-8': 'H', '15-9': 'H', '15-T': 'R', '15-A': 'R', // R vs A if H17, H if S17
        // Player 16
        '16-2': 'S', '16-3': 'S', '16-4': 'S', '16-5': 'S', '16-6': 'S', '16-7': 'H', '16-8': 'H', '16-9': 'R', '16-T': 'R', '16-A': 'R',
        // Player 17+
        '17+-2': 'S', '17+-3': 'S', '17+-4': 'S', '17+-5': 'S', '17+-6': 'S', '17+-7': 'S', '17+-8': 'S', '17+-9': 'S', '17+-T': 'S', '17+-A': 'S',
    };

    const softTotalsData = {
        // Player A,2 (Soft 13)
        'A,2-2': 'H', 'A,2-3': 'H', 'A,2-4': 'H', 'A,2-5': 'D', 'A,2-6': 'D', 'A,2-7': 'H', 'A,2-8': 'H', 'A,2-9': 'H', 'A,2-T': 'H', 'A,2-A': 'H',
        // Player A,3 (Soft 14)
        'A,3-2': 'H', 'A,3-3': 'H', 'A,3-4': 'H', 'A,3-5': 'D', 'A,3-6': 'D', 'A,3-7': 'H', 'A,3-8': 'H', 'A,3-9': 'H', 'A,3-T': 'H', 'A,3-A': 'H',
        // Player A,4 (Soft 15)
        'A,4-2': 'H', 'A,4-3': 'H', 'A,4-4': 'D', 'A,4-5': 'D', 'A,4-6': 'D', 'A,4-7': 'H', 'A,4-8': 'H', 'A,4-9': 'H', 'A,4-T': 'H', 'A,4-A': 'H',
        // Player A,5 (Soft 16)
        'A,5-2': 'H', 'A,5-3': 'H', 'A,5-4': 'D', 'A,5-5': 'D', 'A,5-6': 'D', 'A,5-7': 'H', 'A,5-8': 'H', 'A,5-9': 'H', 'A,5-T': 'H', 'A,5-A': 'H',
        // Player A,6 (Soft 17)
        'A,6-2': 'H', 'A,6-3': 'D', 'A,6-4': 'D', 'A,6-5': 'D', 'A,6-6': 'D', 'A,6-7': 'H', 'A,6-8': 'H', 'A,6-9': 'H', 'A,6-T': 'H', 'A,6-A': 'H',
        // Player A,7 (Soft 18)
        'A,7-2': 'S', 'A,7-3': 'D', 'A,7-4': 'D', 'A,7-5': 'D', 'A,7-6': 'D', 'A,7-7': 'S', 'A,7-8': 'S', 'A,7-9': 'H', 'A,7-T': 'H', 'A,7-A': 'H', // Ds for 3-6
        // Player A,8 (Soft 19)
        'A,8-2': 'S', 'A,8-3': 'S', 'A,8-4': 'S', 'A,8-5': 'S', 'A,8-6': 'S', 'A,8-7': 'S', 'A,8-8': 'S', 'A,8-9': 'S', 'A,8-T': 'S', 'A,8-A': 'S', // Some charts D vs 6 for S17
        // Player A,9 (Soft 20)
        'A,9-2': 'S', 'A,9-3': 'S', 'A,9-4': 'S', 'A,9-5': 'S', 'A,9-6': 'S', 'A,9-7': 'S', 'A,9-8': 'S', 'A,9-9': 'S', 'A,9-T': 'S', 'A,9-A': 'S',
    };

    const pairSplittingData = {
        // Player A,A
        'A,A-2': 'P', 'A,A-3': 'P', 'A,A-4': 'P', 'A,A-5': 'P', 'A,A-6': 'P', 'A,A-7': 'P', 'A,A-8': 'P', 'A,A-9': 'P', 'A,A-T': 'P', 'A,A-A': 'P',
        // Player T,T (10,J,Q,K)
        'T,T-2': 'S', 'T,T-3': 'S', 'T,T-4': 'S', 'T,T-5': 'S', 'T,T-6': 'S', 'T,T-7': 'S', 'T,T-8': 'S', 'T,T-9': 'S', 'T,T-T': 'S', 'T,T-A': 'S',
        // Player 9,9
        '9,9-2': 'P', '9,9-3': 'P', '9,9-4': 'P', '9,9-5': 'P', '9,9-6': 'P', '9,9-7': 'S', '9,9-8': 'P', '9,9-9': 'P', '9,9-T': 'S', '9,9-A': 'S',
        // Player 8,8
        '8,8-2': 'P', '8,8-3': 'P', '8,8-4': 'P', '8,8-5': 'P', '8,8-6': 'P', '8,8-7': 'P', '8,8-8': 'P', '8,8-9': 'P', '8,8-T': 'P', '8,8-A': 'R', // P vs A if H17, R if S17
        // Player 7,7
        '7,7-2': 'P', '7,7-3': 'P', '7,7-4': 'P', '7,7-5': 'P', '7,7-6': 'P', '7,7-7': 'P', '7,7-8': 'H', '7,7-9': 'H', '7,7-T': 'H', '7,7-A': 'H', // R vs T,A if allowed
        // Player 6,6
        '6,6-2': 'P', '6,6-3': 'P', '6,6-4': 'P', '6,6-5': 'P', '6,6-6': 'P', '6,6-7': 'H', '6,6-8': 'H', '6,6-9': 'H', '6,6-T': 'H', '6,6-A': 'H',
        // Player 5,5 (Hard 10) - Never split 5s
        '5,5-2': 'D', '5,5-3': 'D', '5,5-4': 'D', '5,5-5': 'D', '5,5-6': 'D', '5,5-7': 'D', '5,5-8': 'D', '5,5-9': 'D', '5,5-T': 'H', '5,5-A': 'H',
        // Player 4,4
        '4,4-2': 'H', '4,4-3': 'H', '4,4-4': 'H', '4,4-5': 'P', '4,4-6': 'P', '4,4-7': 'H', '4,4-8': 'H', '4,4-9': 'H', '4,4-T': 'H', '4,4-A': 'H', // P vs 5,6 if DAS
        // Player 3,3
        '3,3-2': 'P', '3,3-3': 'P', '3,3-4': 'P', '3,3-5': 'P', '3,3-6': 'P', '3,3-7': 'P', '3,3-8': 'H', '3,3-9': 'H', '3,3-T': 'H', '3,3-A': 'H',
        // Player 2,2
        '2,2-2': 'P', '2,2-3': 'P', '2,2-4': 'P', '2,2-5': 'P', '2,2-6': 'P', '2,2-7': 'P', '2,2-8': 'H', '2,2-9': 'H', '2,2-T': 'H', '2,2-A': 'H',
    };

    return (
        <div id="strategy-guide-container">
            <h3>Basic Strategy Guide</h3>
            <p>Dealer stands on soft 17. Double after split allowed.</p>
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
                    Pair Splitting
                </button>
            </div>

            <div className={`tab-content ${activeTab === 'hard' ? 'active' : ''}`}>
                {renderStrategyTable("Hard Totals", hardTotalsData, "hard")}
            </div>
            <div className={`tab-content ${activeTab === 'soft' ? 'active' : ''}`}>
                {renderStrategyTable("Soft Totals", softTotalsData, "soft")}
            </div>
            <div className={`tab-content ${activeTab === 'pairs' ? 'active' : ''}`}>
                {renderStrategyTable("Pair Splitting", pairSplittingData, "pairs")}
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