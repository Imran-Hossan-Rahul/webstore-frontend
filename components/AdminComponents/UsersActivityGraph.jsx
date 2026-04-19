"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    return (
      <div className="bg-white border border-gray-300 rounded-lg p-2 text-xs min-w-[140px] pointer-events-none">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} className="m-0">
            {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}:{" "}
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
        <hr className="my-1" />
        <p className="font-semibold">Total: {total}</p>
      </div>
    );
  }
  return null;
};

export default function UsersActivityAreaChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [lifetime, setLifetime] = useState(true);

  // Initialize last 7 days (default)
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);
    setStartDate(lastWeek.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  // Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/daily-users`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );
        const json = await res.json();
        if (json.success) {
          setData(json.stats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  // Fill missing dates with 0, handle lifetime
  const filledData = () => {
    if (data.length === 0) return [];

    let start = startDate;
    let end = endDate;

    if (lifetime) {
      start = data.reduce(
        (earliest, item) => (item.date < earliest ? item.date : earliest),
        data[0].date
      );
      end = data.reduce(
        (latest, item) => (item.date > latest ? item.date : latest),
        data[0].date
      );
    }

    const result = [];
    const current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      const dateStr = current.toISOString().split("T")[0];
      const existing = data.find((d) => d.date === dateStr);
      result.push({
        date: dateStr,
        freelancers: existing ? existing.freelancers : 0,
        clients: existing ? existing.clients : 0,
      });
      current.setDate(current.getDate() + 1);
    }
    return result;
  };

  const chartData = filledData();

  const totalFreelancer = chartData.reduce(
    (acc, item) => acc + item.freelancers,
    0
  );
  const totalClient = chartData.reduce((acc, item) => acc + item.clients, 0);

  return (
    <div className="card-template p-3 rounded-2xl shadow-md h-[500px] flex flex-col justify-between transition-all duration-300 text-black relative">
      {/* Title */}
      <h2 className="text-lg font-bold mb-2">User Activity</h2>

      {/* Calendar toolbar */}
      <div className="flex items-center gap-1 text-xs mb-2 relative z-20">
        <button
          className="p-1 bg-gray-200 rounded-md"
          onClick={() => setShowCalendar(!showCalendar)}
        >
          &#128197;
        </button>
        <span>Start: {startDate || "Select"}</span>
        <span>End: {endDate || "Select"}</span>
        <div className="ml-auto flex items-center gap-1">
          <input
            type="checkbox"
            id="lifetime"
            checked={lifetime}
            onChange={(e) => setLifetime(e.target.checked)}
          />
          <label htmlFor="lifetime" className="text-xs">
            Lifetime
          </label>
        </div>

        {/* Overlay Date Picker */}
        {showCalendar && !lifetime && (
          <div className="absolute top-full left-0 mt-1 flex gap-1 bg-white p-2 shadow-md rounded-md">
            <input
              type="date"
              className="border p-1 rounded-md text-xs"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="border border-gray-300 p-1 rounded-md text-xs"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="flex gap-1 mb-2">
        <div className="flex-1 p-1 bg-gray-100 rounded-md text-center text-xs">
          <p>Total Freelancers</p>
          <p className="font-bold text-[#af09dc]">{totalFreelancer}</p>
        </div>
        <div className="flex-1 p-1 bg-gray-100 rounded-md text-center text-xs">
          <p>Total Clients</p>
          <p className="font-bold text-[#4ca404]">{totalClient}</p>
        </div>
        <div className="flex-1 p-1 bg-gray-100 rounded-md text-center text-xs">
          <p>Total Users</p>
          <p className="font-bold">{totalFreelancer + totalClient}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 10, left: 0, bottom: 4 }}
          >
            <XAxis
              dataKey="date"
              tickFormatter={(dt) => {
                const date = new Date(dt);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              tick={{ fontSize: 10 }}
            />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#ccc", strokeWidth: 1 }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="freelancers"
              stroke="#af09dc"
              fill="#af09dc33"
            />
            <Area
              type="monotone"
              dataKey="clients"
              stroke="#4ca404"
              fill="#4ca40433"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
