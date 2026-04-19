"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesChart = ({ sales }) => {
  const sortedSales = sales.sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = sortedSales.map((s) =>
    new Date(s.date).toLocaleDateString("en-GB")
  );
  const amounts = sortedSales.map((s) => s.amount);

  const data = {
    labels,
    datasets: [
      {
        label: "Sales Amount",
        data: amounts,
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Sales Per Day" },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Amount" }, beginAtZero: true },
    },
  };

  return <Line data={data} options={options} />;
};

export default SalesChart;
