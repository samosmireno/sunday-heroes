import React, { useState } from "react";
import { PlayerResponse } from "@repo/shared-types";
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
      className={`z-10 mx-0 my-1 flex -rotate-90 flex-col items-center hover:z-20 hover:cursor-pointer sm:rotate-0 ${
        isOnPitch &&
        "absolute -translate-x-[55%] -translate-y-1/2 sm:-translate-y-1/4"
      }`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <PlayerIcon
        playerId={matchPlayer.id}
        playerPosition={matchPlayer.position}
        size={isEdited ? "medium" : "large"}
        showPosition={isEdited ? false : true}
        starPlayer={starPlayer}
      />
      <div
        className="mt-1 hidden max-w-20 overflow-hidden truncate whitespace-nowrap rounded-sm bg-black/50 px-1 text-center text-xs text-white sm:inline"
        title={matchPlayer.nickname}
      >
        {matchPlayer.nickname}
      </div>
      {isHovered && !isEdited && <PlayerCard matchPlayer={matchPlayer} />}
    </div>
  );
}
