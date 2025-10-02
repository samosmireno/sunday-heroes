import { useState, useMemo, useCallback } from "react";
import { PlayerTotals } from "@repo/shared-types";

export const useSortPlayers = (
  playersStats: PlayerTotals[],
  initialSortKey: keyof PlayerTotals,
  initialSortOrder: "asc" | "desc",
) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [sortColumn, setSortColumn] =
    useState<keyof PlayerTotals>(initialSortKey);

  const sortedPlayers = useMemo(() => {
    const sorted = [...playersStats];
    const orderMultiplier = sortOrder === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (aValue !== undefined && bValue !== undefined) {
        if (aValue > bValue) return 1 * orderMultiplier;
        if (aValue < bValue) return -1 * orderMultiplier;
      }
      return 0;
    });
    return sorted;
  }, [playersStats, sortColumn, sortOrder]);

  const sortPlayers = useCallback(
    (key: keyof PlayerTotals) => {
      if (sortColumn === key) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortColumn(key);
        setSortOrder("asc");
      }
    },
    [sortColumn],
  );

  return { sortedPlayers, sortOrder, sortColumn, sortPlayers };
};
