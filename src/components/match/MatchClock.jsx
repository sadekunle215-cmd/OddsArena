import React from "react";
import { useMatchClock } from "../../hooks/useMatchClock";

export default function MatchClock({ scoreUpdate }) {
  const { minute, isLive } = useMatchClock(scoreUpdate);
  if (!isLive) return null;

  return (
    <span className="font-mono text-sm text-signal-green tabular-nums">
      {minute}&apos;
    </span>
  );
}
