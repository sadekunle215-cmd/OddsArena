/**
 * agent-engine/logger.js
 * Structured decision logger.
 * Writes NDJSON to stdout — pipe to a file or log aggregator.
 * Format: one JSON object per line.
 */

function log(entry) {
  const record = {
    ts: new Date().toISOString(),
    ...entry,
  };
  process.stdout.write(JSON.stringify(record) + "\n");
}

module.exports = { log };
