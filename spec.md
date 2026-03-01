# WinGo Colour Prediction App

## Current State
New project -- no existing code.

## Requested Changes (Diff)

### Add
- User registration/login with Internet Identity
- Starting virtual coins (e.g. 1000 coins) for each new user
- WinGo-style game: random result from 0-9 each round
- Colour mapping: 1,3,7,9 = Red | 2,4,6,8 = Green | 0,5 = Violet
- Bet placement: user picks a number (0-9) or a colour (Red/Green/Violet) and bets an amount
- Payout logic:
  - Correct number prediction: 9x bet
  - Correct colour prediction: 2x bet
  - Wrong prediction: lose bet amount
- Round timer: 30 seconds per round, then result is revealed
- Bet history: each user can see their past bets and outcomes
- Leaderboard: top users by coin balance
- Multiplayer: multiple users can bet in the same round simultaneously

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko):
   - User profile management: store coin balance per user (keyed by Principal)
   - Round management: create rounds with a timer, store bets per round
   - Place bet: validate user has enough coins, record bet (number or colour), deduct coins
   - Resolve round: generate random result (0-9), calculate payouts, update balances
   - Get round result and history
   - Leaderboard: return top users by balance
   - Get user profile (balance, bet history)

2. Frontend (React):
   - Home/login screen with Internet Identity
   - Game screen: current round timer, betting panel (choose number or colour, enter amount)
   - Live round results display
   - Bet history tab
   - Leaderboard tab
   - Coin balance visible at all times
