import React from "react";
import { useAgentStore } from "../../store/agentStore";
import AgentCard from "./AgentCard";
import { PnlValue } from "../ui";

export default function AgentBattle() {
  const maker = useAgentStore((s) => s.makerState);
  const taker = useAgentStore((s) => s.takerState);

  const makerWinning = maker.pnl > taker.pnl;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <AgentCard agent={maker} type="maker" />
        <AgentCard agent={taker} type="taker" />
      </div>

      {/* VS divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-pitch-700" />
        <div className="flex items-center gap-2">
          <PnlValue value={maker.pnl} className="text-sm" />
          <span className="text-slate-600 font-mono text-xs">vs</span>
          <PnlValue value={taker.pnl} className="text-sm" />
        </div>
        <div className="flex-1 h-px bg-pitch-700" />
      </div>

      {(maker.pnl !== 0 || taker.pnl !== 0) && (
        <p className="text-center text-xs text-slate-500 font-mono">
          {makerWinning ? "📊 Market Maker leading" : "🎯 Sharp Taker leading"}
        </p>
      )}
    </div>
  );
}
