export const playerTabs = {
  ADMIN: "admin",
  PLAYED_WITH: "played-with",
} as const;

export type PlayerTabsType = (typeof playerTabs)[keyof typeof playerTabs];
