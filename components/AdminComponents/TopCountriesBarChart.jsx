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
import { useRouter } from "next/navigation";

export default function TopCountriesBarChart() {
  const [data, setData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/countries/top5`,
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

  const handleSeeMore = () => {
    router.push("/admin/all-countries");
  };

  return (
    <div className="card-template p-3 rounded-2xl shadow-md h-[300px] flex flex-col justify-between text-black">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Top 5 Countries</h2>
        <button
          onClick={handleSeeMore}
          className="text-xs text-blue-600 hover:underline"
        >
          See More
        </button>
      </div>

      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            barSize={20}
          >
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="country" width={100} />
            <Tooltip />
            <Bar dataKey="visitors" fill="#4ca404" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
