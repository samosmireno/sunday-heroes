import PlayerInfo from "../player-info/player-info";
import { MatchResponse } from "@repo/shared-types";
import { getNumPlayersOnField } from "./formations";
import { getPlayerSizeByMatchType } from "./utils";
import { useMemo } from "react";
import { playerIconSizeType } from "../player-info/styles";

interface OffFieldPlayersProps {
  match?: MatchResponse;
  homeTeam: boolean;
  hoverable?: boolean;
}

export default function OffFieldPlayers({
  match,
  homeTeam,
  hoverable = false,
}: OffFieldPlayersProps) {
  const { playersOffField, playerSize } = useMemo(() => {
    if (!match || !match.players) {
      return { playersOnField: [], playerSize: "medium" as playerIconSizeType };
    }

    const numPlayersOnField = getNumPlayersOnField(match.matchType);
    const players = match.players
      .sort((a, b) => a.position - b.position)
      .filter((player) => player.isHome === homeTeam)
      .slice(numPlayersOnField);

    const size = getPlayerSizeByMatchType(match.matchType);

    return { playersOffField: players, playerSize: size };
  }, [match, homeTeam]);

  if (!match || !match.players) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-evenly">
      {playersOffField &&
        playersOffField.map((matchPlayer) => (
          <PlayerInfo
            key={matchPlayer.id}
            matchPlayer={matchPlayer}
            position={[0, 0]}
            size={playerSize}
            isOnPitch={false}
            hoverable={hoverable}
          />
        ))}
    </div>
  );
}
