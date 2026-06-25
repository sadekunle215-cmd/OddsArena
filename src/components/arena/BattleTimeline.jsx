import React from "react";
import { useAgentStore } from "../../store/agentStore";
import { format } from "date-fns";
import clsx from "clsx";

export default function BattleTimeline() {
  const log = useAgentStore((s) => s.decisionLog);
  const trades = log.filter((e) => ["OPEN", "CLOSE"].includes(e.action));

  if (trades.length === 0) {
    return (
      <div className="text-slate-600 text-sm text-center py-4">
        Trades appear on the timeline as agents act
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-0">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-pitch-700" />

      {trades.slice(0, 30).map((entry, i) => {
        const isMaker = entry.agent === "maker";
        return (
          <div key={entry.id} className="flex items-start gap-3 pb-3">
            {/* Dot */}
            <div
              className={clsx(
                "w-9 h-9 shrink-0 rounded-full border-2 flex items-center justify-center text-sm z-10",
                isMaker
                  ? "border-agent-maker bg-pitch-950 text-purple-400"
                  : "border-agent-taker bg-pitch-950 text-orange-400"
              )}
            >
              {isMaker ? "📊" : "🎯"}
            </div>

            <div className="flex-1 pt-1.5">
              <div className="flex items-center gap-2">
                <span className={clsx("text-xs font-mono font-500", isMaker ? "text-purple-400" : "text-orange-400")}>
                  {entry.agentLabel}
                </span>
                <span className="text-xs text-slate-600 font-mono">
                  {entry.timestamp ? format(new Date(entry.timestamp), "HH:mm:ss") : ""}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {entry.reason}
              </p>
              {entry.pnl !== undefined && (
                <span className={clsx("text-xs font-mono", entry.pnl >= 0 ? "text-signal-green" : "text-signal-red")}>
                  {entry.pnl >= 0 ? "+" : ""}{entry.pnl?.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
