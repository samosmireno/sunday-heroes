import { useState, useEffect } from "react";
import { UserTotals } from "../../../types/types";

export const useSortPlayers = (
  playersStats: UserTotals[],
  initialSortKey: keyof UserTotals,
  initialSortOrder: "asc" | "desc",
) => {
  const [sortedPlayers, setSortedPlayers] = useState<UserTotals[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);
  const [sortColumn, setSortColumn] =
    useState<keyof UserTotals>(initialSortKey);

  useEffect(() => {
    sortPlayers(initialSortKey);
  }, [playersStats, initialSortKey]);

  const sortPlayers = (key: keyof UserTotals) => {
    const sorted = [...playersStats];
    const orderMultiplier = sortOrder === "asc" ? 1 : -1;

    sorted.sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === "totalRating") {
        aValue = a.totalRating / a.totalMatches;
        bValue = b.totalRating / b.totalMatches;
      }

      if (aValue > bValue) return 1 * orderMultiplier;
      if (aValue < bValue) return -1 * orderMultiplier;
      return 0;
    });

    setSortedPlayers(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setSortColumn(key);
  };

  return { sortedPlayers, sortOrder, sortColumn, sortPlayers };
};
