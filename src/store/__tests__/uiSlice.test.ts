import { configureStore } from '@reduxjs/toolkit';
import uiSlice, {
    setDarkMode,
    toggleHistoryModal,
    toggleStrategyGuide,
    addFeedbackMessage,
    clearAllFeedback,
    resetUIState,
} from '../uiSlice';
import { UIState } from '../uiSlice';

type RootState = {
    ui: UIState;
};

describe('uiSlice', () => {
    let store: ReturnType<typeof configureStore<RootState>>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                ui: uiSlice,
            },
        });
    });

    describe('initial state', () => {
        it('should have correct initial state', () => {
            const state = store.getState().ui;

            expect(state.darkMode).toBe(false);
            expect(state.showStrategyGuide).toBe(true);
            expect(state.showHistory).toBe(false);
            expect(state.showSettings).toBe(false);
            expect(state.mobileMenuOpen).toBe(false);
            expect(state.sidebarCollapsed).toBe(false);
            expect(state.feedbackMessages).toEqual([]);
            expect(state.announcements).toEqual([]);
            expect(state.cardAnimationEnabled).toBe(true);
            expect(state.reducedMotion).toBe(false);
            expect(state.highContrast).toBe(false);
        });
    });

    describe('theme management', () => {
        it('should set dark mode to true', () => {
            store.dispatch(setDarkMode(true));
            const state = store.getState().ui;

            expect(state.darkMode).toBe(true);
        });

        it('should set dark mode to false', () => {
            store.dispatch(setDarkMode(false));
            const state = store.getState().ui;

            expect(state.darkMode).toBe(false);
        });
    });

    describe('modal management', () => {
        it('should toggle strategy guide', () => {
            const initialState = store.getState().ui.showStrategyGuide;

            store.dispatch(toggleStrategyGuide());
            const newState = store.getState().ui;

            expect(newState.showStrategyGuide).toBe(!initialState);
        });

        it('should toggle history modal', () => {
            const initialState = store.getState().ui.showHistory;

            store.dispatch(toggleHistoryModal());
            const newState = store.getState().ui;

            expect(newState.showHistory).toBe(!initialState);
        });
    });

    describe('feedback management', () => {
        it('should add feedback message', () => {
            const message = {
                type: 'success' as const,
                title: 'Test Success',
                message: 'This is a test message',
                autoHide: true,
                duration: 5000,
            };

            store.dispatch(addFeedbackMessage(message));
            const state = store.getState().ui;

            expect(state.feedbackMessages).toHaveLength(1);
            expect(state.feedbackMessages[0].title).toBe('Test Success');
            expect(state.feedbackMessages[0].message).toBe('This is a test message');
            expect(state.feedbackMessages[0].type).toBe('success');
            expect(state.feedbackMessages[0].id).toBeDefined();
            expect(state.feedbackMessages[0].timestamp).toBeDefined();
        });

        it('should clear all feedback messages', () => {
            // Add a message first
            const message = {
                type: 'info' as const,
                title: 'Info',
                message: 'Test message',
                autoHide: true,
                duration: 3000,
            };

            store.dispatch(addFeedbackMessage(message));
            expect(store.getState().ui.feedbackMessages).toHaveLength(1);

            store.dispatch(clearAllFeedback());
            const state = store.getState().ui;

            expect(state.feedbackMessages).toEqual([]);
        });
    });

    describe('UI state reset', () => {
        it('should reset UI state to initial values', () => {
            // Change some state first
            store.dispatch(setDarkMode(true));
            store.dispatch(toggleHistoryModal());

            // Reset and verify
            store.dispatch(resetUIState());
            const state = store.getState().ui;

            expect(state.darkMode).toBe(false);
            expect(state.showHistory).toBe(false);
            expect(state.showStrategyGuide).toBe(true);
            expect(state.feedbackMessages).toEqual([]);
        });
    });
});
