/**
 * agent-engine/txlineClient.js
 * Node.js TxLINE stream client using native fetch (Node 18+).
 */

const BASE_URL = "https://txline.txodds.com";

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.TXLINE_JWT}`,
    "X-Api-Token": process.env.TXLINE_API_TOKEN,
    Accept: "text/event-stream",
    "Cache-Control": "no-cache",
  };
}

async function connectStream(url, onUpdate, onError) {
  let active = true;

  async function open() {
    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error(`Stream ${url} → ${res.status}`);

      const reader = res.body.getReader();
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
              onUpdate(JSON.parse(line.substring(9)));
            } catch { /* skip */ }
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
  return { close: () => { active = false; } };
}

function connectOddsStream(onUpdate, onError) {
  return connectStream(`${BASE_URL}/api/odds/stream`, onUpdate, onError);
}

function connectScoresStream(onUpdate, onError) {
  return connectStream(`${BASE_URL}/api/scores/stream`, onUpdate, onError);
}

module.exports = { connectOddsStream, connectScoresStream };
