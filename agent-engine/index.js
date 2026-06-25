/**
 * agent-engine/index.js
 * Standalone Node.js agent engine.
 * Runs both agents server-side against TxLINE streams.
 * Writes decisions to stdout (can be piped to a log store or Vercel KV).
 *
 * Usage: node agent-engine/index.js
 * Env:   TXLINE_JWT, TXLINE_API_TOKEN
 */

const { connectOddsStream } = require("./txlineClient");
const { connectScoresStream } = require("./txlineClient");
const MarketMaker = require("./marketMaker");
const SharpTaker = require("./sharpTaker");
const logger = require("./logger");

// ── State ──────────────────────────────────────────────────────────────────

const state = {
  odds: {},    // { [fixtureId]: normalizedOdds }
  scores: {},  // { [fixtureId]: scoreUpdate }
  oddsHistory: {}, // { [fixtureId]: OddsUpdate[] }
  mmQuotes: {}, // { [fixtureId]: Quote }
  makerPositions: {},
  takerPositions: {},
  makerPnl: 0,
  takerPnl: 0,
};

// ── Streams ────────────────────────────────────────────────────────────────

console.log("[OddsArena] Agent engine starting...");

connectOddsStream(
  (update) => {
    const id = update.fixtureId ?? update.FixtureId;
    if (!id) return;

    // Normalize odds
    const normalized = {
      home: update.homeOdds ?? update.Home ?? update.p1,
      draw: update.drawOdds ?? update.Draw ?? update.x,
      away: update.awayOdds ?? update.Away ?? update.p2,
    };

    state.odds[id] = normalized;

    // Maintain rolling history (last 20)
    const history = state.oddsHistory[id] ?? [];
    state.oddsHistory[id] = [...history.slice(-19), normalized];

    const score = state.scores[id];
    if (!score) return;

    runCycle(id, normalized, score, update.messageId ?? update.MessageId);
  },
  (err) => console.error("[OddsStream] Error:", err.message)
);

connectScoresStream(
  (update) => {
    const id = update.fixtureId ?? update.FixtureId;
    if (!id) return;
    state.scores[id] = update;
  },
  (err) => console.error("[ScoresStream] Error:", err.message)
);

// ── Agent Cycle ────────────────────────────────────────────────────────────

function runCycle(fixtureId, odds, score, messageId) {
  // Market Maker
  const mmCloses = MarketMaker.managePositions(
    state.makerPositions[fixtureId] ?? {},
    state.mmQuotes[fixtureId],
    score
  );
  if (mmCloses) {
    for (const close of mmCloses) {
      logger.log({ agent: "maker", fixtureId, messageId, ...close });
    }
  }

  const quote = MarketMaker.computeQuote(
    {},
    odds,
    score,
    state.oddsHistory[fixtureId]
  );

  if (quote) {
    state.mmQuotes[fixtureId] = quote;
    logger.log({ agent: "maker", fixtureId, messageId, ...quote });
  }

  // Sharp Taker
  const takerCloses = SharpTaker.managePositions(
    state.takerPositions[fixtureId] ?? {},
    odds,
    score
  );
  for (const close of takerCloses) {
    const tradePnl = (state.takerPositions[fixtureId]?.[close.market]?.size ?? 0) * close.pnlPct;
    state.takerPnl += tradePnl;
    delete (state.takerPositions[fixtureId] ?? {})[close.market];
    logger.log({ agent: "taker", fixtureId, messageId, pnl: tradePnl, ...close });
  }

  const mmQuote = state.mmQuotes[fixtureId];
  if (mmQuote?.action === "QUOTE") {
    const signals = SharpTaker.findEdges(
      mmQuote,
      odds,
      score,
      state.takerPositions[fixtureId] ?? {}
    );
    for (const signal of signals) {
      if (!state.takerPositions[fixtureId]) state.takerPositions[fixtureId] = {};
      state.takerPositions[fixtureId][signal.market] = {
        side: signal.side,
        entryPrice: signal.entryPrice,
        size: signal.size,
        openedAt: Date.now(),
      };
      logger.log({ agent: "taker", fixtureId, messageId, action: "OPEN", ...signal });
    }
  }
}
