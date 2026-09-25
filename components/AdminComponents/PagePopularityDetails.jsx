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

export default function PagePopularityDetails() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/pageviews`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();
        if (json.status === "success") {
          const sorted = json.data.sort((a, b) => b.views - a.views);
          setData(
            sorted.map((item) => ({ page: item._id, views: item.views }))
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-5 min-h-screen bg-brand-cloud">
      <h1 className="text-[24px] font-display font-medium mb-5">All Pages Popularity</h1>
      <div className="bg-white p-5 rounded-[4px]">
        <ResponsiveContainer width="100%" height={600}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, bottom: 50, left: 50 }}
          >
            <XAxis
              dataKey="page"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="views" fill="#af09dc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
