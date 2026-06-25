import React from "react";
import clsx from "clsx";
import { PnlValue } from "../ui";

export default function AgentCard({ agent, type }) {
  if (!agent) return null;
  const isMaker = type === "maker";
  const color = isMaker ? "border-agent-maker/30" : "border-agent-taker/30";
  const accent = isMaker ? "text-purple-400" : "text-orange-400";
  const icon = isMaker ? "📊" : "🎯";

  const winRate =
    agent.trades > 0
      ? ((agent.wins / agent.trades) * 100).toFixed(0)
      : "—";

  return (
    <div className={clsx("card border p-4 flex flex-col gap-3", color)}>
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className={clsx("font-display font-600 text-sm", accent)}>
          {agent.name}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="label-xs mb-1">P&L</p>
          <PnlValue value={agent.pnl} className="text-lg" />
        </div>
        <div>
          <p className="label-xs mb-1">Win Rate</p>
          <span className="font-mono font-500 text-white">{winRate}%</span>
        </div>
        <div>
          <p className="label-xs mb-1">Trades</p>
          <span className="font-mono text-white">{agent.trades}</span>
        </div>
        <div>
          <p className="label-xs mb-1">Open Pos.</p>
          <span className="font-mono text-white">
            {Object.keys(agent.positions).length}
          </span>
        </div>
      </div>
    </div>
  );
}
