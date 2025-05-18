import PlayerInfo from "../player/player-info";
import { MatchResponse } from "@repo/logger";
import { getNumPlayersOnField } from "./formations";

interface OnFieldPlayersProps {
  match?: MatchResponse;
  homeTeam: boolean;
  playerFormation: { [key: number]: [number, number] };
  starPlayerId?: string;
  isEdited?: boolean;
}

export default function OnFieldPlayers({
  match,
  homeTeam,
  playerFormation,
  starPlayerId,
  isEdited = false,
}: OnFieldPlayersProps) {
  if (!match || !match.players) {
    return null;
  }
  const numPlayersOnField = getNumPlayersOnField(match.match_type);
  const playersOnField = match.players
    .sort((a, b) => a.position - b.position)
    .filter((player) => player.isHome === homeTeam)
    .slice(0, numPlayersOnField);

  return (
    <>
      {playersOnField &&
        playersOnField.map((matchPlayer, index) => (
          <PlayerInfo
            key={matchPlayer.id}
            matchPlayer={matchPlayer}
            position={
              playerFormation && playerFormation[index]
                ? homeTeam === true
                  ? playerFormation[index]
                  : [100 - playerFormation[index][0], playerFormation[index][1]]
                : undefined
            }
            isOnPitch={true}
            starPlayer={starPlayerId}
            isEdited={isEdited}
          />
        ))}
    </>
  );
}
