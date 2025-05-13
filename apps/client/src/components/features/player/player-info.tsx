import React, { useState } from "react";
import { PlayerResponse } from "@repo/logger";
import PlayerCard from "./player-card";
import PlayerIcon from "./player-icon";

interface PlayerInfoProps {
  matchPlayer: PlayerResponse;
  position: [number, number] | undefined;
  isOnPitch: boolean;
  starPlayer?: string;
  isEdited?: boolean;
}

export default function PlayerInfo({
  matchPlayer,
  position,
  isOnPitch,
  starPlayer,
  isEdited = false,
}: PlayerInfoProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const style: React.CSSProperties | undefined =
    isOnPitch && position
      ? {
          top: `${position[1]}%`,
          left: `${position[0]}%`,
        }
      : undefined;

  return (
    <div
      className={`z-10 mx-0 my-1 flex -rotate-90 flex-col items-center hover:z-20 hover:cursor-pointer md:rotate-0 ${
        isOnPitch &&
        "absolute -translate-x-[55%] -translate-y-1/2 md:-translate-y-1/4"
      }`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <PlayerIcon
        playerId={matchPlayer.id}
        starPlayer={starPlayer}
        isEdited={isEdited}
        playerPosition={matchPlayer.position}
      />
      <div
        className="mt-1 hidden max-w-20 overflow-hidden truncate whitespace-nowrap rounded-sm bg-black/50 px-1 text-center text-xs text-white md:inline"
        title={matchPlayer.nickname}
      >
        {matchPlayer.nickname}
      </div>
      {isHovered && !isEdited && <PlayerCard matchPlayer={matchPlayer} />}
    </div>
  );
}
