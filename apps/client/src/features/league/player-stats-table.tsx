import { LeaguePlayerTotals } from "@repo/shared-types";
import { DataTable } from "@/components/ui/data-table";
import { createPlayerColumns } from "./columns";

interface PlayerStatsTableProps {
  players: LeaguePlayerTotals[];
  votingEnabled: boolean;
}

export default function PlayerStatsTable({
  players,
  votingEnabled,
}: PlayerStatsTableProps) {
  const columns = createPlayerColumns(votingEnabled);

  return (
    <DataTable
      columns={columns}
      data={players}
      pageSize={10}
      title="Player Statistics"
      description={`${players.length} players • Click column headers to sort`}
    />
  );
}
