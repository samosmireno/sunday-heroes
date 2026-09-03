import { Lock } from "lucide-react";
import { cn } from "@/utils/cn";
import { closedSeasonLabel } from "./season-labels";

interface ClosedSeasonLockProps {
  seasonNumber: number;
  className?: string;
}

/**
 * Marks a Past season's Match as history (ADR 0002). For admins and moderators
 * it takes the place of Edit and Mark as Completed on the League match details
 * and of the pencil and bin on the Duel card; on the All Matches list it sits
 * in the actions cell for everyone, next to the actions that stay (voting open
 * at the rollover runs on, and the details can still be expanded).
 */
export default function ClosedSeasonLock({
  seasonNumber,
  className,
}: ClosedSeasonLockProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-400",
        className,
      )}
      title="Matches from a past season can be viewed but not changed."
    >
      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
      {closedSeasonLabel(seasonNumber)}
    </span>
  );
}
