import { useAuth } from "@/context/auth-context";
import { useCompetitionInfo } from "@/features/competition/use-competition-info";

interface SeasonBeingSetUpProps {
  competitionId: string;
}

/**
 * The Fixtures tab while the Current season has no Fixtures: between Start
 * new season and the admin's Teams setup save. The info read is the one the
 * League router made, so it comes from the cache.
 */
export default function SeasonBeingSetUp({
  competitionId,
}: SeasonBeingSetUpProps) {
  const { user } = useAuth();
  const { competition } = useCompetitionInfo(competitionId, user?.id);
  const currentSeason = competition?.seasons.find(
    (season) => season.endedAt === null,
  );

  return (
    <div className="py-8 text-center text-gray-400">
      <p className="text-lg font-medium text-gray-300">
        {currentSeason
          ? `Season ${currentSeason.number} is being set up`
          : "This season is being set up"}
      </p>
      <p className="mt-1 text-sm">
        Fixtures will appear once the teams have been set up.
      </p>
    </div>
  );
}
