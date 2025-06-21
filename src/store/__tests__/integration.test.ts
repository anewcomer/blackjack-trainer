import { configureStore } from '@reduxjs/toolkit';
import gameSlice from '../gameSlice';
import sessionSlice from '../sessionSlice';
import uiSlice from '../uiSlice';

// Simple integration test to verify store setup
describe('Redux Store Integration', () => {
    it('should create store with all slices', () => {
        const store = configureStore({
            reducer: {
                game: gameSlice,
                session: sessionSlice,
                ui: uiSlice,
            },
        });

        const state = store.getState();

        // Test basic structure exists
        expect(state).toHaveProperty('game');
        expect(state).toHaveProperty('session');
        expect(state).toHaveProperty('ui');

        // Test initial values
        expect(state.game.gamePhase).toBe('INITIAL');
        expect(state.ui.darkMode).toBe(false);
        expect(state.session.skillLevel).toBe('BEGINNER');
    });

    it('should handle basic UI actions', () => {
        const store = configureStore({
            reducer: {
                ui: uiSlice,
            },
        });

        // Import actions from uiSlice
        const { setDarkMode, setStrategyGuideOpen } = require('../uiSlice');

        store.dispatch(setDarkMode(true));
        expect(store.getState().ui.darkMode).toBe(true);

        store.dispatch(setStrategyGuideOpen(false));
        expect(store.getState().ui.showStrategyGuide).toBe(false);
    });
});
