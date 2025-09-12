import { cn } from "../../../lib/utils";

interface PlayerIconProps {
  playerId: string;
  playerPosition: number;
  size: "small" | "medium" | "large";
  showPosition: boolean;
  starPlayer?: string;
}

const sizeClasses = {
  small: "h-4 w-4",
  medium: "h-5 w-5 lg:h-6 lg:w-6",
  large: "h-6 w-6 lg:h-8 lg:w-8",
};

export default function PlayerIcon({
  playerId,
  playerPosition,
  size = "medium",
  showPosition = false,
  starPlayer,
}: PlayerIconProps) {
  return (
    <div
      className={cn(
        "border-1 flex items-center justify-center rounded-full border-2 border-solid border-gray-800 bg-accent shadow-md",
        sizeClasses[size],
      )}
    >
      {showPosition && <p className="text-gray-800">{playerPosition}</p>}
      {starPlayer && playerId === starPlayer && (
        <div className="md:scale-70 absolute -translate-y-1/2 md:translate-x-[80%] lg:translate-x-[60%]">
          <i className="fa-solid fa-star text-yellow-600" role="img"></i>
        </div>
      )}
    </div>
  );
}
