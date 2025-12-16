import { PerformanceChartResponse } from "@repo/shared-types";
import { METRICS, MetricType } from "./options";

export function getChartData(
  performanceData: PerformanceChartResponse | undefined,
  selectedMetric: MetricType,
) {
  if (!performanceData?.matches) return { labels: [], datasets: [] };
  const labels = performanceData.matches.map((point) => {
    const date = new Date(point.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });
  const metric = METRICS[selectedMetric];
  const data = performanceData.matches.map((point) => point[selectedMetric]);
  return {
    labels,
    datasets: [
      {
        label: metric.label,
        data,
        borderColor: metric.borderColor,
        backgroundColor: metric.backgroundColor,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: metric.borderColor,
        pointBorderColor: "#1a2332",
        pointBorderWidth: 2,
      },
    ],
  };
}
