import React from "react";
import clsx from "clsx";

export default function BidAskSpread({ spreadPct, volatility }) {
  if (!spreadPct) return null;
  const isWide = spreadPct > 4;

  return (
    <div className="flex items-center gap-2 px-1 mt-1">
      <span className="label-xs">Spread</span>
      <span
        className={clsx(
          "font-mono text-xs",
          isWide ? "text-signal-amber" : "text-signal-green"
        )}
      >
        {spreadPct.toFixed(2)}%
      </span>
      {volatility > 0.05 && (
        <span className="badge bg-signal-amber/10 text-signal-amber text-xs">
          ⚡ Volatile
        </span>
      )}
    </div>
  );
}
