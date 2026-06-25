import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { LineChart, Line, ResponsiveContainer } from "recharts";

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ children, color = "default", className }) {
  const colors = {
    default: "bg-pitch-700 text-slate-300",
    green: "bg-signal-green/10 text-signal-green",
    red: "bg-signal-red/10 text-signal-red",
    amber: "bg-signal-amber/10 text-signal-amber",
    blue: "bg-signal-blue/10 text-signal-blue",
    maker: "bg-agent-maker/20 text-purple-300",
    taker: "bg-agent-taker/20 text-orange-300",
  };
  return (
    <span className={clsx("badge", colors[color], className)}>
      {children}
    </span>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({ children, className }) {
  return <div className={clsx("card p-4", className)}>{children}</div>;
}

export function CardSm({ children, className }) {
  return <div className={clsx("card-sm p-3", className)}>{children}</div>;
}

// ── Sparkline ──────────────────────────────────────────────────────────────
export function Sparkline({ data = [], color = "#2979ff", height = 40 }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={points}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Loader ─────────────────────────────────────────────────────────────────
export function Loader({ size = "md" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  return (
    <div
      className={clsx(
        "border-2 border-pitch-700 border-t-signal-blue rounded-full animate-spin",
        sizes[size]
      )}
    />
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
export function Toast({ message, type = "info", onDismiss }) {
  const colors = {
    info: "border-signal-blue/30 bg-signal-blue/10 text-signal-blue",
    success: "border-signal-green/30 bg-signal-green/10 text-signal-green",
    error: "border-signal-red/30 bg-signal-red/10 text-signal-red",
  };
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={clsx(
        "border rounded-lg px-4 py-2 text-sm font-mono animate-slide-in",
        colors[type]
      )}
    >
      {message}
    </div>
  );
}

// ── PnlValue ───────────────────────────────────────────────────────────────
export function PnlValue({ value, className }) {
  const positive = value >= 0;
  return (
    <span
      className={clsx(
        "font-mono font-500 tabular-nums",
        positive ? "text-signal-green" : "text-signal-red",
        className
      )}
    >
      {positive ? "+" : ""}{value.toFixed(2)}
    </span>
  );
}
