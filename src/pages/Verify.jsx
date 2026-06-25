import React, { useState } from "react";
import { fetchOddsMerkleProof, verifyMerkleProof } from "../services/solana";
import { Card, Badge, Loader } from "../components/ui";

const STATUS = { idle: "idle", loading: "loading", valid: "valid", invalid: "invalid", error: "error" };

export default function Verify() {
  const [messageId, setMessageId] = useState("");
  const [status, setStatus] = useState(STATUS.idle);
  const [proof, setProof] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleVerify() {
    if (!messageId.trim()) return;
    setStatus(STATUS.loading);
    setProof(null);
    setErrorMsg("");

    try {
      const data = await fetchOddsMerkleProof(messageId.trim());
      setProof(data);

      const valid = await verifyMerkleProof(
        data.leaf ?? data.Leaf,
        data.proof ?? data.Proof,
        data.root ?? data.Root
      );
      setStatus(valid ? STATUS.valid : STATUS.invalid);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus(STATUS.error);
    }
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="font-display font-700 text-xl text-white">
          On-Chain Verify
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Verify any agent decision against its TxLINE Merkle proof on Solana.
        </p>
      </div>

      <Card>
        <p className="label-xs mb-3">Message ID</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={messageId}
            onChange={(e) => setMessageId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            placeholder="Paste TxLINE messageId..."
            className="flex-1 bg-pitch-800 border border-pitch-700 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-signal-blue"
          />
          <button
            onClick={handleVerify}
            disabled={status === STATUS.loading || !messageId.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {status === STATUS.loading ? <Loader size="sm" /> : null}
            Verify
          </button>
        </div>
      </Card>

      {/* Result */}
      {status === STATUS.valid && (
        <Card className="border-signal-green/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-signal-green text-lg">✅</span>
            <span className="font-display font-600 text-signal-green">
              Proof Valid
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            This odds update is cryptographically verified on Solana.
          </p>
          {proof && <ProofDetails proof={proof} />}
        </Card>
      )}

      {status === STATUS.invalid && (
        <Card className="border-signal-red/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-signal-red text-lg">❌</span>
            <span className="font-display font-600 text-signal-red">
              Proof Invalid
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            The Merkle proof did not match the expected root. The data may have
            been tampered with.
          </p>
        </Card>
      )}

      {status === STATUS.error && (
        <Card className="border-signal-amber/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-signal-amber text-lg">⚠️</span>
            <span className="font-display font-600 text-signal-amber">Error</span>
          </div>
          <p className="text-slate-400 text-sm font-mono">{errorMsg}</p>
        </Card>
      )}

      {/* How it works */}
      <Card>
        <p className="label-xs mb-3">How it works</p>
        <div className="flex flex-col gap-3 text-sm text-slate-400">
          <p>
            Every TxLINE odds update is hashed and anchored into a Merkle tree
            whose root is published on Solana. This means any single update can
            be cryptographically proven against the on-chain root without
            trusting TxODDS directly.
          </p>
          <p>
            Every agent decision in OddsArena includes the <code className="text-slate-300 bg-pitch-800 px-1 rounded text-xs">messageId</code> of
            the odds update that triggered it. Paste any messageId here to
            independently verify the underlying data.
          </p>
        </div>
      </Card>
    </div>
  );
}

function ProofDetails({ proof }) {
  const leaf = proof.leaf ?? proof.Leaf ?? "";
  const root = proof.root ?? proof.Root ?? "";
  const siblings = proof.proof ?? proof.Proof ?? [];

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div>
        <p className="label-xs mb-1">Leaf Hash</p>
        <p className="font-mono text-xs text-slate-300 break-all">{leaf}</p>
      </div>
      <div>
        <p className="label-xs mb-1">Merkle Root</p>
        <p className="font-mono text-xs text-slate-300 break-all">{root}</p>
      </div>
      <div>
        <p className="label-xs mb-1">Proof Depth</p>
        <Badge color="blue">{siblings.length} siblings</Badge>
      </div>
    </div>
  );
}
