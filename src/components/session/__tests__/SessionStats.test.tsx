import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SessionStats } from '../SessionStats';
import sessionReducer from '../../../store/sessionSlice';

const createTestStore = () => {
    return configureStore({
        reducer: {
            session: sessionReducer,
        },
    });
};

describe('SessionStats Component', () => {
    it('should render session statistics', () => {
        const store = createTestStore();

        render(
            <Provider store={store}>
                <SessionStats />
            </Provider>
        );

        // Check if the component renders without crashing
        expect(screen.getByRole('heading', { name: 'Session Statistics' })).toBeInTheDocument();
    });
});
