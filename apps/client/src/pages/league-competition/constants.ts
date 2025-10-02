import LeagueTable from "@/features/league/league-table";
import LeagueMatchList from "@/features/league/league-match-list";
import LeagueStats from "@/features/league/league-stats";

export const TAB_CONFIG = [
  {
    value: "standings",
    label: "Standings",
    shortLabel: "Table",
    component: LeagueTable,
    title: "League Table",
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
