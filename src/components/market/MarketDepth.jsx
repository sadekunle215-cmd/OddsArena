import React from "react";
import { useAgentStore } from "../../store/agentStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function MarketDepth() {
  const lastQuote = useAgentStore((s) => s.lastMmQuote);

  if (!lastQuote?.markets) return null;

  const data = Object.entries(lastQuote.markets).map(([market, m]) => ({
    name: market.charAt(0).toUpperCase() + market.slice(1),
    bid: m.bid,
    ask: m.ask,
    spread: +(m.ask - m.bid).toFixed(3),
  }));

  return (
    <div>
      <p className="label-xs mb-2">Market Depth</p>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={data} barSize={20}>
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{ background: "#0a1628", border: "1px solid #162d58", borderRadius: 8 }}
            labelStyle={{ color: "#94a3b8", fontSize: 11 }}
            itemStyle={{ color: "#e2e8f0", fontSize: 11 }}
          />
          <Bar dataKey="bid" name="Bid" fill="#00e676" opacity={0.7} radius={[2, 2, 0, 0]} />
          <Bar dataKey="ask" name="Ask" fill="#ff1744" opacity={0.7} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
