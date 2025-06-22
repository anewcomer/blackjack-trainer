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

## ✅ **RESOLVED**: Strategy Guide Highlight Bug: Hard 8 or Less

During testing, the player had hard 6, but there was no correct strategy highlighted. This was due to the highlighting function not properly mapping values below 8 to the "8 or less" row. This has been fixed by updating the coordinate calculator to properly handle all hand values from 1-8.

## ✅ **RESOLVED**: Game History Styling: Stands Out Too Much

The Game History area has been updated with styling to match other play areas, including border, background color, and consistent styling.

The "View Details" button is now disabled when there is no game history to view.

## Add link to this repo in footer

## General styling clean-up

Like the visible play state constants.