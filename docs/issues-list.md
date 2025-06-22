# Issues List

This document lists known issues with the game, along with their status and any relevant notes. Whenever we start a new chat, consider the issues listed here as a starting point for items to address.

## Summary

**Status**: All 6 issues resolved ✅  
**Date**: June 22, 2025  
**Latest Fix**: Title bar tweaks completed - End Session button converted to icon button, Session history placeholder removed.

## Completed Fixes 

## Card face styling bug ✅ FIXED

**Status**: RESOLVED  
**Fix Applied**: June 22, 2025  

~~The inverted characters displayed on the face of the card overlow out of the bottom of the face of the card.~~

**Solution**: 
- Added `overflow: 'hidden'` to the main card container to prevent content overflow
- Added proper margins (`marginRight: '2px', marginBottom: '2px'`) to the rotated bottom-right corner text
- Set `transformOrigin: 'center center'` for more predictable rotation behavior
- Added `overflow: 'hidden'` to the rotated text container as an additional safeguard

The rotated rank and suit symbols in the bottom-right corner now stay properly contained within the card boundaries.

## Action row button overflow ✅ FIXED

**Status**: RESOLVED  
**Fix Applied**: June 22, 2025  

~~The spacing of the action buttons is too wide. The right most button -- "Surrender" -- wraps to a new row. All buttons should fit on a single row.~~

**Solution**: 
- Reduced button spacing from `spacing={2}` to `spacing={1}` in the Stack component
- Added `gap: 1` in sx styles for consistent spacing
- Changed button size from `size="large"` to `size="medium"` to make them more compact
- Added `minWidth: 80` to all buttons for consistent sizing
- Added responsive design: `flexWrap: 'nowrap'` on screens ≥640px to prevent wrapping on desktop
- Maintained `flexWrap="wrap"` for smaller screens to ensure usability on mobile devices

All five action buttons (Hit, Stand, Double, Split, Surrender) now fit comfortably on a single row on desktop and tablet screens, while still being responsive for mobile devices.

## Best strategy highlight bug ✅ FIXED

**Status**: RESOLVED  
**Fix Applied**: June 22, 2025  

~~A scenario occurred where I had hard 19 and the dealer had 6, but there was no correct strategy highlighed on the strategy guide. I suspect this might be because "19" is not an explicit row in the guide, but falls under "17+".~~

**Root Cause**: The coordinate calculation function incorrectly assumed each hard total value had its own row in the strategy chart. However, the strategy chart only has 10 rows for hard totals (8-17+), where the last row covers all values 17 and above.

**Problem**: 
- Hard 17 → row 9 (correct mapping to "17+" row)
- Hard 19 → row 11 (incorrect - row 11 doesn't exist!)

**Solution**: 
Updated `coordinateCalculator.ts` to properly map hard totals 17 and above to the correct row index (9) in the hard totals chart. The fix ensures:
- Hard values 8-16 map to rows 0-8 respectively  
- Hard values 17+ (including 18, 19, 20, 21) all map to row 9 (the "17+" row)

**Verification**:
- ✅ All 147 existing tests continue to pass (was 131, now +16 new tests)
- ✅ Hard 19 vs dealer 6 now correctly highlights the "17+" row showing "Stand" 
- ✅ All other hard totals 17-21 also highlight correctly
- ✅ **Regression Test Added**: Specific unit test for hard 19 vs dealer 6 scenario to prevent future regressions

**New Test Coverage**: Created comprehensive unit tests in `src/utils/strategy/__tests__/coordinateCalculator.test.ts` covering:
- Hard totals mapping (including the critical "17+" row mapping)
- Soft totals mapping  
- Pairs table mapping
- Edge cases and boundary conditions
- The specific bug scenario as a labeled regression test

## Strategy Guide Content Height Scrolling Bug ✅ FIXED

**Status**: RESOLVED  
**Fix Applied**: June 22, 2025  

~~An issue exists where the strategy guide content requires scrolling -- the title row is correctly fixed at the top, but the content below it should not be scrollable. Instead, the entire strategy guide should be fixed height.~~

**Root Cause**: The `StrategyTable` component had `maxHeight: 400, overflow: 'auto'` which forced the strategy tables to scroll within a fixed 400px container, even when the parent container had sufficient space.

**Solution**: 
- **StrategyTable.tsx**: Removed `maxHeight: 400, overflow: 'auto'` constraint and replaced with `height: 'auto'` to allow natural table sizing
- **StrategyGuide.tsx**: Improved layout structure with flexbox (`display: 'flex', flexDirection: 'column'`) and flexible table container (`flex: 1, minHeight: 0`) 
- The tables now fill the available space within the parent container without creating unnecessary scrollbars

**Result**: The strategy guide now properly uses the full height of its container (600px on desktop) without internal scrolling. Tables display all rows naturally, and the entire guide fits within the designated layout space.

**Verification**: 
- ✅ StrategyGuide tests continue to pass
- ✅ Strategy tables no longer have internal scrolling
- ✅ Layout remains responsive across desktop, tablet, and mobile

## Move Subtitle Functionality into Title and Remove Subtitle ✅ FIXED

**Status**: RESOLVED  
**Fix Applied**: June 22, 2025  

~~I want to update the title by moving the Session Status and Progress indicator into the title bar (just after the game title), and moving the End Session button, Reset icon, and clock icon into the title on the right side (just before the game settings icon). This will allow us to remove the subtitle and have a cleaner title bar.~~

**Solution**: 
- **AppBar Integration**: Moved session status and progress indicators directly into the main AppBar after the "Blackjack Trainer" title
- **Session Status Display**: Added Active/Ended status chip and clock icon with session duration in the title bar
- **Progress Indicator**: Included hands played and decisions count as compact text in the title bar
- **Action Buttons**: Moved End Session/New Session button, Reset icon, and History icon to the right side of the AppBar (before theme toggle)
- **Responsive Design**: Session controls hidden on mobile (moved to mobile drawer), full display on desktop/tablet
- **Removed Subtitle**: Completely removed the SessionControls component and its separate container for a cleaner layout
- **Mobile Integration**: Added session controls to the mobile analytics drawer for consistent functionality

**Layout Changes**:
- **Desktop**: Title | Session Status + Progress | Action Buttons | Theme Toggle | Strategy Button
- **Mobile**: Session controls integrated into the bottom drawer with analytics
- **Removed**: Separate SessionControls component and its dedicated space below the header

**Result**: The title bar now contains all session information and controls in a consolidated, professional layout. The separate subtitle area has been eliminated, providing more screen real estate for the main game content.

**Verification**: 
- ✅ All 147 tests continue to pass
- ✅ Build successful with no compilation errors  
- ✅ Desktop layout shows integrated session controls in title bar
- ✅ Mobile layout preserves functionality in analytics drawer
- ✅ Responsive design maintains usability across all screen sizes

## Title Bar Tweaks ✅ FIXED

**Status**: RESOLVED  
**Fix Applied**: June 22, 2025  

~~Make the "End Session" button into an icon button like the "Reset all data" button.~~

~~Also remove the "Session history" placeholder button.~~

**Solution**: 
- **End Session Button**: Converted from text button with outline styling to clean icon button with tooltip
- **New Session Button**: Similarly converted to icon button with PlayArrow icon and tooltip 
- **Removed Session History**: Eliminated the disabled placeholder "Session history" button entirely
- **Consistent Styling**: All session action buttons now use consistent icon button styling with rgba colors
- **Cleaner Layout**: Reduced visual noise in the title bar with more compact icon-based controls

**Before**: `[End Session]` `[Reset]` `[History (disabled)]`  
**After**: `[Stop Icon]` `[Reset Icon]` 

**Result**: The title bar now has a cleaner, more professional appearance with consistent icon buttons for all session actions. The removal of the placeholder history button eliminates visual clutter while maintaining full functionality.

**Verification**: 
- ✅ All 147 tests continue to pass
- ✅ Build successful with no warnings or errors
- ✅ End Session and New Session buttons work as icon buttons with tooltips
- ✅ Session history placeholder button successfully removed
- ✅ Consistent visual styling across all title bar controls
