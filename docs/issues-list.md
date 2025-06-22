# Issues List

This document lists known issues with the game, along with their status and any relevant notes. Whenever we start a new chat, consider the issues listed here as a starting point for items to address. 

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

## Best strategy highlight bug

A scenario occurred where I had hard 19 and the dealer had 6, but there was no correct strategy highlighed on the strategy guide. I suspect this might be because "19" is not an explicit row in the guide, but falls under "17+".
