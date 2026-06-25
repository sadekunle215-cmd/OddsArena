import React from "react";
import clsx from "clsx";
import PhaseTag from "./PhaseTag";
import MatchClock from "./MatchClock";

export default function MatchCard({ fixture, score, active, onClick }) {
  if (!fixture) return null;

  const home = fixture.Participant1 ?? fixture.participant1 ?? "Home";
  const away = fixture.Participant2 ?? fixture.participant2 ?? "Away";
  const homeGoals = score?.stats?.[1] ?? 0;
  const awayGoals = score?.stats?.[2] ?? 0;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full text-left p-3 rounded-xl border transition-all duration-150",
        active
          ? "border-signal-blue/50 bg-signal-blue/5"
          : "border-pitch-700 bg-pitch-900 hover:border-pitch-600 hover:bg-pitch-800"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <PhaseTag phaseId={score?.gamePhase} />
        <MatchClock scoreUpdate={score} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-display font-500 text-sm text-white truncate flex-1">
          {home}
        </span>
        <span className="font-mono font-700 text-white tabular-nums text-sm shrink-0">
          {homeGoals} – {awayGoals}
        </span>
        <span className="font-display font-500 text-sm text-white truncate flex-1 text-right">
          {away}
        </span>
      </div>
    </button>
  );
}
