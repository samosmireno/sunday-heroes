import { PlayerResponse } from "@repo/logger";

interface PlayerCardProps {
  matchPlayer: PlayerResponse;
}

export default function PlayerCard({ matchPlayer }: PlayerCardProps) {
  return (
    <div
      className={`absolute z-50 m-2 w-auto whitespace-nowrap rounded-lg border-2 border-gray-300 bg-white p-2 shadow-lg ${
        matchPlayer.isHome ? "translate-x-1/4" : "-translate-x-1/4"
      }`}
    >
      <div>
        <b>{matchPlayer.nickname}</b>
      </div>
      <div>
        <div>Goals: {matchPlayer.goals}</div>
        <div>Assists: {matchPlayer.assists}</div>
        <div>
          {matchPlayer.votes
            ? (
                matchPlayer.votes.reduce((a, b) => a + b, 0) /
                matchPlayer.votes.length
              ).toFixed(2)
            : "No votes"}
        </div>
      </div>
    </div>
  );
}
