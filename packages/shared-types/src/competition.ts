import { CompetitionType, Role } from "./enums";
import { MatchResponse } from "./match";
import { PlayerTotals } from "./player";
import { CurrentSeasonResponse, SeasonResponse } from "./season";

export type CompetitionInfo = {
  id: string;
  name: string;
  type: CompetitionType;
  votingEnabled: boolean;
  /** PLAYER when the read is made without a user. */
  userRole: Role;
  /** Ascending by number. */
  seasons: SeasonResponse[];
};

export type CompetitionSettings = {
  id: string;
  name: string;
  type: CompetitionType;
  votingEnabled: boolean;
  userRole: Role;
  moderators: {
    id: string;
    nickname: string;
  }[];
  currentSeason: CurrentSeasonResponse;
  /** Ascending by number. */
  seasons: SeasonResponse[];
};

export type CompetitionWithTeams = {
  id: string;
  name: string;
  type: CompetitionType;
  votingEnabled: boolean;
  teams: {
    id: string;
    name: string;
  }[];
};

export type CompetitionResponse = {
  id: string;
  name: string;
  type: CompetitionType;
  userRole: Role;
  votingEnabled: boolean;
  matches: MatchResponse[];
  playerStats: PlayerTotals[];
};

export type DetailedCompetitionResponse = {
  id: string;
  userRole: Role;
  name: string;
  type: CompetitionType;
  teams: number;
  players: number;
  matches: number;
  votingEnabled: boolean;
  pendingVotes?: number;
};

export type CompetitionVotingData = {
  id: string;
  name: string;
  pendingVotesCount: number;
  closedVotesCount: number;
};
