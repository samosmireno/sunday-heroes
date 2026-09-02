// PROTOTYPE — throwaway. Horizontal chip strip (variant B), in the spirit of
// the round tabs: every season visible at once, newest on the right.
import { ProtoModel, SeasonSelection, seasonShortDates } from "./fake-seasons";

interface SeasonStripProps {
  model: ProtoModel;
  value: SeasonSelection;
  onChange: (next: SeasonSelection) => void;
}

export default function SeasonStrip({ model, value, onChange }: SeasonStripProps) {
  if (model.seasons.length < 2) return null;

  const chip = (
    key: string,
    active: boolean,
    onClick: () => void,
    top: string,
    bottom: string,
    current = false,
  ) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className={`flex shrink-0 flex-col items-start rounded-md border-2 px-3 py-1.5 text-left transition-colors ${
        active
          ? "border-accent bg-accent/20 text-accent"
          : "border-accent/30 bg-bg/30 text-gray-300 hover:bg-accent/10"
      }`}
    >
      <span className="flex items-center gap-1.5 text-sm font-semibold leading-tight">
        {top}
        {current && (
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" title="Current season" />
        )}
      </span>
      <span className={`text-[11px] leading-tight ${active ? "text-accent/80" : "text-gray-500"}`}>
        {bottom}
      </span>
    </button>
  );

  return (
    <div className="flex w-full max-w-full items-center gap-2 overflow-x-auto rounded-lg border-2 border-accent/20 bg-panel-bg/60 p-2">
      <span className="shrink-0 pl-1 pr-2 text-xs font-bold uppercase tracking-wider text-gray-400">
        Season
      </span>
      {model.seasons.map((s) =>
        chip(
          String(s.number),
          value === s.number,
          () => onChange(s.number),
          `Season ${s.number}`,
          seasonShortDates(s),
          s.endedAt === null,
        ),
      )}
      <span className="mx-1 h-6 w-px shrink-0 bg-accent/30" />
      {chip("all", value === "all", () => onChange("all"), "All seasons", `${model.seasons.length} seasons`)}
    </div>
  );
}
