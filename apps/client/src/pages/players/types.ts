import { playerTabs } from "./constants";

export type PlayerTabsType = (typeof playerTabs)[keyof typeof playerTabs];
