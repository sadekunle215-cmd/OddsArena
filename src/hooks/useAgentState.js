/**
 * useAgentState.js
 * Triggers the agent engine on every new odds update for the active fixture.
 */

import { useEffect } from "react";
import { useOddsStore } from "../store/oddsStore";
import { useMatchStore } from "../store/matchStore";
import { runAgentCycle } from "../agents/agentEngine";

export function useAgentState() {
  const activeFixtureId = useMatchStore((s) => s.activeFixtureId);
  const getScore = useMatchStore((s) => s.getScore);
  const getLatest = useOddsStore((s) => s.getLatest);
  const getHistory = useOddsStore((s) => s.getHistory);
  const getNormalizedOdds = useOddsStore((s) => s.getNormalizedOdds);

  // Re-run agent cycle whenever odds update for the active fixture
  const latestOdds = useOddsStore((s) =>
    activeFixtureId ? s.latest[activeFixtureId] : null
  );

  useEffect(() => {
    if (!activeFixtureId || !latestOdds) return;

    const score = getScore(activeFixtureId);
    const odds = getNormalizedOdds(activeFixtureId);
    const oddsHistory = getHistory(activeFixtureId);

    if (!score || !odds) return;

    runAgentCycle({
      odds,
      score,
      oddsHistory,
      fixtureId: activeFixtureId,
      messageId: latestOdds.messageId ?? latestOdds.MessageId ?? null,
    });
  }, [latestOdds]);
}
