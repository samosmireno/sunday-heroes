import { formatDate } from "@/utils/string";
import { PerformanceChartResponse } from "@repo/shared-types";

export const METRICS = {
  rating: {
    label: "Rating",
    borderColor: "rgb(34, 197, 94)",
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  goals: {
    label: "Goals",
    borderColor: "rgb(59, 130, 246)",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  assists: {
    label: "Assists",
    borderColor: "rgb(168, 85, 247)",
    backgroundColor: "rgba(168, 85, 247, 0.1)",
  },
};

export type MetricType = keyof typeof METRICS;

export const chartOptions = (performanceData: PerformanceChartResponse) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1a2332",
      titleColor: "#22c55e",
      bodyColor: "#ffffff",
      borderColor: "#22c55e",
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        title: (items: { dataIndex: number }[]) => {
          const index = items[0].dataIndex;
          const point = performanceData?.matches[index];
          return point
            ? `vs ${point.opponent} (${formatDate(point.date)})`
            : "";
        },
        label: (item: { dataIndex: number }) => {
          const index = item.dataIndex;
          const point = performanceData?.matches[index];
          if (!point) return "";
          return [
            `Goals: ${point.goals}`,
            `Assists: ${point.assists}`,
            `Rating: ${point.rating.toFixed(1)}`,
          ];
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: "rgba(34, 197, 94, 0.1)" },
      ticks: { color: "#9ca3af" },
    },
    x: {
      grid: { color: "rgba(34, 197, 94, 0.1)" },
      ticks: { color: "#9ca3af" },
    },
  },
});
