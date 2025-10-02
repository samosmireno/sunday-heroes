import { useMemo, useState } from "react";
import { PlayerResponse } from "@repo/shared-types";
import PlayerCard from "./player-card";
import PlayerIcon from "./player-icon";
import { playerIconSizeType } from "./styles";

interface PlayerInfoProps {
  matchPlayer: PlayerResponse;
  position: [number, number] | undefined;
  size: playerIconSizeType;
  isOnPitch: boolean;
  hoverable?: boolean;
}

export default function PlayerInfo({
  matchPlayer,
  position,
  size,
  isOnPitch,
  hoverable = false,
}: PlayerInfoProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const computedStyle = useMemo(() => {
    return isOnPitch && position
      ? { top: `${position[1]}%`, left: `${position[0]}%` }
      : undefined;
  }, [isOnPitch, position]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      className={`z-10 mx-0 my-1 flex -rotate-90 flex-col items-center hover:z-20 ${hoverable ? "hover:cursor-pointer" : ""} sm:rotate-0 ${
        isOnPitch &&
        "absolute -translate-x-[55%] -translate-y-1/2 sm:-translate-y-1/4"
      }`}
      style={computedStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <PlayerIcon
        playerPosition={matchPlayer.position}
        size={size}
        showPosition={hoverable}
        manOfTheMatch={matchPlayer.manOfTheMatch}
      />
      <div
        className="mt-1 hidden max-w-20 overflow-hidden truncate whitespace-nowrap rounded-sm bg-black/50 px-1 text-center text-xs text-white sm:inline"
        title={matchPlayer.nickname}
      >
        {matchPlayer.nickname}
      </div>
      {isHovered && hoverable && <PlayerCard matchPlayer={matchPlayer} />}
    </div>
  );
}
