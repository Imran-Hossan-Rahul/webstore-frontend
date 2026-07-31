"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

export default function VisitorAccountPieChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/visitor-account`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const json = await res.json();
        if (json.status === "success") {
          const chartData = json.data.map((item) => ({
            name: item.type || item.name,
            value: Number(item.count || item.percent || 0),
          }));
          setData(chartData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

  return (
    <div className="card-artifact p-3 rounded-2xl shadow-md text-black h-[187px] flex flex-col justify-center w-[48%]">
      <h2 className="text-lg font-bold mb-1 text-center">
        Visitor Account Ratio
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
            innerRadius="40%"
            paddingAngle={3}
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
