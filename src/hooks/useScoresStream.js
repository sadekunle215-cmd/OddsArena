/**
 * useScoresStream.js
 * React hook — connects to TxLINE scores SSE stream and feeds the match store.
 */

import { useEffect, useRef, useState } from "react";
import { connectScoresStream } from "../services/scoresStream";
import { useMatchStore } from "../store/matchStore";

export function useScoresStream() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const ingest = useMatchStore((s) => s.ingestScoreUpdate);
  const connRef = useRef(null);

  useEffect(() => {
    const conn = connectScoresStream(
      (update) => {
        setConnected(true);
        setError(null);
        ingest(update);
      },
      (err) => {
        setConnected(false);
        setError(err.message);
      }
    );

    connRef.current = conn;
    return () => conn.close();
  }, [ingest]);

  return { connected, error };
}
