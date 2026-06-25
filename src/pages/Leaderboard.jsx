import React from "react";
import { useAgentStore } from "../store/agentStore";
import AgentPnL from "../components/agents/AgentPnL";
import { Card, PnlValue } from "../components/ui";
import LeaderboardWidget from "../components/arena/Leaderboard";

export default function Leaderboard() {
  const maker = useAgentStore((s) => s.makerState);
  const taker = useAgentStore((s) => s.takerState);
  const log = useAgentStore((s) => s.decisionLog);

  const totalTrades = maker.trades + taker.trades;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="font-display font-700 text-xl text-white">
          Agent Leaderboard
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {totalTrades} total trades across the tournament
        </p>
      </div>

      <Card>
        <p className="label-xs mb-3">Rankings</p>
        <LeaderboardWidget />
      </Card>

      <Card>
        <p className="label-xs mb-3">P&L History</p>
        <AgentPnL />
      </Card>

      <Card>
        <p className="label-xs mb-3">Trade History</p>
        <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
          {log
            .filter((e) => ["OPEN", "CLOSE"].includes(e.action))
            .map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-pitch-800"
              >
                <span className="text-xs text-slate-500 font-mono w-16 shrink-0">
                  {entry.agent === "maker" ? "📊 MM" : "🎯 ST"}
                </span>
                <span className="text-xs text-slate-400 flex-1">{entry.reason}</span>
                {entry.pnl !== undefined && (
                  <PnlValue value={entry.pnl} className="text-xs" />
                )}
              </div>
            ))}
          {log.filter((e) => ["OPEN", "CLOSE"].includes(e.action)).length === 0 && (
            <p className="text-slate-600 text-sm text-center py-4">
              No trades yet
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
