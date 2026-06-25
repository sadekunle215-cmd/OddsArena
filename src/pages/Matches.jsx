import React, { useEffect } from "react";
import { useMatchStore } from "../store/matchStore";
import { fetchFixtures } from "../services/scoresStream";
import MatchCard from "../components/match/MatchCard";
import { Loader } from "../components/ui";
import { format } from "date-fns";

export default function Matches() {
  const fixtures = useMatchStore((s) => s.fixtures);
  const scores = useMatchStore((s) => s.scores);
  const loading = useMatchStore((s) => s.loading);
  const error = useMatchStore((s) => s.error);
  const setFixtures = useMatchStore((s) => s.setFixtures);
  const setLoading = useMatchStore((s) => s.setLoading);
  const setError = useMatchStore((s) => s.setError);
  const setActive = useMatchStore((s) => s.setActiveFixture);
  const activeId = useMatchStore((s) => s.activeFixtureId);

  useEffect(() => {
    if (fixtures.length > 0) return;
    setLoading(true);
    fetchFixtures()
      .then(setFixtures)
      .catch((e) => setError(e.message));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-signal-red text-center py-10 text-sm">{error}</div>
    );
  }

  // Group by date
  const grouped = fixtures.reduce((acc, f) => {
    const day = f.StartTime
      ? format(new Date(f.StartTime), "EEE dd MMM yyyy")
      : "TBC";
    (acc[day] = acc[day] ?? []).push(f);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="font-display font-700 text-xl text-white">
          World Cup 2026
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {fixtures.length} matches · powered by TxLINE
        </p>
      </div>

      {Object.entries(grouped).map(([day, matches]) => (
        <div key={day}>
          <p className="label-xs mb-2">{day}</p>
          <div className="flex flex-col gap-2">
            {matches.map((f) => (
              <MatchCard
                key={f.FixtureId}
                fixture={f}
                score={scores[f.FixtureId]}
                active={f.FixtureId === activeId}
                onClick={() => setActive(f.FixtureId)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
