/**
 * marketMaker.js
 * Agent A — Market Maker
 *
 * Strategy: Quote bid/ask prices around the TxLINE consensus odds.
 * Widens spread during volatile periods (fast odds movement).
 * Pulls quotes on game phase changes (HT, red card, goal).
 * All decisions are deterministic and logged with a rationale.
 */

import { LIVE_PHASES, FINISHED_PHASES } from "../services/scoresStream";

// Base spread as a fraction of the mid price (2%)
const BASE_SPREAD_PCT = 0.02;
// Volatility multiplier: widens spread when odds move fast
const VOLATILITY_MULTIPLIER = 2.5;
// Minimum spread floor
const MIN_SPREAD_PCT = 0.01;
// Max spread cap
const MAX_SPREAD_PCT = 0.08;
// Odds movement threshold (>5% in last 60s) triggers "volatile" mode
const VOLATILE_THRESHOLD_PCT = 0.05;

/**
 * Compute the Market Maker's quotes for a given fixture.
 *
 * @param {object} state  current agent state
 * @param {object} odds   latest odds snapshot { home, draw, away }
 * @param {object} score  latest score update
 * @param {object[]} oddsHistory  last N odds updates for this fixture
 * @returns {Quote | null}  null = pull all quotes
 */
export function computeQuote(state, odds, score, oddsHistory) {
  if (!odds || !score) return null;

  const phase = score.gamePhase;

  // Pull quotes when match is not live or is finished
  if (!LIVE_PHASES.has(phase) && !FINISHED_PHASES.has(phase)) {
    return null;
  }

  if (FINISHED_PHASES.has(phase)) {
    return { action: "CLOSE_ALL", reason: "Match finished — closing positions" };
  }

  // Pull quotes at half-time (high uncertainty)
  if (phase === 3) {
    return { action: "PULL", reason: "Half-time — pulling quotes during break" };
  }

  const volatility = measureVolatility(oddsHistory);
  const spreadPct = clamp(
    BASE_SPREAD_PCT * (1 + volatility * VOLATILITY_MULTIPLIER),
    MIN_SPREAD_PCT,
    MAX_SPREAD_PCT
  );

  const markets = {};

  for (const [market, mid] of Object.entries(odds)) {
    if (!mid || mid <= 0) continue;
    const halfSpread = (mid * spreadPct) / 2;
    markets[market] = {
      mid,
      bid: +(mid - halfSpread).toFixed(3),
      ask: +(mid + halfSpread).toFixed(3),
      spreadPct: +(spreadPct * 100).toFixed(2),
    };
  }

  const reason = volatility > VOLATILE_THRESHOLD_PCT
    ? `Volatile market (±${(volatility * 100).toFixed(1)}%) — widened spread to ${(spreadPct * 100).toFixed(1)}%`
    : `Stable market — quoting ${(spreadPct * 100).toFixed(1)}% spread`;

  return {
    action: "QUOTE",
    markets,
    spreadPct,
    volatility,
    reason,
    timestamp: Date.now(),
  };
}

/**
 * Decide whether to take a position on the market.
 * MM profits from the spread when the Taker hits its quotes.
 * Returns a position update based on current exposure.
 *
 * @param {object} currentPositions  { home: number, draw: number, away: number }
 * @param {object} lastQuote
 * @param {object} score
 * @returns {PositionUpdate | null}
 */
export function managePositions(currentPositions, lastQuote, score) {
  if (!lastQuote || lastQuote.action !== "QUOTE") return null;

  const updates = [];

  // If we're holding a losing position > 15%, cut it
  for (const [market, position] of Object.entries(currentPositions)) {
    if (!position) continue;
    const quote = lastQuote.markets?.[market];
    if (!quote) continue;

    const pnlPct = ((quote.mid - position.entryPrice) / position.entryPrice) * 100;
    if (position.side === "LAY" && pnlPct < -15) {
      updates.push({
        market,
        action: "CLOSE",
        reason: `Stop-loss hit on ${market} (${pnlPct.toFixed(1)}% loss)`,
      });
    }
  }

  return updates.length > 0 ? updates : null;
}

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Measure recent odds volatility as max % swing in the last 10 updates.
 */
function measureVolatility(oddsHistory) {
  if (!oddsHistory || oddsHistory.length < 2) return 0;
  const recent = oddsHistory.slice(-10);
  let maxSwing = 0;

  for (let i = 1; i < recent.length; i++) {
    const prev = recent[i - 1]?.home;
    const curr = recent[i]?.home;
    if (prev && curr && prev > 0) {
      maxSwing = Math.max(maxSwing, Math.abs((curr - prev) / prev));
    }
  }
  return maxSwing;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
