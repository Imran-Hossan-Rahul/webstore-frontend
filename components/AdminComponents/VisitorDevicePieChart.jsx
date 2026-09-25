"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

export default function VisitorDevicePieChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/visitor-devices`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const json = await res.json();
        if (json.status === "success") {
          const chartData = json.data.map((item) => ({
            name: item.device,
            value: Number(item.percent),
          }));
          setData(chartData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ["#4ca404", "#af09dc", "#f59e0b", "#3b82f6", "#ec4899"];

  return (
    <div className="card-artifact p-3 rounded-[4px] text-black h-[187px] flex flex-col justify-center">
      <h2 className="text-lg font-bold mb-1 text-center">
        Visitor Devices Ratio (%)
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%" // same as account chart
            innerRadius="40%" // donut style, same as account chart
            paddingAngle={3}
            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

