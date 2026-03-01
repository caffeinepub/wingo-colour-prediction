# WinGo Colour Prediction

## Current State
- Working WinGo colour prediction app with Motoko backend
- Features: login, betting on colour/number, round timer, result display, history tab, leaderboard tab, admin panel
- Backend APIs: placeBet, startNewRound, resolveRound, getLeaderboard, getBetHistory, getCurrentRound, getUserProfile
- Basic dark UI with functional components

## Requested Changes (Diff)

### Add
- Confetti animation after every result (win or loss) using canvas-confetti or CSS particles
- Bet history strip showing last 10 results at top of game screen (colored circles like Tiranga/Daman style)
- Multiple quick bet amounts: 10, 50, 100, 500, 1000 coins
- Win/Loss notification popup (large modal/toast) showing result, win amount, or loss amount
- Professional header with app logo, user balance with coin icon prominently displayed
- Multiplier info display: Color bets 2x, Number bets 9x
- Countdown timer visual overhaul -- large, prominent circular timer like 91 Club
- Result history row -- compact colored circles (last 20 results from bet history)
- Bottom navigation bar with Game, History, Leaderboard icons

### Modify
- Complete UI overhaul to match Tiranga/Daman/91 Club professional style:
  - Deep dark background (near black with slight purple/blue tint)
  - Vibrant gradient header (green-to-dark or purple-to-dark gradient like Tiranga)
  - Colour buttons: large, pill-shaped with gradient fills (Red=bright red gradient, Green=bright green gradient, Violet=purple gradient)
  - Number grid: 0-9 large colorful tiles with colour dot indicators
  - Bet amount section: row of quick chips (10/50/100/500/1000) styled as casino chips
  - Result display: large animated number with glow + color ring
  - Timer: large SVG circular timer with glow effect, prominent countdown number
- BettingPanel: add multiplier badges on colour/number buttons (2x / 9x)
- Result history visible on game tab (last 10 rounds shown as colored dots/circles)
- Leaderboard: show rank badges (gold/silver/bronze for top 3), user avatars with initials

### Remove
- Settings tab (admin panel stays inline below game)
- Footer text (keep it minimal)

## Implementation Plan
1. Install canvas-confetti package for confetti animation
2. Create ConfettiEffect component triggered after each resolved round result
3. Create ResultHistoryStrip component showing last 10-20 results as colored circles
4. Redesign GameScreen.tsx -- new header with gradient, prominent balance display
5. Redesign BettingPanel.tsx -- casino chip style quick amounts, larger color/number buttons with multipliers
6. Redesign ResultDisplay.tsx -- larger with glow animations, full result reveal
7. Redesign RoundTimer.tsx -- larger circular timer, more prominent countdown
8. Add WinLossModal component -- popup showing win/loss result after round resolves
9. Update LeaderboardTab.tsx -- gold/silver/bronze rank badges
10. Update HistoryTab.tsx -- cleaner layout with result color indicators
11. Integrate confetti trigger in GameScreen when round resolves
