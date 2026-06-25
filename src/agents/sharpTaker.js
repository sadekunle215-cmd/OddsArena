/**
 * sharpTaker.js
 * Agent B — Sharp Taker
 *
 * Strategy: Hunt for mispriced quotes from the Market Maker.
 * Compares MM ask/bid against TxLINE consensus.
 * Takes position when edge exceeds minimum threshold.
 * Sizes bets by confidence level derived from edge size.
 */

import { LIVE_PHASES } from "../services/scoresStream";

// Minimum edge to trigger a trade (MM quote > 3% off consensus)
const MIN_EDGE_PCT = 0.03;
// Maximum single position size (virtual units)
const MAX_POSITION_SIZE = 100;
// Minimum position size
const MIN_POSITION_SIZE = 10;
// Stop-loss: close position if loss > 20%
const STOP_LOSS_PCT = -0.20;
// Take-profit: close position if gain > 30%
const TAKE_PROFIT_PCT = 0.30;

/**
 * Scan the Market Maker's quotes for edges vs TxLINE consensus.
 *
 * @param {object} mmQuote      the Market Maker's latest quote
 * @param {object} trueOdds     raw TxLINE consensus odds { home, draw, away }
 * @param {object} score        latest score update
 * @param {object} positions    current open positions
 * @returns {Signal[]}          list of trade signals
 */
export function findEdges(mmQuote, trueOdds, score, positions) {
  if (!mmQuote || mmQuote.action !== "QUOTE" || !trueOdds || !score) return [];
  if (!LIVE_PHASES.has(score.gamePhase)) return [];

  const signals = [];

  for (const [market, mmMarket] of Object.entries(mmQuote.markets)) {
    const truePrice = trueOdds[market];
    if (!truePrice || truePrice <= 0) continue;

    // If MM ask < true odds → MM is underpricing → BUY opportunity
    const buyEdge = (truePrice - mmMarket.ask) / truePrice;
    // If MM bid > true odds → MM is overpricing → SELL opportunity
    const sellEdge = (mmMarket.bid - truePrice) / truePrice;

    const alreadyOpen = positions?.[market];

    if (buyEdge >= MIN_EDGE_PCT && !alreadyOpen) {
      signals.push({
        market,
        side: "BUY",
        edge: buyEdge,
        entryPrice: mmMarket.ask,
        truePrice,
        size: computeSize(buyEdge),
        reason: `MM ask ${mmMarket.ask} < true odds ${truePrice.toFixed(3)} → ${(buyEdge * 100).toFixed(1)}% edge`,
        timestamp: Date.now(),
      });
    }

    if (sellEdge >= MIN_EDGE_PCT && !alreadyOpen) {
      signals.push({
        market,
        side: "SELL",
        edge: sellEdge,
        entryPrice: mmMarket.bid,
        truePrice,
        size: computeSize(sellEdge),
        reason: `MM bid ${mmMarket.bid} > true odds ${truePrice.toFixed(3)} → ${(sellEdge * 100).toFixed(1)}% edge`,
        timestamp: Date.now(),
      });
    }
  }

  return signals;
}

/**
 * Manage existing positions — apply stop-loss and take-profit.
 *
 * @param {object} positions   { [market]: { side, entryPrice, size } }
 * @param {object} trueOdds    current TxLINE consensus odds
 * @param {object} score
 * @returns {CloseSignal[]}
 */
export function managePositions(positions, trueOdds, score) {
  if (!positions || !trueOdds) return [];
  const closes = [];

  for (const [market, pos] of Object.entries(positions)) {
    if (!pos) continue;
    const currentPrice = trueOdds[market];
    if (!currentPrice) continue;

    const pnlPct =
      pos.side === "BUY"
        ? (currentPrice - pos.entryPrice) / pos.entryPrice
        : (pos.entryPrice - currentPrice) / pos.entryPrice;

    if (pnlPct <= STOP_LOSS_PCT) {
      closes.push({
        market,
        action: "CLOSE",
        reason: `Stop-loss: ${(pnlPct * 100).toFixed(1)}% loss on ${market}`,
        pnlPct,
      });
    } else if (pnlPct >= TAKE_PROFIT_PCT) {
      closes.push({
        market,
        action: "CLOSE",
        reason: `Take-profit: +${(pnlPct * 100).toFixed(1)}% gain on ${market}`,
        pnlPct,
      });
    }
  }

  return closes;
}

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Size position proportional to edge confidence.
 * 3% edge → MIN_POSITION_SIZE, 10%+ edge → MAX_POSITION_SIZE
 */
function computeSize(edgePct) {
  const normalized = Math.min((edgePct - MIN_EDGE_PCT) / (0.10 - MIN_EDGE_PCT), 1);
  return Math.round(
    MIN_POSITION_SIZE + normalized * (MAX_POSITION_SIZE - MIN_POSITION_SIZE)
  );
}
