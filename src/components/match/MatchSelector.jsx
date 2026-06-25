import React from "react";
import { useMatchStore } from "../../store/matchStore";
import MatchCard from "./MatchCard";

export default function MatchSelector() {
  const fixtures = useMatchStore((s) => s.fixtures);
  const activeId = useMatchStore((s) => s.activeFixtureId);
  const scores = useMatchStore((s) => s.scores);
  const setActive = useMatchStore((s) => s.setActiveFixture);

  const live = fixtures.filter((f) => {
    const s = scores[f.FixtureId];
    return s && [2, 4, 7, 9, 12].includes(s.gamePhase);
  });

  const upcoming = fixtures.filter((f) => {
    const s = scores[f.FixtureId];
    return !s || s.gamePhase === 1;
  }).slice(0, 5);

  return (
    <div className="flex flex-col gap-2">
      {live.length > 0 && (
        <>
          <p className="label-xs px-1">Live</p>
          {live.map((f) => (
            <MatchCard
              key={f.FixtureId}
              fixture={f}
              score={scores[f.FixtureId]}
              active={f.FixtureId === activeId}
              onClick={() => setActive(f.FixtureId)}
            />
          ))}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          <p className="label-xs px-1 mt-2">Upcoming</p>
          {upcoming.map((f) => (
            <MatchCard
              key={f.FixtureId}
              fixture={f}
              score={scores[f.FixtureId]}
              active={f.FixtureId === activeId}
              onClick={() => setActive(f.FixtureId)}
            />
          ))}
        </>
      )}

      {live.length === 0 && upcoming.length === 0 && (
        <p className="text-slate-600 text-sm text-center py-4">
          No matches available
        </p>
      )}
    </div>
  );
}
