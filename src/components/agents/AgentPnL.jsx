import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useAgentStore } from "../../store/agentStore";
import { format } from "date-fns";

export default function AgentPnL() {
  const makerHistory = useAgentStore((s) => s.makerState.pnlHistory);
  const takerHistory = useAgentStore((s) => s.takerState.pnlHistory);

  // Merge both histories onto a shared time axis
  const allTimes = [
    ...makerHistory.map((p) => p.timestamp),
    ...takerHistory.map((p) => p.timestamp),
  ].sort((a, b) => a - b);

  if (allTimes.length < 2) {
    return (
      <div className="text-slate-600 text-sm text-center py-8">
        P&L chart builds as agents trade
      </div>
    );
  }

  const data = allTimes.map((t) => {
    const m = makerHistory.filter((p) => p.timestamp <= t).pop();
    const tk = takerHistory.filter((p) => p.timestamp <= t).pop();
    return {
      t,
      maker: m?.pnl ?? 0,
      taker: tk?.pnl ?? 0,
      label: format(new Date(t), "HH:mm"),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data}>
        <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
        <ReferenceLine y={0} stroke="#162d58" strokeDasharray="4 2" />
        <Tooltip
          contentStyle={{ background: "#0a1628", border: "1px solid #162d58", borderRadius: 8 }}
          labelStyle={{ color: "#94a3b8", fontSize: 11 }}
          itemStyle={{ fontSize: 11 }}
        />
        <Line type="monotone" dataKey="maker" name="Market Maker" stroke="#7c3aed" strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="taker" name="Sharp Taker" stroke="#ea580c" strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
