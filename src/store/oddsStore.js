/**
 * oddsStore.js
 * Zustand store for live odds data per fixture.
 */

import { create } from "zustand";

export const useOddsStore = create((set, get) => ({
  // { [fixtureId]: OddsUpdate[] }  — rolling history per fixture
  history: {},
  // { [fixtureId]: OddsUpdate }  — latest snapshot
  latest: {},

  /**
   * Ingest a new odds update from the SSE stream.
   */
  ingestOddsUpdate(update) {
    const id = update.fixtureId ?? update.FixtureId;
    if (!id) return;

    set((state) => {
      const prev = state.history[id] ?? [];
      const trimmed = prev.length >= 100 ? prev.slice(-99) : prev;
      return {
        latest: { ...state.latest, [id]: update },
        history: { ...state.history, [id]: [...trimmed, update] },
      };
    });
  },

  getLatest(fixtureId) {
    return get().latest[fixtureId] ?? null;
  },

  getHistory(fixtureId) {
    return get().history[fixtureId] ?? [];
  },

  /**
   * Extract normalized { home, draw, away } odds from a raw update.
   * TxLINE uses market type codes — adapt as actual schema is confirmed.
   */
  getNormalizedOdds(fixtureId) {
    const update = get().latest[fixtureId];
    if (!update) return null;
    // Adjust field names once live schema is confirmed
    return {
      home: update.homeOdds ?? update.Home ?? update.p1,
      draw: update.drawOdds ?? update.Draw ?? update.x,
      away: update.awayOdds ?? update.Away ?? update.p2,
    };
  },
}));
