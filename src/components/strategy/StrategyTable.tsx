// Strategy table component for displaying basic strategy charts

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import { StrategyTable as StrategyTableType, StrategyAction, StrategyRow } from '../../types/strategy';
import { ACTION_DESCRIPTIONS, DEALER_UPCARDS } from '../../data/strategyCharts';

interface StrategyTableProps {
    chart: StrategyTableType;
    highlightCell?: {
        row: number;
        col: number;
    } | null;
}

const StrategyTable: React.FC<StrategyTableProps> = ({ chart, highlightCell }) => {
    const getActionStyle = (action: StrategyAction, isHighlighted: boolean) => {
        const actionDesc = ACTION_DESCRIPTIONS[action];
        return {
            backgroundColor: isHighlighted ? '#ffeb3b' : actionDesc.color,
            color: isHighlighted ? '#000' : 'white',
            fontWeight: 'bold',
            border: isHighlighted ? '2px solid #ff9800' : 'none',
            transition: 'all 0.3s ease',
        };
    };

    return (
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                            {chart.title}
                        </TableCell>
                        {DEALER_UPCARDS.map((upcard, index) => (
                            <TableCell
                                key={upcard}
                                align="center"
                                sx={{
                                    fontWeight: 'bold',
                                    backgroundColor: '#f5f5f5',
                                    border: highlightCell?.col === index ? '2px solid #ff9800' : 'none'
                                }}
                            >
                                {upcard}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {chart.rows.map((row: StrategyRow, rowIndex: number) => (
                        <TableRow key={rowIndex}>
                            <TableCell
                                sx={{
                                    fontWeight: 'bold',
                                    backgroundColor: '#f9f9f9',
                                    border: highlightCell?.row === rowIndex ? '2px solid #ff9800' : 'none'
                                }}
                            >
                                {row.label || row.playerValue}
                            </TableCell>
                            {row.actions.map((action: StrategyAction, colIndex: number) => {
                                const isHighlighted = highlightCell?.row === rowIndex && highlightCell?.col === colIndex;
                                return (
                                    <TableCell
                                        key={colIndex}
                                        align="center"
                                        sx={getActionStyle(action, isHighlighted)}
                                    >
                                        {action}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StrategyTable;
