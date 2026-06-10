# Cashflow — Tradervert Edition 🎲

A single-file financial board game: escape the rat race by building passive income, then chase your dream on the Fast Track.

**▶ Play now:** enable GitHub Pages on this repo (Settings → Pages → Deploy from branch → `main` / root), then play at `https://aiejandrog.github.io/cashflow-tradervert/`

## Multiplayer (play with friends anywhere) 🌐

1. **Host:** pick 2–4 players on the start screen, set up each player's profession/city/dream, create a room (name + optional password). Keep the lobby open.
2. **Friends:** open the same game URL on *their* device, click **Join Room**, and enter the room name + password and their player name.
3. When everyone shows ✓ Joined, the host hits **Start Game**.

Connections work two ways automatically:
- **Same machine** (two tabs): instant, via BroadcastChannel
- **Across the internet:** WebRTC via [PeerJS](https://peerjs.com) — no server or account needed

If you refresh mid-game, rejoin with the **same player name** to reclaim your seat.

## Rules in 30 seconds

- Roll, land on spaces, buy assets (real estate, businesses, stocks) that produce monthly cash flow
- **Win condition:** passive income ≥ total expenses → you escape the rat race
- Solo: continue to the Fast Track outer board and land on your DREAM space
- Multiplayer: first to escape wins the race; the game continues until all players finish

## Tech

- One `index.html` — no build, no dependencies except the PeerJS CDN for remote play
- State persists in `localStorage` (refresh-safe, including multiplayer host state)
