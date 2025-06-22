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

## Action row button overflow

The spacing of the action buttons is too wide. The right most button -- "Surrender" -- wraps to a new row. All buttons should fit on a single row.

## Best strategy highlight bug

A scenario occurred where I had hard 19 and the dealer had 6, but there was no correct strategy highlighed on the strategy guide. I suspect this might be because "19" is not an explicit row in the guide, but falls under "17+".
