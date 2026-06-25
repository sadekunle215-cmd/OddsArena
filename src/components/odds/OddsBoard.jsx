import React from "react";
import { useOddsStore } from "../../store/oddsStore";
import OddsShift from "./OddsShift";

const MARKETS = ["home", "draw", "away"];
const MARKET_LABELS = { home: "Home", draw: "Draw", away: "Away" };

export default function OddsBoard({ fixtureId }) {
  const odds = useOddsStore((s) => s.getNormalizedOdds(fixtureId));
  const history = useOddsStore((s) => s.getHistory(fixtureId));

  if (!odds) {
    return (
      <div className="text-slate-600 text-sm text-center py-6">
        Waiting for odds...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {MARKETS.map((market) => {
        const value = odds[market];
        const prevValues = history
          .slice(-20)
          .map((u) => u?.homeOdds ?? u?.Home ?? u?.p1)
          .filter(Boolean);

        return (
          <div
            key={market}
            className="card-sm p-3 flex flex-col items-center gap-1"
          >
            <span className="label-xs">{MARKET_LABELS[market]}</span>
            <span className="font-mono font-700 text-xl text-white tabular-nums">
              {value ? value.toFixed(3) : "—"}
            </span>
            {value && history.length > 1 && (
              <OddsShift history={prevValues} current={value} />
            )}
          </div>
        );
      })}
    </div>
  );
}
