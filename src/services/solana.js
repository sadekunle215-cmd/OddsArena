/**
 * solana.js
 * Fetches and verifies TxLINE Merkle proofs on Solana.
 * Used by the Verify page and for on-chain decision logging.
 */

import { BASE_URL, authHeaders } from "./txline";

/**
 * Fetch Merkle proof for a specific odds update by messageId.
 * @param {string} messageId  — from the odds stream update
 */
export async function fetchOddsMerkleProof(messageId) {
  const res = await fetch(
    `${BASE_URL}/api/odds/proof/${messageId}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(`Merkle proof fetch failed: ${res.status}`);
  return res.json();
}

/**
 * Fetch Merkle proof for a single score statistic.
 * @param {string} messageId
 */
export async function fetchScoreMerkleProof(messageId) {
  const res = await fetch(
    `${BASE_URL}/api/scores/proof/${messageId}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(`Score proof fetch failed: ${res.status}`);
  return res.json();
}

/**
 * Verify a Merkle proof client-side.
 * Hashes the leaf up through sibling nodes and checks against the root.
 * @param {string}   leaf       hex string of leaf hash
 * @param {string[]} proof      array of sibling hex hashes
 * @param {string}   root       expected Merkle root hex string
 * @returns {boolean}
 */
export async function verifyMerkleProof(leaf, proof, root) {
  let current = hexToBytes(leaf);

  for (const sibling of proof) {
    const siblingBytes = hexToBytes(sibling);
    // Sort to match on-chain canonical ordering
    const combined =
      bytesToHex(current) < bytesToHex(siblingBytes)
        ? concat(current, siblingBytes)
        : concat(siblingBytes, current);

    const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
    current = new Uint8Array(hashBuffer);
  }

  return bytesToHex(current) === root.toLowerCase().replace("0x", "");
}

// ── helpers ────────────────────────────────────────────────────────────────

function hexToBytes(hex) {
  const clean = hex.replace("0x", "");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function concat(a, b) {
  const result = new Uint8Array(a.length + b.length);
  result.set(a);
  result.set(b, a.length);
  return result;
}
