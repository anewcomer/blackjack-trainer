import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material';
import GameArea from '../GameArea';
import gameReducer from '../../../store/gameSlice';
import sessionReducer from '../../../store/sessionSlice';
import uiReducer from '../../../store/uiSlice';
import { createBlackjackTheme } from '../../../theme';

// Create a test store
const createTestStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            game: gameReducer,
            session: sessionReducer,
            ui: uiReducer,
        },
        preloadedState: initialState,
    });
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; store?: any }> = ({
    children,
    store = createTestStore()
}) => {
    const theme = createBlackjackTheme(false);

    return (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </Provider>
    );
};

describe('GameArea Component Integration', () => {
    describe('Initial State', () => {
        it('renders the initial game state correctly', () => {
            render(
                <TestWrapper>
                    <GameArea />
                </TestWrapper>
            );

            // Check for new game button in initial state using role
            expect(screen.getByRole('button', { name: /deal new hand/i })).toBeInTheDocument();
        });

        it('shows no cards initially', () => {
            render(
                <TestWrapper>
                    <GameArea />
                </TestWrapper>
            );

            // Should not have any card elements initially
            const cards = screen.queryAllByTestId(/card-/);
            expect(cards).toHaveLength(0);
        });
    });

    describe('Redux Integration', () => {
        it('reflects game state changes from Redux store', async () => {
            const store = createTestStore();

            render(
                <TestWrapper store={store}>
                    <GameArea />
                </TestWrapper>
            );

            // Click deal new hand button
            const dealButton = screen.getByRole('button', { name: /deal new hand/i });
            fireEvent.click(dealButton);

            // Wait for game state to update
            await waitFor(() => {
                // Should show some indication that game has started
                expect(screen.queryByRole('button', { name: /deal new hand/i })).not.toBeInTheDocument();
            });
        });
    });

    describe('Responsive Behavior', () => {
        it('renders properly on different screen sizes', () => {
            // Test mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });

            render(
                <TestWrapper>
                    <GameArea />
                </TestWrapper>
            );

            // Should render without throwing
            expect(screen.getByRole('main')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels and roles', () => {
            render(
                <TestWrapper>
                    <GameArea />
                </TestWrapper>
            );

            // Check for main game area
            const gameArea = screen.getByRole('main');
            expect(gameArea).toHaveAttribute('role', 'main');
        });

        it('supports keyboard navigation', async () => {
            render(
                <TestWrapper>
                    <GameArea />
                </TestWrapper>
            );

            const dealButton = screen.getByRole('button', { name: /deal new hand/i });

            // Focus the button
            dealButton.focus();
            expect(dealButton).toHaveFocus();

            // Simulate Enter key press
            fireEvent.keyDown(dealButton, { key: 'Enter', code: 'Enter' });

            // Should trigger the same action as click
            await waitFor(() => {
                expect(screen.queryByRole('button', { name: /deal new hand/i })).not.toBeInTheDocument();
            });
        });
    });
});
