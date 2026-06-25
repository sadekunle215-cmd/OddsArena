/**
 * useMatchClock.js
 * Derives a live match minute from score update data.
 * TxLINE score updates contain elapsed time — this hook ticks it forward.
 */

import { useState, useEffect, useRef } from "react";
import { LIVE_PHASES } from "../services/scoresStream";

/**
 * @param {object|null} scoreUpdate  latest score update for a fixture
 * @returns {{ minute: number, phase: string, isLive: boolean }}
 */
export function useMatchClock(scoreUpdate) {
  const [minute, setMinute] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!scoreUpdate) return;

    const phase = scoreUpdate.gamePhase;
    const isLive = LIVE_PHASES.has(phase);

    // Elapsed minutes from TxLINE (field name TBC from live schema)
    const elapsed = scoreUpdate.elapsed ?? scoreUpdate.Elapsed ?? scoreUpdate.minute ?? 0;
    setMinute(elapsed);

    if (timerRef.current) clearInterval(timerRef.current);

    if (isLive) {
      // Tick up every second (cosmetic — real truth comes from stream)
      timerRef.current = setInterval(() => {
        setMinute((m) => m + 1 / 60);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scoreUpdate]);

  const phase = scoreUpdate?.gamePhase;

  return {
    minute: Math.floor(minute),
    phase,
    isLive: phase ? LIVE_PHASES.has(phase) : false,
  };
}
