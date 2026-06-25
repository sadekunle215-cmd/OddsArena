import React from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

const NAV = [
  { to: "/arena", icon: "⚔️", label: "Arena" },
  { to: "/matches", icon: "⚽", label: "Matches" },
  { to: "/leaderboard", icon: "🏆", label: "Leaderboard" },
  { to: "/verify", icon: "🔐", label: "Verify" },
];

export default function Sidebar() {
  return (
    <aside className="w-14 lg:w-48 shrink-0 border-r border-pitch-800 bg-pitch-950 flex flex-col py-4 gap-1">
      {NAV.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-3 lg:px-4 py-2.5 mx-2 rounded-lg transition-all",
              isActive
                ? "bg-pitch-800 text-white"
                : "text-slate-500 hover:text-slate-300 hover:bg-pitch-900"
            )
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          <span className="hidden lg:block font-display font-500 text-sm">{label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
