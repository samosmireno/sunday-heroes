import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { LeaguePlayerTotals } from "@repo/shared-types";

const columnHelper = createColumnHelper<LeaguePlayerTotals>();

export const createPlayerColumns = (
  votingEnabled: boolean,
): ColumnDef<LeaguePlayerTotals, any>[] => [
  columnHelper.accessor("nickname", {
    header: "Player",
    cell: ({ row }) => {
      const player = row.original;
      return (
        <div className="px-2 py-3 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white sm:text-base">
                {player.nickname}
              </div>
              <div className="truncate text-xs text-gray-400 sm:hidden">
                {player.teamName}
              </div>
            </div>
          </div>
        </div>
      );
    },
    enableSorting: false,
    minSize: 120,
    size: 160,
  }),

  columnHelper.accessor("teamName", {
    header: () => (
      <div className="hidden sm:flex sm:items-center sm:justify-start">
        <span className="text-xs sm:text-sm">Team</span>
      </div>
    ),
    cell: ({ getValue }) => (
      <div className="hidden px-2 py-3 sm:table-cell sm:px-4">
        <span className="truncate text-sm text-gray-300 sm:text-base">
          {getValue()}
        </span>
      </div>
    ),
    enableSorting: false,
    minSize: 100,
    size: 140,
  }),

  columnHelper.accessor("matches", {
    header: () => (
      <div className="flex items-center justify-center">
        <span className="text-xs sm:text-sm">
          <span className="sm:hidden">M</span>
          <span className="hidden sm:inline">Matches</span>
        </span>
      </div>
    ),
    cell: ({ getValue }) => (
      <div className="px-1 py-3 text-center sm:px-2">
        <span className="text-xs font-medium text-gray-300 sm:text-sm">
          {getValue() || 0}
        </span>
      </div>
    ),
    minSize: 60,
    size: 80,
  }),

  columnHelper.accessor("goals", {
    header: () => (
      <div className="flex items-center justify-center">
        <span className="text-xs sm:text-sm">
          <span className="sm:hidden">G</span>
          <span className="hidden sm:inline">Goals</span>
        </span>
      </div>
    ),
    cell: ({ getValue }) => (
      <div className="px-1 py-3 text-center sm:px-2">
        <span className="text-sm font-bold text-green-400 sm:text-base">
          {getValue() || 0}
        </span>
      </div>
    ),
    minSize: 60,
    size: 80,
  }),

  columnHelper.accessor("assists", {
    header: () => (
      <div className="flex items-center justify-center">
        <span className="text-xs sm:text-sm">
          <span className="sm:hidden">A</span>
          <span className="hidden sm:inline">Assists</span>
        </span>
      </div>
    ),
    cell: ({ getValue }) => (
      <div className="px-1 py-3 text-center sm:px-2">
        <span className="text-sm font-bold text-purple-400 sm:text-base">
          {getValue() || 0}
        </span>
      </div>
    ),
    minSize: 60,
    size: 80,
  }),

  columnHelper.display({
    id: "goalsPerMatch",
    header: () => (
      <div className="hidden md:flex md:items-center md:justify-start">
        <span className="text-xs md:text-sm">G/M</span>
      </div>
    ),
    cell: ({ row }) => {
      const player = row.original;
      const goalsPerMatch = player.matches
        ? (player.goals / player.matches).toFixed(1)
        : "0.0";
      return (
        <div className="hidden px-1 py-3 text-center md:table-cell md:px-2 lg:table-cell">
          <span className="text-xs text-gray-300 md:text-sm">
            {goalsPerMatch}
          </span>
        </div>
      );
    },
    enableSorting: false,
    minSize: 50,
    size: 70,
  }),

  columnHelper.display({
    id: "assistsPerMatch",
    header: () => (
      <div className="hidden md:flex md:items-center md:justify-start">
        <span className="text-xs md:text-sm">A/M</span>
      </div>
    ),
    cell: ({ row }) => {
      const player = row.original;
      const assistsPerMatch = player.matches
        ? (player.assists / player.matches).toFixed(1)
        : "0.0";
      return (
        <div className="hidden px-1 py-3 text-center md:table-cell md:px-2 lg:table-cell">
          <span className="text-xs text-gray-300 md:text-sm">
            {assistsPerMatch}
          </span>
        </div>
      );
    },
    enableSorting: false,
    minSize: 50,
    size: 70,
  }),

  ...(votingEnabled
    ? [
        columnHelper.accessor("rating", {
          header: () => (
            <div className="flex items-center justify-center">
              <span className="text-xs sm:text-sm">
                <span className="sm:hidden">R</span>
                <span className="hidden sm:inline">Rating</span>
              </span>
            </div>
          ),
          cell: ({ getValue }) => {
            const rating = getValue();
            return (
              <div className="px-1 py-3 text-center sm:px-2">
                {rating ? (
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-bold text-accent sm:text-base">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 sm:text-sm">-</span>
                )}
              </div>
            );
          },
          minSize: 70,
          size: 90,
        }),
      ]
    : []),
];
