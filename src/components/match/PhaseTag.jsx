import React from "react";
import clsx from "clsx";
import { GAME_PHASES, LIVE_PHASES, FINISHED_PHASES } from "../../services/scoresStream";

export default function PhaseTag({ phaseId }) {
  const label = GAME_PHASES[phaseId] ?? "?";
  const isLive = LIVE_PHASES.has(phaseId);
  const isFinished = FINISHED_PHASES.has(phaseId);

  return (
    <span
      className={clsx(
        "badge text-xs",
        isLive && "bg-signal-green/15 text-signal-green",
        isFinished && "bg-slate-700/40 text-slate-400",
        !isLive && !isFinished && "bg-pitch-700 text-slate-400"
      )}
    >
      {isLive && (
        <span className="w-1.5 h-1.5 rounded-full bg-signal-green mr-1 inline-block animate-pulse" />
      )}
      {label}
    </span>
  );
}
