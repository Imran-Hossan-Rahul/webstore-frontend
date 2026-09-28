"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AllCountriesPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/countries/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (json.status === "success") {
          const chartData = json.data.map((item) => ({
            country: item.country,
            visitors: item.count,
          }));
          setData(chartData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-5 min-h-screen bg-brand-main">
      <h1 className="text-[24px] font-display font-medium mb-5">Visitor Country Stats</h1>
      <div className="bg-brand-surface p-5 rounded-[4px]">
        <ResponsiveContainer width="100%" height={600}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, bottom: 50, left: 100 }}
            barSize={20}
          >
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="country" width={150} />
            <Tooltip />
            <Bar dataKey="visitors" fill="#4ca404" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
