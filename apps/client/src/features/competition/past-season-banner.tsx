import { SeasonResponse } from "@repo/shared-types";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pastSeasonBanner } from "./season-labels";

interface PastSeasonBannerProps {
  season: SeasonResponse;
  current: number;
  onBack: () => void;
}

/** Over a Past season's views: the Season is closed, and the way back to the Current season. */
export default function PastSeasonBanner({
  season,
  current,
  onBack,
}: PastSeasonBannerProps) {
  const copy = pastSeasonBanner(season, current);

  return (
    <div
      role="status"
      className="mb-6 flex flex-col gap-2 rounded-lg border-2 border-accent/40 bg-panel-bg px-4 py-3 shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2 text-sm text-gray-200">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        <p>{copy.message}</p>
      </div>
      <Button
        size="sm"
        onClick={onBack}
        className="w-full border-2 border-accent/40 bg-bg/30 text-gray-200 hover:bg-accent/10 sm:w-auto"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {copy.backButton}
      </Button>
    </div>
  );
}
