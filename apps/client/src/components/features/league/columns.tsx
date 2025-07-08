import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";
import { LeaguePlayerTotals, CompetitionResponse } from "@repo/shared-types";

const columnHelper = createColumnHelper<LeaguePlayerTotals>();

export const createPlayerColumns = (
  competition: CompetitionResponse,
): ColumnDef<LeaguePlayerTotals, any>[] => [
  columnHelper.accessor("nickname", {
    header: "Player",
    cell: ({ row }) => {
      const player = row.original;
      return (
        <div className="px-4 py-3">
          <div className="flex items-center">
            <div className="text-sm font-medium text-white">
              {player.nickname}
            </div>
          </div>
        </div>
      );
    },
    enableSorting: false,
  }),

  columnHelper.accessor("teamName", {
    header: "Team",
    cell: ({ getValue }) => (
      <div className="px-4 py-3">
        <span className="text-sm text-gray-300">{getValue()}</span>
      </div>
    ),
    enableSorting: false,
  }),

  columnHelper.accessor("matches", {
    header: "Matches",
    cell: ({ getValue }) => (
      <div className="px-4 py-3 text-center text-sm text-gray-300">
        {getValue() || 0}
      </div>
    ),
  }),

  columnHelper.accessor("goals", {
    header: "Goals",
    cell: ({ getValue }) => (
      <div className="px-4 py-3 text-center">
        <span className="text-sm font-bold text-green-400">
          {getValue() || 0}
        </span>
      </div>
    ),
  }),

  columnHelper.accessor("assists", {
    header: "Assists",
    cell: ({ getValue }) => (
      <div className="px-4 py-3 text-center">
        <span className="text-sm font-bold text-purple-400">
          {getValue() || 0}
        </span>
      </div>
    ),
  }),

  columnHelper.display({
    id: "goalsPerMatch",
    header: "G/M",
    cell: ({ row }) => {
      const player = row.original;
      const goalsPerMatch = player.matches
        ? (player.goals / player.matches).toFixed(1)
        : "0.0";
      return (
        <div className="px-4 py-3 text-center text-sm text-gray-300">
          {goalsPerMatch}
        </div>
      );
    },
    enableSorting: false,
  }),

  columnHelper.display({
    id: "assistsPerMatch",
    header: "A/M",
    cell: ({ row }) => {
      const player = row.original;
      const assistsPerMatch = player.matches
        ? (player.assists / player.matches).toFixed(1)
        : "0.0";
      return (
        <div className="px-4 py-3 text-center text-sm text-gray-300">
          {assistsPerMatch}
        </div>
      );
    },
    enableSorting: false,
  }),

  ...(competition.votingEnabled
    ? [
        columnHelper.accessor("rating", {
          header: "Rating",
          cell: ({ getValue }) => {
            const rating = getValue();
            return (
              <div className="px-4 py-3 text-center">
                {rating ? (
                  <div className="flex items-center justify-center">
                    <Star className="mr-1 h-3 w-3 text-accent" />
                    <span className="text-sm font-bold text-accent">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </div>
            );
          },
        }),
      ]
    : []),
];
