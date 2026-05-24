"use client";

import PieChartArtifact from "./PieChartArtifact";
import { useEffect, useState } from "react";

export default function NewVsRepeatedChart() {
  const [chart, setChart] = useState(null);

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
          setChart([
            { name: "New Users Today", count: json.data.newUsers },
            { name: "Repeated Users", count: json.data.repeatedUsers },
          ]);
        }
      } catch (err) {
        console.error("New vs Repeat error:", err);
      }
    };

    fetchStats();
  }, []);

  if (!chart) return <p>Loading...</p>;

  return <PieChartArtifact title="New vs Repeated Users" data={chart} />;
}

