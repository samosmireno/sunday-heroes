import { useParams } from "react-router-dom";
import { useCompetition } from "../features/competition/use-competition";
import ErrorPage from "./error-page";
import Loading from "@/components/ui/loading";
import { CompetitionProvider } from "../context/competition-context";
import DuelCompetitionPage from "./duel-competition-page";
import { CompetitionType } from "@repo/shared-types";
import { useAuth } from "@/context/auth-context";
import LeagueCompetitionPage from "./league-competition/league-competition-page";
import CompetitionAdminPageSkeleton from "@/features/competition-admin/competition-admin-page-skeleton";
import { useCompetitionInfo } from "@/features/competition/use-competition-info";
import { useSeasonParam } from "@/features/competition/use-season-param";
import { seasonPageShell } from "@/features/competition/season-page-shell";
import PastSeasonBanner from "@/features/competition/past-season-banner";

function CompetitionPage() {
  const { user } = useAuth();
  const { competitionId } = useParams<{ competitionId: string }>() as {
    competitionId: string;
  };
  const { competition: info, isLoading: isInfoLoading } = useCompetitionInfo(
    competitionId,
    user?.id,
  );
  const seasonSelection = useSeasonParam(info?.seasons);
  const { setSelection, ...seasonState } = seasonSelection;
  const { selectedSeason, current, isPast } = seasonState;
  const { competition, isLoading, refetch } = useCompetition(
    competitionId,
    user?.id,
    seasonState.season,
    { enabled: seasonState.resolved },
  );

  const renderCompetitionPage = () => {
    if (!competition) {
      return <p>No competition data available.</p>;
    }

    switch (competition.type) {
      case CompetitionType.DUEL:
        return (
          <DuelCompetitionPage competition={competition} refetch={refetch} />
        );
      case CompetitionType.LEAGUE:
        return <LeagueCompetitionPage competition={competition} />;
      case CompetitionType.KNOCKOUT:
        return <p>Knockout</p>;
      default:
        return <p>Unknown status.</p>;
    }
  };

  const { header, settling } = seasonPageShell(seasonSelection, {
    title: info?.name ?? competition?.name,
    hasSidebar: !!user,
    isInfoLoading,
  });

  // The read has nothing yet, and that is no error while the page settles.
  if (isLoading || (!competition && settling)) {
    // A season switch keeps the header and its selector in place.
    if (!info) {
      return <CompetitionAdminPageSkeleton />;
    }
    return (
      <div className="flex-1 p-6">
        {header}
        <Loading text="Loading matches..." />
      </div>
    );
  }

  if (!competition || !competitionId) {
    return <ErrorPage />;
  }

  return (
    <CompetitionProvider
      value={{ competition, isLoading, refetch, ...seasonState }}
    >
      <div className="flex-1 p-6">
        {header}
        {isPast && selectedSeason && current !== undefined && (
          <PastSeasonBanner
            season={selectedSeason}
            current={current}
            onBack={() => setSelection(current)}
          />
        )}
        {renderCompetitionPage()}
      </div>
    </CompetitionProvider>
  );
}

export default CompetitionPage;
