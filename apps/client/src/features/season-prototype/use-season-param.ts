// PROTOTYPE — throwaway. `?season=2` / `?season=all`; absent = Current season.
import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ProtoModel, SeasonSelection, currentSeason } from "./fake-seasons";

export function useSeasonParam(model: ProtoModel) {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = currentSeason(model).number;
  const raw = searchParams.get("season");

  let selection: SeasonSelection = current;
  if (raw === "all") selection = "all";
  else if (raw && model.seasons.some((s) => s.number === Number(raw)))
    selection = Number(raw);

  const setSelection = useCallback(
    (next: SeasonSelection) => {
      const params = new URLSearchParams(searchParams);
      if (next === current) params.delete("season");
      else params.set("season", String(next));
      // Rounds are per season, so a stale round would point nowhere.
      params.delete("round");
      setSearchParams(params);
    },
    [searchParams, setSearchParams, current],
  );

  return { selection, setSelection, current };
}
