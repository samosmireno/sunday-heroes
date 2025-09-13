import PlayerInfo from "../player/player-info";
import { MatchResponse } from "@repo/shared-types";
import { getNumPlayersOnField } from "./formations";
import { playerIconSizeType } from "../player/styles";
import { useMemo } from "react";
import { getPlayerSizeByMatchType } from "./utils";

interface OnFieldPlayersProps {
  match?: MatchResponse;
  homeTeam: boolean;
  playerFormation: { [key: number]: [number, number] };
  starPlayerId?: string;
  hoverable?: boolean;
}

export default function OnFieldPlayers({
  match,
  homeTeam,
  playerFormation,
  starPlayerId,
  hoverable = false,
}: OnFieldPlayersProps) {
  const { playersOnField, playerSize } = useMemo(() => {
    if (!match || !match.players) {
      return { playersOnField: [], playerSize: "medium" as playerIconSizeType };
    }

    const numPlayersOnField = getNumPlayersOnField(match.matchType);
    const players = match.players
      .sort((a, b) => a.position - b.position)
      .filter((player) => player.isHome === homeTeam)
      .slice(0, numPlayersOnField);

    const size = getPlayerSizeByMatchType(match.matchType);

    return { playersOnField: players, playerSize: size };
  }, [match, homeTeam]);

  if (!match || !match.players) {
    return null;
  }

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
            size={playerSize}
            isOnPitch={true}
            starPlayer={starPlayerId}
            hoverable={hoverable}
          />
        ))}
    </>
  );
}
