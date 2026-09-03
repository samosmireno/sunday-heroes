import { ComponentType } from "react";
import { Role, SeasonFilter, SeasonResponse } from "@repo/shared-types";
import LeagueTable from "@/features/league/league-table";
import LeagueMatchList from "@/features/league/league-match-list";
import LeagueStats from "@/features/league/league-stats";
import { seasonCaption } from "@/features/competition/season-labels";

export interface LeagueTabProps {
  competitionId: string;
  userRole: Role;
  votingEnabled: boolean;
}

export interface LeagueTab {
  value: string;
  label: string;
  shortLabel?: string;
  component: ComponentType<LeagueTabProps>;
  title: string;
  /**
   * Under the card's title, which Season the card shows. Rendered only once
   * the Competition has more than one Season, so a single-season page reads
   * as it always did.
   */
  caption?: (selection: SeasonFilter, seasons: SeasonResponse[]) => string;
}

export const TAB_CONFIG: LeagueTab[] = [
  {
    value: "standings",
    label: "Standings",
    shortLabel: "Table",
    component: LeagueTable,
    title: "League Table",
    caption: seasonCaption,
  },
  {
    value: "fixtures",
    label: "Fixtures",
    component: LeagueMatchList,
    title: "Match Results",
  },
  {
    value: "stats",
    label: "Stats",
    component: LeagueStats,
    title: "Player Stats",
  },
];
