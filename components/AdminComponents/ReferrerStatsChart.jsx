"use client";

import { useEffect, useState } from "react";
import PieChartArtifact from "./PieChartArtifact";

export default function ReferrerStatsChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stats/user-source`,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
          }
        );

        const json = await res.json();

        if (json.success) {
          const formatted = json.data.map((item) => ({
            name: item._id || "Direct",
            count: item.count,
          }));
          setData(formatted);
        }
      } catch (err) {
        console.error("Referrer error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading...</p>;

  return <PieChartArtifact title="Traffic Sources" data={data} />;
}

