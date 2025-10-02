export const playerTabs = {
  ADMIN: "admin",
  PLAYED_WITH: "played-with",
} as const;

export const filterOptions = [
  {
    value: playerTabs.ADMIN,
    label: "Managed",
  },
  {
    value: playerTabs.PLAYED_WITH,
    label: "Played With",
  },
];
