/**
 * matchStore.js
 * Zustand store for fixture list and active match selection.
 */

import { create } from "zustand";

export const useMatchStore = create((set, get) => ({
  fixtures: [],
  activeFixtureId: null,
  scores: {}, // { [fixtureId]: ScoreUpdate }
  loading: false,
  error: null,

  setFixtures(fixtures) {
    set({ fixtures, loading: false });
  },

  setLoading(loading) {
    set({ loading });
  },

  setError(error) {
    set({ error, loading: false });
  },

  setActiveFixture(fixtureId) {
    set({ activeFixtureId: fixtureId });
  },

  ingestScoreUpdate(update) {
    const id = update.fixtureId ?? update.FixtureId;
    if (!id) return;
    set((state) => ({
      scores: { ...state.scores, [id]: update },
    }));
  },

  getActiveFixture() {
    const { fixtures, activeFixtureId } = get();
    return fixtures.find((f) => f.FixtureId === activeFixtureId) ?? fixtures[0] ?? null;
  },

  getScore(fixtureId) {
    return get().scores[fixtureId] ?? null;
  },

  getLiveFixtures() {
    const { fixtures, scores } = get();
    const LIVE = new Set([2, 4, 7, 9, 12]);
    return fixtures.filter((f) => {
      const score = scores[f.FixtureId];
      return score && LIVE.has(score.gamePhase);
    });
  },
}));
