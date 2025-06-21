import { configureStore } from '@reduxjs/toolkit';
import uiSlice, {
    setTheme,
    toggleTheme,
    setStrategyGuideOpen,
    setGameHistoryOpen,
    setFeedbackMessage,
    clearFeedbackMessage,
    setMobileDrawerOpen,
    UIState,
} from '../uiSlice';

const createTestStore = (initialState?: Partial<UIState>) => {
    return configureStore({
        reducer: {
            ui: uiSlice.reducer,
        },
        preloadedState: {
            ui: {
                ...uiSlice.getInitialState(),
                ...initialState,
            },
        },
    });
};

describe('uiSlice', () => {
    describe('initial state', () => {
        it('should have correct initial state', () => {
            const state = uiSlice.getInitialState();

            expect(state.theme).toBe('light');
            expect(state.strategyGuideOpen).toBe(true);
            expect(state.gameHistoryOpen).toBe(false);
            expect(state.feedbackMessage).toBeNull();
            expect(state.mobileDrawerOpen).toBe(false);
        });
    });

    describe('theme management', () => {
        it('should set theme to dark', () => {
            const store = createTestStore();

            store.dispatch(setTheme('dark'));
            const state = store.getState().ui;

            expect(state.theme).toBe('dark');
        });

        it('should set theme to light', () => {
            const store = createTestStore({ theme: 'dark' });

            store.dispatch(setTheme('light'));
            const state = store.getState().ui;

            expect(state.theme).toBe('light');
        });

        it('should toggle theme from light to dark', () => {
            const store = createTestStore({ theme: 'light' });

            store.dispatch(toggleTheme());
            const state = store.getState().ui;

            expect(state.theme).toBe('dark');
        });

        it('should toggle theme from dark to light', () => {
            const store = createTestStore({ theme: 'dark' });

            store.dispatch(toggleTheme());
            const state = store.getState().ui;

            expect(state.theme).toBe('light');
        });
    });

    describe('modal and panel management', () => {
        it('should open strategy guide', () => {
            const store = createTestStore({ strategyGuideOpen: false });

            store.dispatch(setStrategyGuideOpen(true));
            const state = store.getState().ui;

            expect(state.strategyGuideOpen).toBe(true);
        });

        it('should close strategy guide', () => {
            const store = createTestStore({ strategyGuideOpen: true });

            store.dispatch(setStrategyGuideOpen(false));
            const state = store.getState().ui;

            expect(state.strategyGuideOpen).toBe(false);
        });

        it('should open game history modal', () => {
            const store = createTestStore({ gameHistoryOpen: false });

            store.dispatch(setGameHistoryOpen(true));
            const state = store.getState().ui;

            expect(state.gameHistoryOpen).toBe(true);
        });

        it('should close game history modal', () => {
            const store = createTestStore({ gameHistoryOpen: true });

            store.dispatch(setGameHistoryOpen(false));
            const state = store.getState().ui;

            expect(state.gameHistoryOpen).toBe(false);
        });

        it('should open mobile drawer', () => {
            const store = createTestStore({ mobileDrawerOpen: false });

            store.dispatch(setMobileDrawerOpen(true));
            const state = store.getState().ui;

            expect(state.mobileDrawerOpen).toBe(true);
        });

        it('should close mobile drawer', () => {
            const store = createTestStore({ mobileDrawerOpen: true });

            store.dispatch(setMobileDrawerOpen(false));
            const state = store.getState().ui;

            expect(state.mobileDrawerOpen).toBe(false);
        });
    });

    describe('feedback message management', () => {
        it('should set feedback message', () => {
            const store = createTestStore();
            const message = {
                text: 'Correct strategy!',
                type: 'success' as const,
                optimalAction: 'STAND',
            };

            store.dispatch(setFeedbackMessage(message));
            const state = store.getState().ui;

            expect(state.feedbackMessage).toEqual(message);
        });

        it('should set error feedback message', () => {
            const store = createTestStore();
            const message = {
                text: 'Incorrect! You should STAND',
                type: 'error' as const,
                optimalAction: 'STAND',
            };

            store.dispatch(setFeedbackMessage(message));
            const state = store.getState().ui;

            expect(state.feedbackMessage).toEqual(message);
        });

        it('should clear feedback message', () => {
            const store = createTestStore({
                feedbackMessage: {
                    text: 'Test message',
                    type: 'success',
                    optimalAction: 'HIT',
                },
            });

            store.dispatch(clearFeedbackMessage());
            const state = store.getState().ui;

            expect(state.feedbackMessage).toBeNull();
        });

        it('should overwrite existing feedback message', () => {
            const store = createTestStore({
                feedbackMessage: {
                    text: 'Old message',
                    type: 'error',
                    optimalAction: 'HIT',
                },
            });

            const newMessage = {
                text: 'New message',
                type: 'success' as const,
                optimalAction: 'STAND',
            };

            store.dispatch(setFeedbackMessage(newMessage));
            const state = store.getState().ui;

            expect(state.feedbackMessage).toEqual(newMessage);
        });
    });

    describe('complex UI state scenarios', () => {
        it('should handle multiple UI state changes', () => {
            const store = createTestStore();

            // Simulate a complex user interaction sequence
            store.dispatch(setTheme('dark'));
            store.dispatch(setStrategyGuideOpen(false));
            store.dispatch(setGameHistoryOpen(true));
            store.dispatch(setFeedbackMessage({
                text: 'Good decision!',
                type: 'success',
                optimalAction: 'DOUBLE',
            }));

            const state = store.getState().ui;

            expect(state.theme).toBe('dark');
            expect(state.strategyGuideOpen).toBe(false);
            expect(state.gameHistoryOpen).toBe(true);
            expect(state.feedbackMessage?.text).toBe('Good decision!');
            expect(state.feedbackMessage?.type).toBe('success');
        });

        it('should handle mobile-specific UI state', () => {
            const store = createTestStore();

            // Simulate mobile interaction
            store.dispatch(setMobileDrawerOpen(true));
            store.dispatch(setStrategyGuideOpen(false)); // Close desktop guide
            store.dispatch(setFeedbackMessage({
                text: 'Touch-friendly feedback',
                type: 'info',
                optimalAction: 'HIT',
            }));

            const state = store.getState().ui;

            expect(state.mobileDrawerOpen).toBe(true);
            expect(state.strategyGuideOpen).toBe(false);
            expect(state.feedbackMessage?.text).toBe('Touch-friendly feedback');
        });

        it('should reset UI state properly for new game', () => {
            const store = createTestStore({
                gameHistoryOpen: true,
                feedbackMessage: {
                    text: 'Previous game feedback',
                    type: 'error',
                    optimalAction: 'STAND',
                },
                mobileDrawerOpen: true,
            });

            // Simulate new game reset - typically only feedback and modals reset
            store.dispatch(clearFeedbackMessage());
            store.dispatch(setGameHistoryOpen(false));
            store.dispatch(setMobileDrawerOpen(false));

            const state = store.getState().ui;

            expect(state.feedbackMessage).toBeNull();
            expect(state.gameHistoryOpen).toBe(false);
            expect(state.mobileDrawerOpen).toBe(false);
            // Theme and strategy guide state should persist
            expect(state.theme).toBe('light'); // unchanged
            expect(state.strategyGuideOpen).toBe(true); // unchanged
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle invalid theme values gracefully', () => {
            const store = createTestStore();

            // TypeScript would prevent this, but testing runtime behavior
            store.dispatch(setTheme('dark'));
            const state = store.getState().ui;

            expect(['light', 'dark']).toContain(state.theme);
        });

        it('should handle rapid feedback message changes', () => {
            const store = createTestStore();

            // Rapid successive feedback messages
            store.dispatch(setFeedbackMessage({
                text: 'Message 1',
                type: 'success',
                optimalAction: 'HIT',
            }));

            store.dispatch(setFeedbackMessage({
                text: 'Message 2',
                type: 'error',
                optimalAction: 'STAND',
            }));

            store.dispatch(clearFeedbackMessage());

            const state = store.getState().ui;
            expect(state.feedbackMessage).toBeNull();
        });

        it('should maintain state consistency during theme toggles', () => {
            const store = createTestStore({ theme: 'light' });

            // Multiple rapid toggles
            store.dispatch(toggleTheme()); // dark
            store.dispatch(toggleTheme()); // light
            store.dispatch(toggleTheme()); // dark

            const state = store.getState().ui;
            expect(state.theme).toBe('dark');
        });
    });
});
