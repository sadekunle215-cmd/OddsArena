/**
 * agentEngine.js
 * Orchestrates both agents against live TxLINE data.
 * Called on every odds/scores update from the SSE streams.
 * Maintains agent state, positions, P&L, and decision log.
 */

import { computeQuote, managePositions as mmManagePositions } from "./marketMaker";
import { findEdges, managePositions as takerManagePositions } from "./sharpTaker";
import { useAgentStore } from "../store/agentStore";

/**
 * Process a new odds + scores update through both agents.
 * This function is called by the useAgentState hook on every stream event.
 *
 * @param {object} params
 * @param {object} params.odds         latest odds { home, draw, away }
 * @param {object} params.score        latest score update
 * @param {object[]} params.oddsHistory  last 20 odds updates
 * @param {string} params.fixtureId
 * @param {string} params.messageId    TxLINE message ID for audit
 */
export function runAgentCycle({ odds, score, oddsHistory, fixtureId, messageId }) {
  const store = useAgentStore.getState();
  const { makerState, takerState } = store;

  // ── Agent A: Market Maker ────────────────────────────────────────────────

  // Check if existing positions need closing
  const mmCloses = mmManagePositions(makerState.positions, store.lastMmQuote, score);
  if (mmCloses) {
    for (const close of mmCloses) {
      store.closeMakerPosition(close.market, close.reason, messageId);
    }
  }

  // Compute new quotes
  const newQuote = computeQuote(makerState, odds, score, oddsHistory);
  if (newQuote) {
    store.setMakerQuote(newQuote, messageId);
    if (newQuote.action === "CLOSE_ALL") {
      store.closeAllMakerPositions("Match finished", messageId);
    }
  }

  // ── Agent B: Sharp Taker ─────────────────────────────────────────────────

  // Check existing taker positions for stop-loss / take-profit
  const takerCloses = takerManagePositions(takerState.positions, odds, score);
  for (const close of takerCloses) {
    store.closeTakerPosition(close.market, close.reason, close.pnlPct, messageId);
  }

  // Scan for new edges vs MM quotes
  if (store.lastMmQuote?.action === "QUOTE") {
    const signals = findEdges(store.lastMmQuote, odds, score, takerState.positions);
    for (const signal of signals) {
      store.openTakerPosition(signal, messageId);
    }
  }
}
