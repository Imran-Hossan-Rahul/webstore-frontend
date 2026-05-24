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
import VisitorAccountPieChart from "./VisitorAccountPieChart";
import VisitorDevicePieChart from "./VisitorDevicePieChart";

export default function PagePopularitySmaller() {
  const [data, setData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return; // token na thakle fetch chalbe na

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
          const top5 = json.data
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
            .map((item) => ({ page: item._id, views: item.views }));

          setData(top5);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleSeeMore = () => {
    router.push("/admin/page-views");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="card-artifact p-3 rounded-2xl shadow-md h-[300px] flex flex-col justify-between text-black">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Top 5 Pages</h2>
          <button
            onClick={handleSeeMore}
            className="text-xs text-blue-600 hover:underline"
          >
            See More
          </button>
        </div>

        <div className="flex-1 min-h-[180px] flex">
          {/* Left label area */}
          <div className="flex-shrink-0 w-[150px] text-xs pr-2">
            {data.map((item) => (
              <div
                key={item.page}
                className="h-[calc(100%/5.8)] flex items-center"
              >
                {item.page}
              </div>
            ))}
          </div>

          {/* Graph area */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                barSize={20}
              >
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="page" hide />
                <Tooltip />
                <Bar dataKey="views" fill="#4ca404" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="lower flex justify-between items-center">
        <VisitorAccountPieChart />
        <VisitorDevicePieChart />
      </div>
    </div>
  );
}

