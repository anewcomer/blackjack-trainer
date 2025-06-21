# Issues & Lessons Learned

## Development Issues Encountered

### TypeScript Import/Export Issues
**Problem**: Multiple TypeScript compilation errors due to incorrect imports and missing type definitions.

**Lessons Learned**:
- Always check import statements when creating new files with dependencies
- Use the `get_errors` tool to verify TypeScript compilation before proceeding
- Clean up unused imports immediately to avoid ESLint warnings that can mask real issues
- When creating Redux slices, ensure all action creators are properly exported and imported

**Solution Pattern**:
1. Check compilation with VSCode tasks: `Quick Verification` or `Verify Code Quality`
2. Fix import/export issues systematically
3. Remove unused imports to keep warnings clean

### Redux Thunk Type Safety
**Problem**: Complex async thunks with proper TypeScript typing were challenging to implement correctly.

**Lessons Learned**:
- Use `AppDispatch` and `RootState` types consistently in thunk signatures
- Import action creators individually rather than as namespace imports for better tree-shaking
- Action payload types must match exactly between slice definitions and thunk dispatch calls
- Always validate action shapes against slice reducer expectations

**Solution Pattern**:
```typescript
export const thunkName = () => (dispatch: AppDispatch, getState: () => RootState) => {
  // Implementation with proper typing
};
```

### VSCode Task Integration
**Problem**: Initial attempts to use VS Code tasks for development workflow failed.

**Lessons Learned**:
- VS Code task system may not be available in all development environments
- Always have fallback terminal commands for critical operations
- Use tasks for verification but not for long-running processes like dev servers
- Prefer `npm run build && npm run lint` over `npm start` for code verification

**Solution Pattern**:
- Create specific tasks for discrete operations (build, lint, type-check)
- Use task dependencies to chain operations
- Avoid background tasks for verification workflows

### MUI v7 API Changes
**Problem**: MUI Grid layout caused compilation issues, requiring migration to Stack/Box components.

**Lessons Learned**:
- MUI v7 has breaking changes from previous versions
- Stack and Box components provide more reliable layout solutions
- Always check MUI documentation for current API patterns
- Test UI components early to catch layout issues

**Solution Pattern**:
```tsx
// Prefer Stack/Box over Grid for simpler layouts
<Stack spacing={2} direction="row">
  <Box>Content</Box>
</Stack>
```

### Game State Management Complexity
**Problem**: Managing complex game state transitions with multiple hands, dealer automation, and action validation.

**Lessons Learned**:
- Design Redux slices with clear separation of concerns
- Use thunks for complex async operations rather than overloading reducers
- Implement action logging early for debugging complex state transitions
- Test state transitions incrementally rather than building complete flows at once

**Solution Pattern**:
1. Define clear interfaces for all state shapes
2. Create utility functions for game logic calculations
3. Use thunks for orchestrating multiple state updates
4. Log actions for debugging and analytics

### Development Server Management
**Problem**: Long-running development server processes don't complete naturally and can interfere with task workflows.

**Lessons Learned**:
- Use development server for manual testing, not automated verification
- Prefer build + lint tasks for code quality verification
- Background processes should be used sparingly and with clear termination strategies
- Document when to use dev server vs. verification tasks

**Solution Pattern**:
- Manual testing: `npm start` 
- Automated verification: `npm run build && npm run lint && npm run type-check`
- Use VSCode tasks for repeatable verification workflows

## Recurring Problem Prevention

### Before Starting New Features
1. **Plan Redux State**: Design interfaces and slice structure first
2. **Create Utility Functions**: Build game logic utilities before UI integration
3. **Set Up Verification**: Ensure build/lint tasks work before adding complexity
4. **Test Incrementally**: Implement and test small pieces rather than complete features

### When Encountering Errors
1. **Check Compilation**: Use `Quick Verification` task first
2. **Isolate Issues**: Fix one type of error at a time (imports → types → logic)
3. **Clean Code**: Remove unused imports and variables as you go
4. **Document Solutions**: Add patterns that work to this issues file

### Code Quality Maintenance
1. **Regular Verification**: Run lint and type-check frequently during development
2. **Import Hygiene**: Clean up imports immediately when removing functionality
3. **Type Safety**: Never use `any` types; define proper interfaces
4. **Error Handling**: Check for and handle edge cases in game logic

## Best Practices Established

### **🔧 Development Workflow Enhancement**
- **Primary Tool**: Use `get_errors` for rapid development feedback
- **Targeted Checking**: Check specific files rather than running full builds
- **Terminal Verification**: Reserve for final validation and pre-commit checks
- **Continuous Integration**: Use both tools in complementary workflows

**Example Improved Workflow**:
```typescript
// 1. Make changes to components
// 2. Quick check: get_errors(["/path/to/modified/files"])
// 3. Fix any immediate issues
// 4. Continue development
// 5. Final verification: npm run lint && npm run type-check
```

**Performance Benefits**:
- **~90% faster** feedback during development
- **Immediate error detection** without full compilation
- **Reduced context switching** between terminal and editor
- **Better error context** with precise file and line information

### Redux Architecture
- Use typed hooks (`useAppDispatch`, `useAppSelector`)
- Keep reducers pure; use thunks for side effects
- Structure slices by domain (game, session, ui)
- Use action creators consistently

### TypeScript Integration
- Define interfaces before implementation
- Use strict type checking throughout
- Import types explicitly when needed
- Avoid type assertions; fix root type issues

### Development Workflow
- Prefer VSCode tasks over manual terminal commands
- Use verification tasks before committing code
- Test UI components with actual Redux integration
- Update documentation as you implement features

### Component Architecture
- Separate layout, game logic, and strategy components
- Use proper Material-UI patterns for v7
- Implement responsive design from the start
- Keep components focused on single responsibilities

## Performance Considerations

### Redux Performance
- Use selectors to prevent unnecessary re-renders
- Structure state to minimize update frequency
- Batch related state updates in thunks
- Profile component re-renders during complex interactions

### UI Performance
- Minimize prop drilling; use Redux for shared state
- Implement proper key props for dynamic lists (cards, hands)
- Use React.memo sparingly and only when profiling shows benefit
- Test performance with multiple hands/complex game states

This issues log will be updated as new challenges are encountered and solved during continued development.
