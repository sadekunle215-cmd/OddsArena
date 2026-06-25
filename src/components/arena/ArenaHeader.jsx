import React from "react";
import { useMatchStore } from "../../store/matchStore";
import PhaseTag from "../match/PhaseTag";
import MatchClock from "../match/MatchClock";

export default function ArenaHeader() {
  const fixture = useMatchStore((s) => s.getActiveFixture());
  const scores = useMatchStore((s) => s.scores);

  if (!fixture) {
    return (
      <div className="text-slate-600 text-center py-4 text-sm">
        Select a match to start the arena
      </div>
    );
  }

  const score = scores[fixture.FixtureId];
  const home = fixture.Participant1 ?? "Home";
  const away = fixture.Participant2 ?? "Away";
  const homeGoals = score?.stats?.[1] ?? 0;
  const awayGoals = score?.stats?.[2] ?? 0;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-center gap-3 mb-2">
        <PhaseTag phaseId={score?.gamePhase} />
        <MatchClock scoreUpdate={score} />
      </div>
      <div className="flex items-center justify-center gap-4">
        <span className="font-display font-700 text-lg text-white">{home}</span>
        <span className="font-mono font-700 text-2xl text-white tabular-nums">
          {homeGoals} – {awayGoals}
        </span>
        <span className="font-display font-700 text-lg text-white">{away}</span>
      </div>
    </div>
  );
}
