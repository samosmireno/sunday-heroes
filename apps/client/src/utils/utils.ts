import {
  PartialAddDuelFormValues,
  MatchType,
  MatchResponse,
  DashboardResponse,
  DashboardMatchResponse,
  DashboardVoteResponse,
  VotingStatus,
} from "@repo/logger";
import { Team } from "../types/types";

export const capitalizeFirstLetter = (string: string) => {
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const generateRandomId = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 12;
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((byte) => characters[byte % characters.length])
    .join("");
};

const getPositionByPlayerName = (
  formData: PartialAddDuelFormValues,
  playerName: string,
) => {
  let position = 0;

  formData?.matchPlayers?.players?.forEach((player) => {
    if (player.nickname === playerName) {
      position = player.position ?? 1;

      return position;
    }
  });

  return position;
};

export const createFootballFieldMatch = (
  formData: PartialAddDuelFormValues,
): MatchResponse => {
  const matchDate =
    formData.match?.date instanceof Date
      ? formData.match.date
      : new Date(formData.match?.date ?? new Date());

  if (!matchDate.getTime()) {
    return {
      id: generateRandomId(),
      date: new Date().toISOString(),
      players: [],
      home_team_score: 0,
      away_team_score: 0,
      match_type: MatchType.FIVE_A_SIDE,
      round: 0,
      teams: [],
    };
  }

  return {
    id: generateRandomId(),
    date: matchDate.toISOString(),
    players: [
      ...((formData.players?.homePlayers ?? []).map(
        (player: string, index: number) => ({
          id: generateRandomId(),
          matchId: generateRandomId(),
          nickname: player,
          goals: 0,
          assists: 0,
          rating: 0,
          position:
            getPositionByPlayerName(formData, player) === 0
              ? index + 1
              : getPositionByPlayerName(formData, player),

          isHome: true,
          team: Team.HOME,
        }),
      ) ?? []),
      ...((formData.players?.awayPlayers ?? []).map(
        (player: string, index: number) => ({
          id: generateRandomId(),
          matchId: generateRandomId(),
          nickname: player,
          goals: 0,
          assists: 0,
          rating: 0,
          position:
            getPositionByPlayerName(formData, player) === 0
              ? index + 1
              : getPositionByPlayerName(formData, player),
          isHome: false,
          team: Team.AWAY,
        }),
      ) ?? []),
    ],
    home_team_score: 0,
    away_team_score: 0,
    match_type: MatchType.FIVE_A_SIDE,
    round: 0,
    teams: ["Home Team", "Away Team"],
  };
};

const getTotalNumPlayersInMatches = (matches: MatchResponse[]): number => {
  const uniqueNicknames = new Set(
    matches.flatMap((match) => match.players.map((player) => player.nickname)),
  );
  return uniqueNicknames.size;
};

export const getTotalPlayersInDashboard = (
  dashboard: DashboardResponse,
): number => {
  const allMatches = dashboard.competitions.flatMap((comp) => comp.matches);
  return getTotalNumPlayersInMatches(allMatches);
};

export const calculatePendingVotes = (
  matches: DashboardMatchResponse[],
  votes: DashboardVoteResponse[],
): number => {
  const matchesToVote = matches.filter(
    (match) => match.voting_status === VotingStatus.OPEN,
  );
  const numPlayersToVote = matchesToVote.reduce((total, match) => {
    return total + match.match_players;
  }, 0);

  const numVotes =
    votes.filter((vote) => vote.match.voting_status === VotingStatus.OPEN)
      .length / 3; // TODO: 3 represents number of players per vote

  return numPlayersToVote - numVotes;
};

export default function swapItems(
  array: string[],
  index1: number,
  index2: number,
): string[] {
  const newArray = [...array];
  [newArray[index1], newArray[index2]] = [newArray[index2], newArray[index1]];
  return newArray;
}
