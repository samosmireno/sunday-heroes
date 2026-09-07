/**
 * PROTOTYPE — throwaway. Issue #37: what a player who cannot vote yet sees.
 *
 * Three variants of the three voting surfaces, switchable via `?variant=` on
 * `/prototype/ineligible-voter`. The dev database is production and holds no
 * League with a Voting threshold, so every state here is fabricated in
 * `features/voting/prototype-ineligible-voter/prototype-data.ts`.
 */
import { useSearchParams } from "react-router-dom";
import Header from "@/components/ui/header";
import PrototypeSwitcher from "@/components/prototype-switcher";
import * as A from "@/features/voting/prototype-ineligible-voter/variant-a";
import * as B from "@/features/voting/prototype-ineligible-voter/variant-b";
import * as C from "@/features/voting/prototype-ineligible-voter/variant-c";
import { SurfacePanel } from "@/features/voting/prototype-ineligible-voter/shell";
import {
  COMPETITION,
  THRESHOLD,
  VIEWER,
} from "@/features/voting/prototype-ineligible-voter/prototype-data";

const VARIANTS = { A, B, C };
const KEYS = Object.keys(VARIANTS);
const NAMES = Object.fromEntries(
  Object.entries(VARIANTS).map(([k, v]) => [k, v.name]),
);

export default function PrototypeIneligibleVoterPage() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("variant") ?? "A";
  const variant = VARIANTS[key as keyof typeof VARIANTS] ?? A;

  return (
    <div className="min-h-screen flex-1 bg-bg p-6 pb-32">
      <Header
        title={`Prototype — ${key} · ${variant.name}`}
        subtitle={`${COMPETITION.name} · threshold ${THRESHOLD} matches in one season · ${VIEWER.nickname} has played ${VIEWER.playedThisSeason} in Season ${VIEWER.currentSeason} and ${VIEWER.playedLastSeason} in Season ${VIEWER.currentSeason - 1}`}
        hasSidebar={false}
      />

      <SurfacePanel
        index={1}
        surface="Vote page"
        eyes={`/vote/:matchId — as ${VIEWER.nickname}, who played this match but cannot cast`}
      >
        <variant.VotePage />
      </SurfacePanel>

      <SurfacePanel
        index={2}
        surface="Matches list"
        eyes={`/matches — as ${VIEWER.nickname}; the top two are open for voting and he played both`}
      >
        <variant.MatchesList />
      </SurfacePanel>

      <SurfacePanel
        index={3}
        surface="Pending votes"
        eyes="/pending/:matchId — as the ADMIN, who may vote on a player's behalf"
      >
        <variant.PendingVotes />
      </SurfacePanel>

      <PrototypeSwitcher variants={KEYS} names={NAMES} current={key} />
    </div>
  );
}
