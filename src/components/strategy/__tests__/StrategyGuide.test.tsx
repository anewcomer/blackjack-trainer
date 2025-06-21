import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StrategyGuide from '../StrategyGuide';
import uiReducer from '../../../store/uiSlice';
import gameReducer from '../../../store/gameSlice';

const createTestStore = () => {
    return configureStore({
        reducer: {
            ui: uiReducer,
            game: gameReducer,
        },
    });
};

describe('StrategyGuide Component', () => {
    it('should render strategy guide content', () => {
        const store = createTestStore();

        render(
            <Provider store={store}>
                <StrategyGuide />
            </Provider>
        );

        // Check if the component renders without crashing
        expect(screen.getByText('Basic Strategy Guide')).toBeInTheDocument();
    });
});
