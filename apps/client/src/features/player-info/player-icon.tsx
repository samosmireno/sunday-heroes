import { cn } from "@/utils/cn";
import {
  sizeClasses,
  playerIconSizeType,
  playerIconNumberSize,
} from "./styles";
import { Star } from "lucide-react";

interface PlayerIconProps {
  playerPosition: number;
  size: playerIconSizeType;
  showPosition: boolean;
  manOfTheMatch: boolean;
}

export default function PlayerIcon({
  playerPosition,
  size = "medium",
  showPosition = false,
  manOfTheMatch,
}: PlayerIconProps) {
  return (
    <div
      className={cn(
        "border-1 flex items-center justify-center rounded-full border-2 border-solid border-gray-800 bg-accent shadow-md",
        sizeClasses[size],
      )}
    >
      {showPosition && (
        <p className={cn("text-gray-800", playerIconNumberSize[size])}>
          {playerPosition}
        </p>
      )}
      {manOfTheMatch && (
        <Star className="md:scale-70 absolute -translate-y-4 translate-x-2 fill-yellow-600 text-gray-900 md:-translate-y-1/2 md:translate-x-[80%] lg:translate-x-[60%]"></Star>
      )}
    </div>
  );
}
