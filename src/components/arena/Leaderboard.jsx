import React from "react";
import { useAgentStore } from "../../store/agentStore";
import { PnlValue } from "../ui";

export default function Leaderboard() {
  const maker = useAgentStore((s) => s.makerState);
  const taker = useAgentStore((s) => s.takerState);

  const agents = [
    { ...maker, type: "maker", icon: "📊", color: "text-purple-400" },
    { ...taker, type: "taker", icon: "🎯", color: "text-orange-400" },
  ].sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="flex flex-col gap-2">
      {agents.map((agent, i) => (
        <div key={agent.name} className="card-sm p-3 flex items-center gap-3">
          <span className="font-display font-700 text-slate-500 w-4">{i + 1}</span>
          <span>{agent.icon}</span>
          <span className={`font-display font-600 text-sm flex-1 ${agent.color}`}>
            {agent.name}
          </span>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="label-xs">P&L</p>
              <PnlValue value={agent.pnl} />
            </div>
            <div className="text-right">
              <p className="label-xs">Trades</p>
              <span className="font-mono text-sm text-white">{agent.trades}</span>
            </div>
            <div className="text-right">
              <p className="label-xs">Win %</p>
              <span className="font-mono text-sm text-white">
                {agent.trades > 0 ? ((agent.wins / agent.trades) * 100).toFixed(0) : "—"}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
