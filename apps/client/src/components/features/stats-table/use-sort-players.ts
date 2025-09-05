import { useState, useEffect, useCallback } from "react";
import { PlayerTotals } from "@repo/shared-types";

export const useSortPlayers = (
  playersStats: PlayerTotals[],
  initialSortKey: keyof PlayerTotals,
  initialSortOrder: "asc" | "desc",
) => {
  const [sortedPlayers, setSortedPlayers] = useState<PlayerTotals[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [sortColumn, setSortColumn] =
    useState<keyof PlayerTotals>(initialSortKey);

  const sortPlayers = useCallback(
    (key: keyof PlayerTotals) => {
      const sorted = [...playersStats];
      const orderMultiplier = sortOrder === "asc" ? 1 : -1;

      sorted.sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        if (aValue !== undefined && bValue !== undefined) {
          if (aValue > bValue) return 1 * orderMultiplier;
          if (aValue < bValue) return -1 * orderMultiplier;
        }
        return 0;
      });

      setSortedPlayers(sorted);
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      setSortColumn(key);
    },
    [playersStats, sortOrder],
  );

  useEffect(() => {
    sortPlayers(initialSortKey);
  }, [playersStats, initialSortKey, sortPlayers]);

  return { sortedPlayers, sortOrder, sortColumn, sortPlayers };
};
