# OddsArena

**Two AI agents fight on live World Cup markets. Powered by TxLINE on Solana.**

OddsArena combines the Agent vs Agent Arena and In-Play Market Maker tracks into a single submission:

- **Agent A (Market Maker)** — quotes live bid/ask prices on match outcomes, adjusting spreads based on TxLINE volatility
- **Agent B (Sharp Taker)** — hunts for mispriced MM quotes vs TxLINE consensus and takes positions
- Every decision is logged with the TxLINE `messageId` and verifiable on-chain via Merkle proof

---

## TxLINE Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/odds/stream` | Live odds SSE stream → feeds both agents |
| `GET /api/scores/stream` | Live scores SSE stream → match phase detection |
| `GET /api/fixtures/snapshot` | All World Cup fixtures for the Matches page |
| `GET /api/odds/snapshot/:fixtureId` | Initial odds snapshot on fixture select |
| `GET /api/odds/proof/:messageId` | Merkle proof for on-chain verification |

---

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **State:** Zustand
- **Charts:** Recharts
- **Agent Engine:** Node.js (also runs server-side via `node agent-engine/index.js`)
- **On-chain:** TxLINE Merkle proofs verified client-side via Web Crypto API
- **Deploy:** Vercel

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set credentials
cp .env.example .env
# Edit .env with your TxLINE JWT and API token

# 3. Start frontend
npm run dev

# 4. (Optional) Run standalone agent engine
node agent-engine/index.js
```

---

## Architecture

```
src/
  services/     # TxLINE API client, SSE streams, Solana verification
  agents/       # Market Maker + Sharp Taker logic (pure functions)
  hooks/        # React hooks connecting streams to stores
  store/        # Zustand state (odds, matches, agent state)
  components/   # UI components, one file per component
  pages/        # Arena, Matches, Leaderboard, Verify

agent-engine/   # Standalone Node.js backend version of the same agents
```

---

## Pages

| Page | Description |
|------|-------------|
| `/arena` | Live battle — match + agents + order book + decision log |
| `/matches` | All 104 World Cup fixtures |
| `/leaderboard` | Agent P&L rankings across the tournament |
| `/verify` | Paste any messageId to verify on-chain |

---

## Agent Logic

**Market Maker:**
- Quotes bid/ask at ±2% spread around TxLINE consensus
- Widens spread up to 8% during high-volatility periods
- Pulls all quotes at half-time
- Applies stop-loss on losing positions

**Sharp Taker:**
- Fires when MM ask < true odds by >3% (buy signal)
- Fires when MM bid > true odds by >3% (sell signal)
- Sizes positions proportionally to edge confidence
- Auto-closes at -20% stop-loss or +30% take-profit

---

Built for the TxODDS × Superteam Earn World Cup Hackathon 2026.
