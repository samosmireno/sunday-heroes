import { SeasonResponse } from "@repo/shared-types";
import { CalendarRange } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeasonSelection } from "./use-season-param";
import {
  ALL_SEASONS_LABEL,
  allSeasonsOptionLabel,
  seasonOptionLabel,
  seasonTriggerLabel,
} from "./season-labels";

interface SeasonSelectProps {
  seasons: SeasonResponse[];
  value: SeasonSelection;
  onChange: (next: SeasonSelection) => void;
}

/**
 * The header's season selector: Seasons newest first, the Current season
 * marked, All seasons last. The closed trigger shows the short label.
 */
export default function SeasonSelect({
  seasons,
  value,
  onChange,
}: SeasonSelectProps) {
  const newestFirst = [...seasons].sort((a, b) => b.number - a.number);
  const selected =
    typeof value === "number"
      ? seasons.find((season) => season.number === value)
      : undefined;

  return (
    <Select
      value={String(value)}
      onValueChange={(next) => onChange(next === "all" ? "all" : Number(next))}
    >
      <SelectTrigger
        aria-label="Season"
        className="h-9 w-full border-2 border-accent/40 bg-bg/40 text-sm text-white sm:w-[280px]"
      >
        <CalendarRange className="mr-2 h-4 w-4 shrink-0 text-accent" />
        <SelectValue>
          <span className="truncate">
            {selected ? seasonTriggerLabel(selected) : ALL_SEASONS_LABEL}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-2 border-accent/40 bg-panel-bg">
        {newestFirst.map((season) => (
          <SelectItem
            key={season.number}
            value={String(season.number)}
            className="text-white focus:bg-accent/10"
          >
            {seasonOptionLabel(season)}
            {season.endedAt === null && (
              <span className="ml-2 rounded bg-green-900/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-green-400">
                current
              </span>
            )}
          </SelectItem>
        ))}
        <SelectItem value="all" className="text-white focus:bg-accent/10">
          {allSeasonsOptionLabel(seasons.length)}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
