"use client";

import { useEffect, useState } from "react";
import PieChartArtifact from "./PieChartArtifact";

export default function AccountTypeChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/user-analysis`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );

        const json = await res.json();
        if (json.success) {
          const formatted = json.data.accountTypeStats.map((item) => ({
            name: item._id || "Unknown",
            count: item.count,
          }));
          setData(formatted);
        }
      } catch (err) {
        console.error("Account type error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading...</p>;

  return <PieChartArtifact title="Account Types" data={data} />;
}

