import React from "react";
import { useOddsStream } from "../../hooks/useOddsStream";
import { useScoresStream } from "../../hooks/useScoresStream";

export default function Header() {
  const odds = useOddsStream();
  const scores = useScoresStream();
  const connected = odds.connected && scores.connected;

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-pitch-800 bg-pitch-950 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-agent-maker to-agent-taker flex items-center justify-center">
          <span className="text-white font-display font-700 text-sm">⚔</span>
        </div>
        <span className="font-display font-600 text-white text-lg tracking-tight">
          OddsArena
        </span>
        <span className="label-xs hidden sm:block text-slate-600">
          AI vs AI on World Cup Markets
        </span>
      </div>

      {/* Stream status */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            connected ? "bg-signal-green animate-pulse" : "bg-signal-red"
          }`}
        />
        <span className="label-xs">
          {connected ? "Live" : "Connecting..."}
        </span>
        <span className="label-xs text-slate-600 hidden md:block">
          Powered by TxLINE
        </span>
      </div>
    </header>
  );
}
