import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { usePerformanceData } from "./use-performance";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { chartOptions, MetricType } from "./options";
import { getChartData } from "./utils";
import ChartFilters from "./chart-filters";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface CompetitionPerformanceChartProps {
  competitionsInfo?: {
    name: string;
    id: string;
  }[];
}

export default function CompetitionPerformanceChart({
  competitionsInfo,
}: CompetitionPerformanceChartProps) {
  const { playerId } = useParams() as { playerId: string };
  const [selectedCompetition, setSelectedCompetition] = useState(
    competitionsInfo?.[0]?.id || "",
  );
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("rating");
  const [selectedRange, setSelectedRange] = useState(5);

  const { performanceData, isLoading } = usePerformanceData(
    playerId,
    selectedCompetition,
    selectedRange,
  );

  useEffect(() => {
    if (competitionsInfo && competitionsInfo.length > 0) {
      setSelectedCompetition(competitionsInfo[0].id);
    }
  }, [competitionsInfo]);

  if (!competitionsInfo || competitionsInfo.length === 0) return null;

  return (
    <Card className="border-2 border-accent bg-panel-bg">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold text-white">
            Performance History
          </CardTitle>
          <ChartFilters
            competitionsInfo={competitionsInfo}
            selectedCompetition={selectedCompetition}
            setSelectedCompetition={setSelectedCompetition}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        ) : !performanceData || performanceData.matches.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-sm text-gray-400">
              No performance data available
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="h-[220px] min-w-0 sm:h-[300px]">
              <Line
                data={getChartData(performanceData, selectedMetric)}
                options={chartOptions(performanceData)}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
