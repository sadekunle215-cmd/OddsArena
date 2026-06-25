import React from "react";
import clsx from "clsx";

export default function OddsShift({ history, current }) {
  if (!history || history.length < 2) return null;
  const prev = history[history.length - 2];
  if (!prev || prev === 0) return null;

  const pct = ((current - prev) / prev) * 100;
  const up = pct > 0;
  const abs = Math.abs(pct);
  if (abs < 0.1) return null;

  return (
    <span
      className={clsx(
        "text-xs font-mono",
        up ? "text-signal-green" : "text-signal-red"
      )}
    >
      {up ? "▲" : "▼"} {abs.toFixed(1)}%
    </span>
  );
}
