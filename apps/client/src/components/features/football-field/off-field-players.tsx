import PlayerInfo from "../player/player-info";
import { MatchResponse } from "@repo/logger";
import { getNumPlayersOnField } from "./formations";

interface OffFieldPlayersProps {
  match: MatchResponse | null;
  homeTeam: boolean;
  starPlayerId?: string;
  isEdited?: boolean;
}

export default function OffFieldPlayers({
  match,
  homeTeam,
  starPlayerId,
  isEdited = false,
}: OffFieldPlayersProps) {
  if (!match || !match.players) {
    return null;
  }

  const numPlayersOnField = getNumPlayersOnField(match.match_type);
  const playersOffField = match.players
    .sort((a, b) => a.position - b.position)
    .filter((player) => player.isHome === homeTeam)
    .slice(numPlayersOnField);

  return (
    <div className="flex flex-wrap items-center justify-evenly">
      {playersOffField &&
        playersOffField.map((matchPlayer) => (
          <PlayerInfo
            key={matchPlayer.id}
            matchPlayer={matchPlayer}
            position={[0, 0]}
            isOnPitch={false}
            starPlayer={starPlayerId}
            isEdited={isEdited}
          />
        ))}
    </div>
  );
}
