/**
 * agent-engine/sharpTaker.js
 * CJS version of the Sharp Taker strategy for the standalone Node engine.
 */

const LIVE_PHASES = new Set([2, 4, 7, 9, 12]);
const MIN_EDGE_PCT = 0.03;
const MAX_POSITION_SIZE = 100;
const MIN_POSITION_SIZE = 10;
const STOP_LOSS_PCT = -0.20;
const TAKE_PROFIT_PCT = 0.30;

function findEdges(mmQuote, trueOdds, score, positions) {
  if (!mmQuote || mmQuote.action !== "QUOTE" || !trueOdds || !score) return [];
  if (!LIVE_PHASES.has(score.gamePhase)) return [];

  const signals = [];
  for (const [market, mmMarket] of Object.entries(mmQuote.markets)) {
    const truePrice = trueOdds[market];
    if (!truePrice || truePrice <= 0) continue;

    const buyEdge = (truePrice - mmMarket.ask) / truePrice;
    const sellEdge = (mmMarket.bid - truePrice) / truePrice;
    const alreadyOpen = positions?.[market];

    if (buyEdge >= MIN_EDGE_PCT && !alreadyOpen) {
      signals.push({
        market, side: "BUY", edge: buyEdge,
        entryPrice: mmMarket.ask, truePrice,
        size: computeSize(buyEdge),
        reason: `Buy edge ${(buyEdge * 100).toFixed(1)}% on ${market}`,
        timestamp: Date.now(),
      });
    }
    if (sellEdge >= MIN_EDGE_PCT && !alreadyOpen) {
      signals.push({
        market, side: "SELL", edge: sellEdge,
        entryPrice: mmMarket.bid, truePrice,
        size: computeSize(sellEdge),
        reason: `Sell edge ${(sellEdge * 100).toFixed(1)}% on ${market}`,
        timestamp: Date.now(),
      });
    }
  }
  return signals;
}

function managePositions(positions, trueOdds, score) {
  if (!positions || !trueOdds) return [];
  const closes = [];
  for (const [market, pos] of Object.entries(positions)) {
    if (!pos) continue;
    const currentPrice = trueOdds[market];
    if (!currentPrice) continue;
    const pnlPct = pos.side === "BUY"
      ? (currentPrice - pos.entryPrice) / pos.entryPrice
      : (pos.entryPrice - currentPrice) / pos.entryPrice;

    if (pnlPct <= STOP_LOSS_PCT) {
      closes.push({ market, action: "CLOSE", reason: `Stop-loss ${(pnlPct * 100).toFixed(1)}%`, pnlPct });
    } else if (pnlPct >= TAKE_PROFIT_PCT) {
      closes.push({ market, action: "CLOSE", reason: `Take-profit +${(pnlPct * 100).toFixed(1)}%`, pnlPct });
    }
  }
  return closes;
}

function computeSize(edgePct) {
  const norm = Math.min((edgePct - MIN_EDGE_PCT) / (0.10 - MIN_EDGE_PCT), 1);
  return Math.round(MIN_POSITION_SIZE + norm * (MAX_POSITION_SIZE - MIN_POSITION_SIZE));
}

module.exports = { findEdges, managePositions };
