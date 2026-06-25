import React from "react";
import { useAgentStore } from "../../store/agentStore";
import BidAskSpread from "./BidAskSpread";

const MARKETS = ["home", "draw", "away"];
const LABELS = { home: "Home Win", draw: "Draw", away: "Away Win" };

export default function OrderBook() {
  const lastQuote = useAgentStore((s) => s.lastMmQuote);

  if (!lastQuote || lastQuote.action !== "QUOTE") {
    return (
      <div className="text-slate-600 text-sm text-center py-6">
        Market Maker not quoting
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2 px-1">
        <span className="label-xs">Market</span>
        <span className="label-xs text-right">Bid</span>
        <span className="label-xs text-right">Ask</span>
        <span className="label-xs text-right">Spread</span>
      </div>

      {MARKETS.map((market) => {
        const m = lastQuote.markets?.[market];
        if (!m) return null;
        return (
          <div
            key={market}
            className="grid grid-cols-4 gap-2 card-sm px-3 py-2 items-center"
          >
            <span className="font-display text-sm text-slate-300">
              {LABELS[market]}
            </span>
            <span className="font-mono text-sm text-signal-green text-right tabular-nums">
              {m.bid.toFixed(3)}
            </span>
            <span className="font-mono text-sm text-signal-red text-right tabular-nums">
              {m.ask.toFixed(3)}
            </span>
            <span className="font-mono text-xs text-slate-500 text-right tabular-nums">
              {m.spreadPct}%
            </span>
          </div>
        );
      })}

      <BidAskSpread spreadPct={lastQuote.spreadPct} volatility={lastQuote.volatility} />
    </div>
  );
}
