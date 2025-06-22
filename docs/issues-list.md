# Issues List

This document lists known issues with the game, along with their status and any relevant notes. Whenever we start a new chat, consider the issues listed here as a starting point for items to address.

## Summary

**All Known Issues Resolved ✅**  
**Date**: June 22, 2025  
**Status**: All 3 identified issues have been successfully fixed and verified.

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

## Strategy Guid Content Height Scrolling Bug

An issue exists where the strategy guide content requires scrolling -- the rows