import React, { useEffect } from "react";
import { useMatchStore } from "../store/matchStore";
import { useAgentState } from "../hooks/useAgentState";
import { fetchFixtures } from "../services/scoresStream";
import ArenaHeader from "../components/arena/ArenaHeader";
import AgentBattle from "../components/agents/AgentBattle";
import AgentPnL from "../components/agents/AgentPnL";
import DecisionLog from "../components/agents/DecisionLog";
import OrderBook from "../components/market/OrderBook";
import MarketDepth from "../components/market/MarketDepth";
import OddsBoard from "../components/odds/OddsBoard";
import OddsHistory from "../components/odds/OddsHistory";
import BattleTimeline from "../components/arena/BattleTimeline";
import MatchSelector from "../components/match/MatchSelector";
import { Card } from "../components/ui";

export default function Arena() {
  // Run agents on every odds update
  useAgentState();

  const setFixtures = useMatchStore((s) => s.setFixtures);
  const setLoading = useMatchStore((s) => s.setLoading);
  const setError = useMatchStore((s) => s.setError);
  const activeFixtureId = useMatchStore((s) => s.activeFixtureId);
  const setActive = useMatchStore((s) => s.setActiveFixture);
  const fixtures = useMatchStore((s) => s.fixtures);

  useEffect(() => {
    setLoading(true);
    fetchFixtures()
      .then((data) => {
        setFixtures(data);
        // Auto-select first fixture
        if (data.length > 0 && !activeFixtureId) {
          setActive(data[0].FixtureId);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_320px] gap-4 min-h-full">

      {/* Left — Match selector */}
      <div className="flex flex-col gap-4">
        <Card>
          <p className="label-xs mb-3">World Cup Matches</p>
          <MatchSelector />
        </Card>
      </div>

      {/* Center — Main arena */}
      <div className="flex flex-col gap-4">
        <ArenaHeader />
        <AgentBattle />

        <Card>
          <p className="label-xs mb-3">P&L Over Time</p>
          <AgentPnL />
        </Card>

        <Card>
          <p className="label-xs mb-3">Live Odds</p>
          <OddsBoard fixtureId={activeFixtureId} />
          {activeFixtureId && (
            <div className="mt-3">
              <OddsHistory fixtureId={activeFixtureId} />
            </div>
          )}
        </Card>

        <Card>
          <p className="label-xs mb-3">Battle Timeline</p>
          <BattleTimeline />
        </Card>
      </div>

      {/* Right — Market + Decisions */}
      <div className="flex flex-col gap-4">
        <Card>
          <p className="label-xs mb-3">Order Book</p>
          <OrderBook />
        </Card>

        <Card>
          <MarketDepth />
        </Card>

        <Card>
          <p className="label-xs mb-3">Decision Log</p>
          <DecisionLog maxItems={30} />
        </Card>
      </div>

    </div>
  );
}
