/**
 * oddsStream.js
 * Connects to the TxLINE real-time odds SSE stream.
 * Parses "Message: {...}" lines and dispatches to a callback.
 */

import { BASE_URL, authHeaders } from "./txline";

const ODDS_STREAM_URL = `${BASE_URL}/api/odds/stream`;

/**
 * Opens the odds SSE stream.
 * @param {(update: OddsUpdate) => void} onUpdate  called on every odds update
 * @param {(err: Error) => void}         onError   called on stream error
 * @returns {{ close: () => void }}  call close() to stop the stream
 */
export function connectOddsStream(onUpdate, onError) {
  let active = true;
  let reader = null;

  async function open() {
    try {
      const res = await fetch(ODDS_STREAM_URL, {
        headers: {
          ...authHeaders(),
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) {
        throw new Error(`Odds stream failed: ${res.status}`);
      }

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (active) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete last line

        for (const line of lines) {
          if (line.startsWith("Message: ")) {
            try {
              const data = JSON.parse(line.substring(9));
              onUpdate(data);
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    } catch (err) {
      if (active) {
        onError?.(err);
        // Auto-reconnect after 3s
        setTimeout(() => { if (active) open(); }, 3000);
      }
    }
  }

  open();

  return {
    close() {
      active = false;
      reader?.cancel();
    },
  };
}

/**
 * Fetch current odds snapshot for a single fixture.
 * @param {number} fixtureId
 */
export async function fetchOddsSnapshot(fixtureId) {
  const { authHeaders: getHeaders } = await import("./txline");
  const res = await fetch(
    `${BASE_URL}/api/odds/snapshot/${fixtureId}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(`Odds snapshot failed: ${res.status}`);
  return res.json();
}
