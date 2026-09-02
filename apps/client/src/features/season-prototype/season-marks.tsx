// PROTOTYPE — throwaway. The small marks every variant shares:
// the "Season N · closed" pill that replaces write actions, and the
// past-season banner / standings note that variants use differently.
import { Lock, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProtoSeason, formatDay } from "./fake-seasons";

export function ClosedSeasonBadge({
  season,
  size = "sm",
}: {
  season: ProtoSeason;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border-2 border-gray-500/40 bg-gray-800/40 font-medium text-gray-300 ${
        size === "xs" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1.5 text-xs sm:text-sm"
      }`}
      title={season.endedAt ? `Closed ${formatDay(season.endedAt)}` : undefined}
    >
      <Lock className={size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      Season {season.number} · closed
    </span>
  );
}

export function NotCompletedTag() {
  return (
    <span className="rounded bg-amber-900/30 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-400">
      Not completed
    </span>
  );
}

export function PastSeasonBanner({
  season,
  currentNumber,
  onBack,
}: {
  season: ProtoSeason;
  currentNumber: number;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border-2 border-gray-500/40 bg-gray-800/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2 text-sm text-gray-200">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <div>
          <span className="font-semibold">Season {season.number}</span>
          {season.endedAt && (
            <span className="text-gray-400"> · closed {formatDay(season.endedAt)}</span>
          )}
          <div className="text-xs text-gray-400">
            Matches from a past season can be viewed but not changed.
          </div>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onBack}
        className="w-full border-2 border-accent/40 bg-bg/30 text-gray-200 hover:bg-accent/10 sm:w-auto"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Season {currentNumber}
      </Button>
    </div>
  );
}

export function StandingsNote({
  currentNumber,
  onViewCurrent,
  variant = "replace",
}: {
  currentNumber: number;
  onViewCurrent: () => void;
  variant?: "replace" | "caption";
}) {
  if (variant === "caption") {
    return (
      <p className="mb-3 flex items-center gap-2 text-xs text-gray-400">
        <Info className="h-3.5 w-3.5 shrink-0 text-accent/70" />
        Standings are kept for the current season only. This is the Season {currentNumber} table.
      </p>
    );
  }
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg bg-bg/20 p-6 text-center">
      <Info className="mb-3 h-8 w-8 text-accent/70" />
      <h3 className="mb-1 text-base font-medium text-gray-200">
        Standings are kept for the current season only
      </h3>
      <p className="mb-4 max-w-sm text-sm text-gray-400">
        A past season's final table is not preserved. Its matches and player stats are.
      </p>
      <Button
        size="sm"
        onClick={onViewCurrent}
        className="border-2 border-accent/40 bg-bg/30 text-gray-200 hover:bg-accent/10"
      >
        View Season {currentNumber} standings
      </Button>
    </div>
  );
}
