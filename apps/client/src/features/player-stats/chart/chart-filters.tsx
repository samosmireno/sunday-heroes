import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METRICS, MetricType } from "./options";
import { Button } from "@/components/ui/button";

interface ChartFiltersProps {
  competitionsInfo?: {
    name: string;
    id: string;
  }[];
  selectedCompetition: string;
  setSelectedCompetition: (competition: string) => void;
  selectedMetric: string;
  setSelectedMetric: (metric: MetricType) => void;
  selectedRange: number;
  setSelectedRange: (range: number) => void;
}

export default function ChartFilters({
  competitionsInfo,
  selectedCompetition,
  setSelectedCompetition,
  selectedMetric,
  setSelectedMetric,
  selectedRange,
  setSelectedRange,
}: ChartFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={selectedCompetition}
        onValueChange={setSelectedCompetition}
      >
        <SelectTrigger className="w-[180px] border-2 border-accent/40 bg-gray-800/20 text-white">
          <SelectValue placeholder="Select competition" />
        </SelectTrigger>
        <SelectContent className="border-2 border-accent/40 bg-panel-bg">
          {competitionsInfo?.map((comp) => (
            <SelectItem
              key={comp.id}
              value={comp.id}
              className="text-white hover:bg-gray-800/40"
            >
              {comp.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedRange.toString()}
        onValueChange={(value) => setSelectedRange(Number(value))}
      >
        <SelectTrigger className="w-[120px] border-2 border-accent/40 bg-gray-800/20 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-2 border-accent/40 bg-panel-bg">
          {[5, 10, 20].map((val) => (
            <SelectItem
              key={val}
              value={val.toString()}
              className="text-white hover:bg-gray-800/40"
            >
              Last {val}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-1">
        {(Object.keys(METRICS) as MetricType[]).map((metric) => (
          <Button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedMetric === metric
                ? "bg-accent text-gray-800 hover:bg-accent"
                : "bg-gray-800/20 text-gray-400 hover:bg-accent/40"
            }`}
          >
            {METRICS[metric].label}
          </Button>
        ))}
      </div>
    </div>
  );
}
