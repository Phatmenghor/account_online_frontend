"use client";

import { AllAmlStatisticsModel } from "@/models/aml/chart/aml-chart.response";
import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  Chart,
} from "chart.js";

// Register Chart.js modules
ChartJS.register(
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AmlStatisticsChart = ({ data }: { data: AllAmlStatisticsModel }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      if (ctx) {
        const labels = data.map((item) =>
          new Date(item.date).toLocaleDateString()
        );

        const successData = data.map((x) => x.successCount);
        const failedData = data.map((x) => x.failureCount);
        const amlData = data.map((x) => x.amlCount);

        chartInstanceRef.current = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Success Count",
                data: successData,
                borderColor: "rgb(54, 162, 235)",
                backgroundColor: "rgba(54, 162, 235, 0.3)",
                fill: false,
                pointRadius: 4,
                tension: 0.3,
              },
              {
                label: "Failure Count",
                data: failedData,
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.3)",
                fill: false,
                pointRadius: 4,
                tension: 0.3,
              },
              {
                label: "AML Count",
                data: amlData,
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.3)",
                fill: false,
                pointRadius: 4,
                tension: 0.3,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "AML Daily Statistics",
                font: { size: 18 },
              },
              legend: {
                display: true,
                position: "top",
              },
            },
            scales: {
              x: { grid: { color: "rgba(0,0,0,0.1)" } },
              y: {
                beginAtZero: true,
                grid: { color: "rgba(0,0,0,0.1)" },
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [data]);

  return (
    <div className="flex-1">
      <canvas ref={chartRef} />
    </div>
  );
};

export default AmlStatisticsChart;
