import { PlayerResponse } from "@repo/shared-types";
import { useCompetitionContext } from "../../../context/competition-context";

interface PlayerCardProps {
  matchPlayer: PlayerResponse;
}

export default function PlayerCard({ matchPlayer }: PlayerCardProps) {
  const { competition } = useCompetitionContext();
  const votingEnabled = competition?.votingEnabled ?? false;
  return (
    <div
      className={`absolute z-50 m-2 w-auto whitespace-nowrap rounded-lg border-2 border-gray-300 bg-secondary/90 p-2 text-gray-300 shadow-lg ${
        matchPlayer.isHome ? "translate-x-1/4" : "md:-translate-x-1/4"
      }`}
    >
      <div>
        <b>{matchPlayer.nickname}</b>
      </div>
      <div>
        <div>Goals: {matchPlayer.goals}</div>
        <div>Assists: {matchPlayer.assists}</div>
        {votingEnabled && <div>Rating: {matchPlayer.rating}</div>}
      </div>
    </div>
  );
}
