/**
 * agentStore.js
 * Zustand store for both agents' state:
 * positions, P&L history, decision log, quotes.
 */

import { create } from "zustand";

const INITIAL_BANKROLL = 1000;

function emptyAgent(name) {
  return {
    name,
    bankroll: INITIAL_BANKROLL,
    positions: {},
    pnl: 0,
    pnlHistory: [], // [{ timestamp, pnl }]
    trades: 0,
    wins: 0,
    losses: 0,
  };
}

export const useAgentStore = create((set, get) => ({
  makerState: emptyAgent("Market Maker"),
  takerState: emptyAgent("Sharp Taker"),
  lastMmQuote: null,
  decisionLog: [], // shared log across both agents

  // ── Market Maker ──────────────────────────────────────────────────────────

  setMakerQuote(quote, messageId) {
    set((state) => ({
      lastMmQuote: quote,
      decisionLog: [
        {
          agent: "maker",
          agentLabel: "Market Maker",
          ...quote,
          messageId,
          id: `mm-${Date.now()}`,
        },
        ...state.decisionLog.slice(0, 199),
      ],
    }));
  },

  closeMakerPosition(market, reason, messageId) {
    set((state) => {
      const pos = state.makerState.positions[market];
      if (!pos) return {};
      const pnl = pos.pnl ?? 0;
      const newPositions = { ...state.makerState.positions };
      delete newPositions[market];
      const newPnl = state.makerState.pnl + pnl;
      return {
        makerState: {
          ...state.makerState,
          positions: newPositions,
          pnl: newPnl,
          trades: state.makerState.trades + 1,
          wins: pnl >= 0 ? state.makerState.wins + 1 : state.makerState.wins,
          losses: pnl < 0 ? state.makerState.losses + 1 : state.makerState.losses,
          pnlHistory: [
            ...state.makerState.pnlHistory,
            { timestamp: Date.now(), pnl: newPnl },
          ],
        },
        decisionLog: [
          {
            agent: "maker",
            agentLabel: "Market Maker",
            action: "CLOSE",
            market,
            reason,
            pnl,
            messageId,
            id: `mm-close-${Date.now()}`,
            timestamp: Date.now(),
          },
          ...state.decisionLog.slice(0, 199),
        ],
      };
    });
  },

  closeAllMakerPositions(reason, messageId) {
    const { makerState } = get();
    for (const market of Object.keys(makerState.positions)) {
      get().closeMakerPosition(market, reason, messageId);
    }
  },

  // ── Sharp Taker ───────────────────────────────────────────────────────────

  openTakerPosition(signal, messageId) {
    set((state) => {
      const newPositions = {
        ...state.takerState.positions,
        [signal.market]: {
          side: signal.side,
          entryPrice: signal.entryPrice,
          size: signal.size,
          openedAt: Date.now(),
          pnl: 0,
        },
      };
      return {
        takerState: { ...state.takerState, positions: newPositions },
        decisionLog: [
          {
            agent: "taker",
            agentLabel: "Sharp Taker",
            action: "OPEN",
            ...signal,
            messageId,
            id: `taker-open-${Date.now()}`,
            timestamp: Date.now(),
          },
          ...state.decisionLog.slice(0, 199),
        ],
      };
    });
  },

  closeTakerPosition(market, reason, pnlPct, messageId) {
    set((state) => {
      const pos = state.takerState.positions[market];
      if (!pos) return {};
      const tradePnl = pos.size * pnlPct;
      const newPositions = { ...state.takerState.positions };
      delete newPositions[market];
      const newPnl = state.takerState.pnl + tradePnl;
      return {
        takerState: {
          ...state.takerState,
          positions: newPositions,
          pnl: newPnl,
          trades: state.takerState.trades + 1,
          wins: tradePnl >= 0 ? state.takerState.wins + 1 : state.takerState.wins,
          losses: tradePnl < 0 ? state.takerState.losses + 1 : state.takerState.losses,
          pnlHistory: [
            ...state.takerState.pnlHistory,
            { timestamp: Date.now(), pnl: newPnl },
          ],
        },
        decisionLog: [
          {
            agent: "taker",
            agentLabel: "Sharp Taker",
            action: "CLOSE",
            market,
            reason,
            pnlPct,
            pnl: tradePnl,
            messageId,
            id: `taker-close-${Date.now()}`,
            timestamp: Date.now(),
          },
          ...state.decisionLog.slice(0, 199),
        ],
      };
    });
  },

  // ── Utilities ─────────────────────────────────────────────────────────────

  resetAll() {
    set({
      makerState: emptyAgent("Market Maker"),
      takerState: emptyAgent("Sharp Taker"),
      lastMmQuote: null,
      decisionLog: [],
    });
  },
}));
