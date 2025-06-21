import { configureStore } from '@reduxjs/toolkit';
import uiReducer, {
    uiSlice,
    setDarkMode,
    toggleHistoryModal,
    toggleStrategyGuide,
    addFeedbackMessage,
    clearAllFeedback,
    toggleMobileMenu,
} from '../uiSlice';
import type { UIState } from '../uiSlice';

const createTestStore = (initialState?: Partial<UIState>) => {
    return configureStore({
        reducer: {
            ui: uiReducer,
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

            expect(state.darkMode).toBe(false);
            expect(state.showStrategyGuide).toBe(true);
            expect(state.showHistory).toBe(false);
            expect(state.feedbackMessages).toEqual([]);
            expect(state.mobileMenuOpen).toBe(false);
        });
    });

    describe('theme management', () => {
        it('should set theme to dark', () => {
            const store = createTestStore();

            store.dispatch(setDarkMode(true));
            const state = store.getState().ui;

            expect(state.darkMode).toBe(true);
        });

        it('should set theme to light', () => {
            const store = createTestStore({ darkMode: true });

            store.dispatch(setDarkMode(false));
            const state = store.getState().ui;

            expect(state.darkMode).toBe(false);
        });

        it('should toggle theme from light to dark', () => {
            const store = createTestStore({ darkMode: false });

            store.dispatch(setDarkMode(true));
            const state = store.getState().ui;

            expect(state.darkMode).toBe(true);
        });

        it('should toggle theme from dark to light', () => {
            const store = createTestStore({ darkMode: true });

            store.dispatch(setDarkMode(false));
            const state = store.getState().ui;

            expect(state.darkMode).toBe(false);
        });
    });

    describe('modal and panel management', () => {
        it('should open strategy guide', () => {
            const store = createTestStore({ showStrategyGuide: false });

            store.dispatch(toggleStrategyGuide());
            const state = store.getState().ui;

            expect(state.showStrategyGuide).toBe(true);
        });

        it('should close strategy guide', () => {
            const store = createTestStore({ showStrategyGuide: true });

            store.dispatch(toggleStrategyGuide());
            const state = store.getState().ui;

            expect(state.showStrategyGuide).toBe(false);
        });

        it('should open game history modal', () => {
            const store = createTestStore({ showHistory: false });

            store.dispatch(toggleHistoryModal());
            const state = store.getState().ui;

            expect(state.showHistory).toBe(true);
        });

        it('should close game history modal', () => {
            const store = createTestStore({ showHistory: true });

            store.dispatch(toggleHistoryModal());
            const state = store.getState().ui;

            expect(state.showHistory).toBe(false);
        });

        it('should open mobile drawer', () => {
            const store = createTestStore({ mobileMenuOpen: false });

            store.dispatch(toggleMobileMenu());
            const state = store.getState().ui;

            expect(state.mobileMenuOpen).toBe(true);
        });

        it('should close mobile drawer', () => {
            const store = createTestStore({ mobileMenuOpen: true });

            store.dispatch(toggleMobileMenu());
            const state = store.getState().ui;

            expect(state.mobileMenuOpen).toBe(false);
        });
    });

    describe('feedback message management', () => {
        it('should set feedback message', () => {
            const store = createTestStore();

            const message = {
                id: 'test-1',
                type: 'success' as const,
                title: 'Success',
                message: 'Operation completed',
                autoHide: true,
                duration: 3000,
                timestamp: Date.now(),
            };

            store.dispatch(addFeedbackMessage(message));
            const state = store.getState().ui;

            expect(state.feedbackMessages).toHaveLength(1);
            const addedMessage = state.feedbackMessages[0];
            expect(addedMessage.type).toBe('success');
            expect(addedMessage.title).toBe('Success');
            expect(addedMessage.message).toBe('Operation completed');
            expect(addedMessage.autoHide).toBe(true);
            expect(addedMessage.duration).toBe(3000);
            expect(addedMessage.id).toBeDefined();
            expect(addedMessage.timestamp).toBeDefined();
        });

        it('should set error feedback message', () => {
            const store = createTestStore();

            const message = {
                id: 'test-error',
                type: 'error' as const,
                title: 'Error',
                message: 'Something went wrong',
                autoHide: false,
                duration: 0,
                timestamp: Date.now(),
            };

            store.dispatch(addFeedbackMessage(message));
            const state = store.getState().ui;

            expect(state.feedbackMessages).toHaveLength(1);
            expect(state.feedbackMessages[0].type).toBe('error');
        });

        it('should clear feedback message', () => {
            const store = createTestStore({
                feedbackMessages: [{
                    id: 'test-1',
                    type: 'success',
                    title: 'Success',
                    message: 'Test message',
                    autoHide: true,
                    duration: 3000,
                    timestamp: Date.now(),
                }],
            });

            store.dispatch(clearAllFeedback());
            const state = store.getState().ui;

            expect(state.feedbackMessages).toEqual([]);
        });

        it('should overwrite existing feedback message', () => {
            const store = createTestStore({
                feedbackMessages: [{
                    id: 'test-1',
                    type: 'info',
                    title: 'Info',
                    message: 'First message',
                    autoHide: true,
                    duration: 3000,
                    timestamp: Date.now(),
                }],
            });

            const newMessage = {
                id: 'test-2',
                type: 'warning' as const,
                title: 'Warning',
                message: 'Second message',
                autoHide: true,
                duration: 3000,
                timestamp: Date.now(),
            };

            store.dispatch(addFeedbackMessage(newMessage));
            const state = store.getState().ui;

            expect(state.feedbackMessages).toHaveLength(2);
        });
    });

    describe('complex UI state scenarios', () => {
        it('should handle multiple UI state changes', () => {
            const store = createTestStore();

            store.dispatch(setDarkMode(true));
            store.dispatch(toggleStrategyGuide());
            store.dispatch(toggleHistoryModal());

            const state = store.getState().ui;

            expect(state.darkMode).toBe(true);
            expect(state.showStrategyGuide).toBe(false);
            expect(state.showHistory).toBe(true);
        });

        it('should handle mobile-specific UI state', () => {
            const store = createTestStore();

            store.dispatch(toggleMobileMenu());
            const state = store.getState().ui;

            expect(state.mobileMenuOpen).toBe(true);
        });

        it('should reset UI state properly for new game', () => {
            const store = createTestStore({
                darkMode: true,
                showHistory: true,
                feedbackMessages: [{
                    id: 'test',
                    type: 'info',
                    title: 'Test',
                    message: 'Test message',
                    autoHide: true,
                    duration: 3000,
                    timestamp: Date.now(),
                }],
            });

            store.dispatch(clearAllFeedback());
            const state = store.getState().ui;

            expect(state.feedbackMessages).toEqual([]);
            expect(state.darkMode).toBe(true); // Theme should persist
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle invalid theme values gracefully', () => {
            const store = createTestStore();

            store.dispatch(setDarkMode(true));
            store.dispatch(setDarkMode(false));
            const state = store.getState().ui;

            expect(state.darkMode).toBe(false);
        });

        it('should handle rapid feedback message changes', () => {
            const store = createTestStore();

            const message1 = {
                id: 'rapid-1',
                type: 'info' as const,
                title: 'Message 1',
                message: 'First rapid message',
                autoHide: true,
                duration: 1000,
                timestamp: Date.now(),
            };

            const message2 = {
                id: 'rapid-2',
                type: 'warning' as const,
                title: 'Message 2',
                message: 'Second rapid message',
                autoHide: true,
                duration: 1000,
                timestamp: Date.now() + 100,
            };

            store.dispatch(addFeedbackMessage(message1));
            store.dispatch(addFeedbackMessage(message2));

            const state = store.getState().ui;
            expect(state.feedbackMessages).toHaveLength(2);
        });

        it('should maintain state consistency during theme toggles', () => {
            const store = createTestStore({ darkMode: false });

            // Multiple rapid toggles
            store.dispatch(setDarkMode(true));
            store.dispatch(setDarkMode(false));
            store.dispatch(setDarkMode(true));

            const state = store.getState().ui;
            expect(state.darkMode).toBe(true);
        });
    });
});
