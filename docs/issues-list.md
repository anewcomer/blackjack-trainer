# Issues List

This document lists known issues with the game, along with their status and any relevant notes. Whenever we start a new chat, consider the issues listed here as a starting point for items to address.

## Display Issues

✅ **RESOLVED**: The layout has been reorganized as follows:
- First row now contains the play area and strategy guide
- Second row contains Session Statistics, Mistake Patterns, and Game History
- On mobile/narrow displays, all components stack vertically in a single column

The reorganization improves the overall layout by:
1. Providing more focus on the play area and strategy guide
2. Creating a more balanced visual distribution of components
3. Better utilizing horizontal space on wider screens


## Stategy Guy Highlight Bug: Hard 8 or Less

During testing, the player had hard 6, but there was no correct strategy highlighted. This is likely due to the pertinent row having title "8 or less", so start looking there.

## Game History Styling: Stands Out Too Much

The Game history area (the fifth card of the primary play area) stands out too much because it does not look like the styling of the play areas (no border, no background color, etc.). It should be styled to match the other play areas.

Also, the "View Details" button should not be enabled if there is no game history to view. This can be done by checking if the game history is empty and disabling the button accordingly.

