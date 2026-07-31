"use client";

import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function PieChartArtifact({ title, data = [] }) {
  const formattedData = (data || []).map((item) => ({
    name: item.name || "Other",
    value: Number(item.count !== undefined ? item.count : item.value || 0),
  }));

  if (!formattedData.length) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">{title}</h3>
        <p className="text-xs text-slate-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px]">
      {title && <h3 className="text-sm font-semibold text-slate-200 mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={formattedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={65}
            innerRadius={35}
            paddingAngle={3}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "4px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
