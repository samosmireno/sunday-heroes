interface PlayerIconProps {
  playerId: string;
  starPlayer: string | null;
  isEdited?: boolean;
  playerPosition: number;
}

export default function PlayerIcon({
  playerId,
  starPlayer,
  isEdited = false,
  playerPosition,
}: PlayerIconProps) {
  return (
    <div className="border-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-solid border-gray-800 bg-gradient-to-b from-white to-gray-200 shadow-md lg:h-8 lg:w-8">
      {!isEdited && <p>{playerPosition}</p>}
      {starPlayer !== null && playerId === starPlayer && (
        <div className="md:scale-70 absolute -translate-y-1/2 md:translate-x-[80%] lg:translate-x-[60%]">
          <i className="fa-solid fa-star text-yellow-400" role="img"></i>
        </div>
      )}
    </div>
  );
}
