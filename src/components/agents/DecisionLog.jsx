import React from "react";
import clsx from "clsx";
import { useAgentStore } from "../../store/agentStore";
import { format } from "date-fns";
import { Badge } from "../ui";

const ACTION_COLOR = {
  QUOTE: "blue",
  OPEN: "green",
  CLOSE: "amber",
  PULL: "default",
  CLOSE_ALL: "red",
};

export default function DecisionLog({ maxItems = 50 }) {
  const log = useAgentStore((s) => s.decisionLog);
  const visible = log.slice(0, maxItems);

  if (visible.length === 0) {
    return (
      <div className="text-slate-600 text-sm text-center py-8">
        Decisions appear here as agents act
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto max-h-80">
      {visible.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-2 p-2 rounded-lg hover:bg-pitch-800 transition-colors animate-slide-in"
        >
          <Badge color={entry.agent === "maker" ? "maker" : "taker"}>
            {entry.agent === "maker" ? "MM" : "ST"}
          </Badge>
          <Badge color={ACTION_COLOR[entry.action] ?? "default"}>
            {entry.action}
          </Badge>
          <span className="text-xs text-slate-400 flex-1 leading-relaxed">
            {entry.reason}
          </span>
          {entry.timestamp && (
            <span className="text-xs text-slate-600 font-mono shrink-0">
              {format(new Date(entry.timestamp), "HH:mm:ss")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
