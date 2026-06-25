/**
 * scoresStream.js
 * Connects to the TxLINE real-time scores SSE stream.
 * Parses "Message: {...}" lines and dispatches to a callback.
 */

import { BASE_URL, authHeaders } from "./txline";

const SCORES_STREAM_URL = `${BASE_URL}/api/scores/stream`;

/**
 * Game phase ID → human readable label
 */
export const GAME_PHASES = {
  1: "NS",
  2: "H1",
  3: "HT",
  4: "H2",
  5: "FT",
  6: "WET",
  7: "ET1",
  8: "HTET",
  9: "ET2",
  10: "FET",
  11: "WPE",
  12: "PE",
  13: "FPE",
  14: "INT",
  15: "ABN",
  16: "CAN",
  17: "TXCC",
  18: "TXCS",
  19: "PST",
};

export const LIVE_PHASES = new Set([2, 4, 7, 9, 12]);
export const FINISHED_PHASES = new Set([5, 10, 13]);

/**
 * Opens the scores SSE stream.
 * @param {(update: ScoresUpdate) => void} onUpdate
 * @param {(err: Error) => void}           onError
 * @returns {{ close: () => void }}
 */
export function connectScoresStream(onUpdate, onError) {
  let active = true;
  let reader = null;

  async function open() {
    try {
      const res = await fetch(SCORES_STREAM_URL, {
        headers: {
          ...authHeaders(),
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) throw new Error(`Scores stream failed: ${res.status}`);

      reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (active) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

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
 * Fetch live scores for a single fixture.
 * @param {number} fixtureId
 */
export async function fetchScoresSnapshot(fixtureId) {
  const res = await fetch(
    `${BASE_URL}/api/scores/updates/${fixtureId}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(`Scores snapshot failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch all World Cup fixtures.
 */
export async function fetchFixtures() {
  const res = await fetch(
    `${BASE_URL}/api/fixtures/snapshot`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(`Fixtures fetch failed: ${res.status}`);
  return res.json();
}
