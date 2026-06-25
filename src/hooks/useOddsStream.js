/**
 * useOddsStream.js
 * React hook — connects to TxLINE odds SSE stream and feeds the odds store.
 */

import { useEffect, useRef, useState } from "react";
import { connectOddsStream } from "../services/oddsStream";
import { useOddsStore } from "../store/oddsStore";

export function useOddsStream() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const ingest = useOddsStore((s) => s.ingestOddsUpdate);
  const connRef = useRef(null);

  useEffect(() => {
    const conn = connectOddsStream(
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
