/**
 * agent-engine/marketMaker.js
 * CJS wrapper — re-exports the same logic as src/agents/marketMaker.js
 * so the standalone Node engine can use it without a bundler.
 */

const LIVE_PHASES = new Set([2, 4, 7, 9, 12]);
const FINISHED_PHASES = new Set([5, 10, 13]);
const BASE_SPREAD_PCT = 0.02;
const VOLATILITY_MULTIPLIER = 2.5;
const MIN_SPREAD_PCT = 0.01;
const MAX_SPREAD_PCT = 0.08;
const VOLATILE_THRESHOLD_PCT = 0.05;
const STOP_LOSS_PCT = -0.15;

function computeQuote(state, odds, score, oddsHistory) {
  if (!odds || !score) return null;
  const phase = score.gamePhase;
  if (!LIVE_PHASES.has(phase) && !FINISHED_PHASES.has(phase)) return null;
  if (FINISHED_PHASES.has(phase)) return { action: "CLOSE_ALL", reason: "Match finished" };
  if (phase === 3) return { action: "PULL", reason: "Half-time — pulling quotes" };

  const volatility = measureVolatility(oddsHistory);
  const spreadPct = clamp(
    BASE_SPREAD_PCT * (1 + volatility * VOLATILITY_MULTIPLIER),
    MIN_SPREAD_PCT,
    MAX_SPREAD_PCT
  );

  const markets = {};
  for (const [market, mid] of Object.entries(odds)) {
    if (!mid || mid <= 0) continue;
    const half = (mid * spreadPct) / 2;
    markets[market] = {
      mid,
      bid: +(mid - half).toFixed(3),
      ask: +(mid + half).toFixed(3),
      spreadPct: +(spreadPct * 100).toFixed(2),
    };
  }

  const reason = volatility > VOLATILE_THRESHOLD_PCT
    ? `Volatile market (±${(volatility * 100).toFixed(1)}%) — spread ${(spreadPct * 100).toFixed(1)}%`
    : `Stable — spread ${(spreadPct * 100).toFixed(1)}%`;

  return { action: "QUOTE", markets, spreadPct, volatility, reason, timestamp: Date.now() };
}

function managePositions(positions, lastQuote, score) {
  if (!lastQuote || lastQuote.action !== "QUOTE") return null;
  const updates = [];
  for (const [market, position] of Object.entries(positions)) {
    if (!position) continue;
    const quote = lastQuote.markets?.[market];
    if (!quote) continue;
    const pnlPct = ((quote.mid - position.entryPrice) / position.entryPrice) * 100;
    if (position.side === "LAY" && pnlPct < -15) {
      updates.push({ market, action: "CLOSE", reason: `Stop-loss (${pnlPct.toFixed(1)}%)` });
    }
  }
  return updates.length > 0 ? updates : null;
}

function measureVolatility(history) {
  if (!history || history.length < 2) return 0;
  const recent = history.slice(-10);
  let maxSwing = 0;
  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1]?.home;
    const curr = recent[i]?.home;
    if (prev && curr && prev > 0) maxSwing = Math.max(maxSwing, Math.abs((curr - prev) / prev));
  }
  return maxSwing;
}

function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }

module.exports = { computeQuote, managePositions };
