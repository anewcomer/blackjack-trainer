import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { StrategyCell } from '../types/strategy';

export type ScreenSize = 'MOBILE' | 'TABLET' | 'DESKTOP';
export type StrategyTab = 'HARD' | 'SOFT' | 'PAIRS';

export interface FeedbackMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  autoHide: boolean;
  duration: number;
  timestamp: number;
}

export interface UIState {
  // Modal and Dialog State
  showHistory: boolean;
  showStrategyGuide: boolean;
  showSettings: boolean;
  activeStrategyTab: StrategyTab;

  // Visual Feedback
  feedbackMessages: FeedbackMessage[];
  highlightedCell: StrategyCell | null;

  // Responsive Design
  screenSize: ScreenSize;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;

  // Accessibility
  announcements: string[];
  reducedMotion: boolean;
  highContrast: boolean;
  darkMode: boolean;

  // Game UI State
  cardAnimationEnabled: boolean;
  soundEnabled: boolean;
  showCardValues: boolean;

  // Loading States
  gameLoading: boolean;
  strategyLoading: boolean;

  // Error States
  lastError: string | null;
}

const initialState: UIState = {
  // Modal and Dialog State
  showHistory: false,
  showStrategyGuide: true, // Show by default for learning
  showSettings: false,
  activeStrategyTab: 'HARD',

  // Visual Feedback
  feedbackMessages: [],
  highlightedCell: null,

  // Responsive Design
  screenSize: 'DESKTOP', // Will be updated based on window size
  sidebarCollapsed: false,
  mobileMenuOpen: false,

  // Accessibility
  announcements: [],
  reducedMotion: false,
  highContrast: false,
  darkMode: false,

  // Game UI State
  cardAnimationEnabled: true,
  soundEnabled: false,
  showCardValues: true,

  // Loading States
  gameLoading: false,
  strategyLoading: false,

  // Error States
  lastError: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal Management
    toggleHistoryModal: (state) => {
      state.showHistory = !state.showHistory;
    },

    setHistoryModalOpen: (state, action: PayloadAction<boolean>) => {
      state.showHistory = action.payload;
    },

    toggleStrategyGuide: (state) => {
      state.showStrategyGuide = !state.showStrategyGuide;
    },

    setStrategyGuideOpen: (state, action: PayloadAction<boolean>) => {
      state.showStrategyGuide = action.payload;
    },

    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },

    setSettingsOpen: (state, action: PayloadAction<boolean>) => {
      state.showSettings = action.payload;
    },

    setActiveStrategyTab: (state, action: PayloadAction<StrategyTab>) => {
      state.activeStrategyTab = action.payload;
    },

    // Feedback System
    addFeedbackMessage: (state, action: PayloadAction<Omit<FeedbackMessage, 'id' | 'timestamp'>>) => {
      const message: FeedbackMessage = {
        ...action.payload,
        id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      state.feedbackMessages.push(message);
    },

    removeFeedbackMessage: (state, action: PayloadAction<string>) => {
      state.feedbackMessages = state.feedbackMessages.filter(
        msg => msg.id !== action.payload
      );
    },

    clearAllFeedback: (state) => {
      state.feedbackMessages = [];
    },

    // Strategy Highlighting
    setHighlightedCell: (state, action: PayloadAction<StrategyCell | null>) => {
      state.highlightedCell = action.payload;
    },

    clearHighlightedCell: (state) => {
      state.highlightedCell = null;
    },

    // Responsive Design
    setScreenSize: (state, action: PayloadAction<ScreenSize>) => {
      state.screenSize = action.payload;

      // Auto-collapse sidebar on mobile
      if (action.payload === 'MOBILE') {
        state.sidebarCollapsed = true;
        state.showStrategyGuide = false;
      } else if (action.payload === 'DESKTOP') {
        state.sidebarCollapsed = false;
        state.showStrategyGuide = true;
      }
    },

    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },

    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },

    // Accessibility
    addAnnouncement: (state, action: PayloadAction<string>) => {
      state.announcements.push(action.payload);

      // Limit announcements to prevent memory issues
      if (state.announcements.length > 10) {
        state.announcements.shift();
      }
    },

    clearAnnouncements: (state) => {
      state.announcements = [];
    },

    setReducedMotion: (state, action: PayloadAction<boolean>) => {
      state.reducedMotion = action.payload;

      // Disable card animations if reduced motion is enabled
      if (action.payload) {
        state.cardAnimationEnabled = false;
      }
    },

    setHighContrast: (state, action: PayloadAction<boolean>) => {
      state.highContrast = action.payload;
    },

    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },

    // Game UI Settings
    setCardAnimationEnabled: (state, action: PayloadAction<boolean>) => {
      // Don't enable if reduced motion is on
      if (!state.reducedMotion) {
        state.cardAnimationEnabled = action.payload;
      }
    },

    setSoundEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundEnabled = action.payload;
    },

    setShowCardValues: (state, action: PayloadAction<boolean>) => {
      state.showCardValues = action.payload;
    },

    // Loading States
    setGameLoading: (state, action: PayloadAction<boolean>) => {
      state.gameLoading = action.payload;
    },

    setStrategyLoading: (state, action: PayloadAction<boolean>) => {
      state.strategyLoading = action.payload;
    },

    // Error Handling
    setError: (state, action: PayloadAction<string>) => {
      state.lastError = action.payload;

      // Add error as feedback message
      const errorMessage: FeedbackMessage = {
        id: `error-${Date.now()}`,
        type: 'error',
        title: 'Error',
        message: action.payload,
        autoHide: false,
        duration: 0,
        timestamp: Date.now(),
      };
      state.feedbackMessages.push(errorMessage);
    },

    clearError: (state) => {
      state.lastError = null;
    },

    // Reset UI state
    resetUIState: (state) => {
      return {
        ...initialState,
        // Preserve user preferences
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        cardAnimationEnabled: state.cardAnimationEnabled && !state.reducedMotion,
        soundEnabled: state.soundEnabled,
        showCardValues: state.showCardValues,
        screenSize: state.screenSize,
      };
    },
  },
});

export const {
  toggleHistoryModal,
  setHistoryModalOpen,
  toggleStrategyGuide,
  setStrategyGuideOpen,
  toggleSettings,
  setSettingsOpen,
  setActiveStrategyTab,
  addFeedbackMessage,
  removeFeedbackMessage,
  clearAllFeedback,
  setHighlightedCell,
  clearHighlightedCell,
  setScreenSize,
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileMenu,
  setMobileMenuOpen,
  addAnnouncement,
  clearAnnouncements,
  setReducedMotion,
  setHighContrast,
  setDarkMode,
  setCardAnimationEnabled,
  setSoundEnabled,
  setShowCardValues,
  setGameLoading,
  setStrategyLoading,
  setError,
  clearError,
  resetUIState,
} = uiSlice.actions;

// Selectors
export const selectDarkMode = (state: { ui: UIState }): boolean => state.ui.darkMode;
export const selectScreenSize = (state: { ui: UIState }): ScreenSize => state.ui.screenSize;
export const selectMobileMenuOpen = (state: { ui: UIState }): boolean => state.ui.mobileMenuOpen;
export const selectSidebarCollapsed = (state: { ui: UIState }): boolean => state.ui.sidebarCollapsed;
export const selectHighlightedCell = (state: { ui: UIState }): StrategyCell | null => state.ui.highlightedCell;
export const selectFeedbackMessages = (state: { ui: UIState }): FeedbackMessage[] => state.ui.feedbackMessages;
export const selectAnnouncements = (state: { ui: UIState }): string[] => state.ui.announcements;
export const selectCardAnimationEnabled = (state: { ui: UIState }): boolean => state.ui.cardAnimationEnabled;
export const selectReducedMotion = (state: { ui: UIState }): boolean => state.ui.reducedMotion;
export const selectHighContrast = (state: { ui: UIState }): boolean => state.ui.highContrast;

export default uiSlice.reducer;
