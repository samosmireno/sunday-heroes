import VotePlayerCard from "./vote-player-card";

interface SelectedPlayer {
  id: string;
  rank: number;
}

interface VotePlayer {
  id: string;
  nickname: string;
  isHome: boolean;
  canVoteFor: boolean;
}

interface VotePlayerListProps {
  teamName: string;
  players: VotePlayer[];
  filterFn: (arg1: VotePlayer) => boolean;
  selectedPlayers: SelectedPlayer[];
  onPlayerSelect: (arg1: string) => void;
}

const VotePlayerList = ({
  teamName,
  players,
  filterFn,
  selectedPlayers,
  onPlayerSelect,
}: VotePlayerListProps) => {
  const teamPlayers = players.filter(filterFn);

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-bg/40 p-3">
        <h3 className="mb-2 text-center text-lg font-bold text-accent">
          {teamName}
        </h3>
        <div className="h-0.5 w-full bg-accent/30"></div>
      </div>

      <div className="grid gap-3">
        {teamPlayers.length > 0 ? (
          teamPlayers.map((player) => (
            <VotePlayerCard
              key={player.id}
              player={player}
              isSelected={selectedPlayers.map((p) => p.id).includes(player.id)}
              rank={
                selectedPlayers.find((p) => {
                  return p.id === player.id;
                })?.rank || 0
              }
              onSelect={() => onPlayerSelect(player.id)}
            />
          ))
        ) : (
          <p className="rounded border border-gray-700 bg-bg/20 p-3 text-center text-gray-400">
            No eligible players in this team
          </p>
        )}
      </div>
    </div>
  );
};

export default VotePlayerList;
