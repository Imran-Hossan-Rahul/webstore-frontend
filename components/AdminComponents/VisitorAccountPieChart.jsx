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
          `${process.env.NEXT_PUBLIC_API_URL}/stats/visitor-accounts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const json = await res.json();
        if (json.status === "success") {
          const { percentWith, percentWithout } = json.data;
          setData([
            { name: "Registered Users", value: Number(percentWith) },
            { name: "Visitors (No Account)", value: Number(percentWithout) },
          ]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ["#4ca404", "#af09dc"];

  return (
    <div className="card-template p-3 rounded-2xl shadow-md text-black h-[187px] flex flex-col justify-center">
      <h2 className="text-lg font-bold mb-1 text-center">
        Visitor Account Ratio (%)
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%" // compact & responsive
            innerRadius="40%" // donut style, space for labels
            paddingAngle={3} // slice spacing
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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
