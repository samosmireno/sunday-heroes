// PROTOTYPE — throwaway. Three variants of the season selector on the
// existing /competition/:competitionId route, switchable via ?variant=.
import { CompetitionResponse, CompetitionType } from "@repo/shared-types";
import PrototypeSwitcher, { usePrototypeVariant } from "@/components/prototype/prototype-switcher";
import { useProtoModel } from "./use-proto-model";
import { VARIANTS, VARIANT_PAGES } from "./variants";

export default function SeasonPrototypePage({ competition, hasSidebar }: { competition: CompetitionResponse; hasSidebar: boolean }) {
  const { model, extra } = useProtoModel(competition);
  const variant = usePrototypeVariant(VARIANTS);
  const pages = VARIANT_PAGES[variant.key];
  const Page = model.type === CompetitionType.LEAGUE ? pages.League : pages.Duel;
  return (
    <>
      <Page model={model} hasSidebar={hasSidebar} />
      <PrototypeSwitcher variants={VARIANTS} current={variant.key} extra={extra} />
    </>
  );
}
