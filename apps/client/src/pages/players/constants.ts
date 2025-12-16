export const playerTabs = {
  PLAYED_WITH: "played-with",
  ADMIN: "admin",
} as const;

export const filterOptions = [
  {
    value: playerTabs.PLAYED_WITH,
    label: "Played With",
  },
  {
    value: playerTabs.ADMIN,
    label: "Managed",
  },
];
