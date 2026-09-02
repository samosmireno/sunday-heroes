// PROTOTYPE — throwaway. Dropdown selector (variants A and C).
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarRange } from "lucide-react";
import {
  ProtoModel,
  SeasonSelection,
  seasonDates,
  selectionLabel,
} from "./fake-seasons";

interface SeasonSelectProps {
  model: ProtoModel;
  value: SeasonSelection;
  onChange: (next: SeasonSelection) => void;
  className?: string;
  compact?: boolean;
}

export default function SeasonSelect({
  model,
  value,
  onChange,
  className = "",
  compact = false,
}: SeasonSelectProps) {
  if (model.seasons.length < 2) return null;
  const seasons = [...model.seasons].sort((a, b) => b.number - a.number);

  return (
    <Select
      value={String(value)}
      onValueChange={(v) => onChange(v === "all" ? "all" : Number(v))}
    >
      <SelectTrigger
        aria-label="Season"
        className={`border-2 border-accent/40 bg-bg/40 text-white ${compact ? "h-8 text-xs" : "h-9 text-sm"} ${className}`}
      >
        <CalendarRange className="mr-2 h-4 w-4 shrink-0 text-accent" />
        <SelectValue>
          <span className="truncate">{selectionLabel(model, value)}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-2 border-accent/40 bg-panel-bg">
        {seasons.map((s) => (
          <SelectItem
            key={s.number}
            value={String(s.number)}
            className="text-white focus:bg-accent/10"
          >
            <span className="font-medium">Season {s.number}</span>
            <span className="ml-2 text-xs text-gray-400">{seasonDates(s)}</span>
            {s.endedAt === null && (
              <span className="ml-2 rounded bg-green-900/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-green-400">
                current
              </span>
            )}
          </SelectItem>
        ))}
        <SelectItem value="all" className="text-white focus:bg-accent/10">
          <span className="font-medium">All seasons</span>
          <span className="ml-2 text-xs text-gray-400">
            {model.seasons.length} seasons
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
