// Strategy engine - main public API (uses decomposed modules)
// Following Single Responsibility Principle

// Re-export the clean API from the decomposed strategy modules
export {
  getOptimalAction,
  evaluateDecision,
  getStrategyCellCoordinates,
  getActionName
} from './strategy/index';
