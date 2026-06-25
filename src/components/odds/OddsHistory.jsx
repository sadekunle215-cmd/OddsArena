import React from "react";
import { useOddsStore } from "../../store/oddsStore";
import { Sparkline } from "../ui";

export default function OddsHistory({ fixtureId, market = "home" }) {
  const history = useOddsStore((s) => s.getHistory(fixtureId));

  const values = history
    .map((u) => u?.homeOdds ?? u?.Home ?? u?.p1)
    .filter(Boolean);

  if (values.length < 3) return null;

  return (
    <div className="w-full">
      <p className="label-xs mb-1">Odds movement</p>
      <Sparkline data={values} color="#2979ff" height={48} />
    </div>
  );
}
