import { LeaguePlayerTotals, CompetitionResponse } from "@repo/logger";
import { DataTable } from "../../ui/data-table";
import { createPlayerColumns } from "./columns";

interface PlayerStatsTableProps {
  players: LeaguePlayerTotals[];
  competition: CompetitionResponse;
}

export default function PlayerStatsTable({
  players,
  competition,
}: PlayerStatsTableProps) {
  const columns = createPlayerColumns(competition);

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
