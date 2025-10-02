import { CompetitionType } from "@repo/shared-types";

export const filterOptions = [
  { value: null, label: "All" },
  {
    value: CompetitionType.LEAGUE,
    label: "Leagues",
    color: "border-league-500 bg-league-700/20 text-league-400",
  },
  {
    value: CompetitionType.DUEL,
    label: "Duels",
    color: "border-duel-500 bg-duel-700/20 text-duel-400",
  },
  // {
  //   value: CompetitionType.KNOCKOUT,
  //   label: "Knockouts",
  //   color: "border-knockout-500 bg-knockout-700/20 text-knockout-400",
  // },
];
