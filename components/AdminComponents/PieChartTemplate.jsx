"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#af09dc",
  "#4ca404",
  "#f39c12",
  "#3498db",
  "#9b59b6",
  "#e74c3c",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-2 text-xs pointer-events-none">
        {payload.map((entry) => (
          <p key={entry.name} className="m-0">
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PieChartTemplate({ title, data }) {
  return (
    <div className="card-template p-3 rounded-2xl shadow-md h-[400px] flex flex-col justify-between text-black">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
