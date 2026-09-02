// PROTOTYPE — throwaway. The per-competition All Matches page with the
// season filter, on the existing /matches/:competitionId route.
import { useAuth } from "@/context/auth-context";
import { useCompetition } from "@/features/competition/use-competition";
import MatchesPageSkeleton from "@/features/matches/matches-page-skeleton";
import PrototypeSwitcher, { usePrototypeVariant } from "@/components/prototype/prototype-switcher";
import ErrorPage from "@/pages/error-page";
import { useProtoModel } from "./use-proto-model";
import { VARIANTS, VARIANT_PAGES } from "./variants";

function Inner({ competition }: { competition: NonNullable<ReturnType<typeof useCompetition>["competition"]> }) {
  const { model, extra } = useProtoModel(competition);
  const variant = usePrototypeVariant(VARIANTS);
  const Page = VARIANT_PAGES[variant.key].Matches;
  return (
    <>
      <Page model={model} hasSidebar={true} />
      <PrototypeSwitcher variants={VARIANTS} current={variant.key} extra={extra} />
    </>
  );
}

export default function MatchesPrototypePage({ competitionId }: { competitionId: string }) {
  const { user } = useAuth();
  const { competition, isLoading } = useCompetition(competitionId, user?.id);
  if (isLoading) return <MatchesPageSkeleton />;
  if (!competition) return <ErrorPage />;
  return <Inner competition={competition} />;
}
