import { MatchResponse, MatchType, Team } from "@repo/shared-types";
import { MatchPlayersData, PartialDuelFormData } from "./add-match-schemas";

export function swapMatchPlayers(
  matchPlayers: MatchPlayersData,
  activeId: string,
  overId: string,
) {
  if (!matchPlayers?.players) return null;

  const newMatchPlayers = structuredClone(matchPlayers);
  const oldIndex = newMatchPlayers.players.findIndex(
    (player) => player?.nickname === activeId,
  );
  const newIndex = newMatchPlayers.players.findIndex(
    (player) => player?.nickname === overId,
  );

  if (oldIndex === -1 || newIndex === -1) return null;

  const oldPosition = newMatchPlayers.players[oldIndex].position;
  const newPosition = newMatchPlayers.players[newIndex].position;

  [newMatchPlayers.players[oldIndex], newMatchPlayers.players[newIndex]] = [
    newMatchPlayers.players[newIndex],
    newMatchPlayers.players[oldIndex],
  ];

  newMatchPlayers.players[oldIndex].position = oldPosition;
  newMatchPlayers.players[newIndex].position = newPosition;

  return newMatchPlayers;
}

const generateRandomId = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 12;
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((byte) => characters[byte % characters.length])
    .join("");
};

const getPositionByPlayerName = (
  formData: PartialDuelFormData,
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
  formData: PartialDuelFormData,
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
      homeTeamScore: 0,
      awayTeamScore: 0,
      matchType: MatchType.FIVE_A_SIDE,
      round: 0,
      teams: [],
      isCompleted: false,
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
    homeTeamScore: 0,
    awayTeamScore: 0,
    matchType: MatchType.FIVE_A_SIDE,
    round: 0,
    teams: ["Home Team", "Away Team"],
    isCompleted: false,
  };
};

export function swapItems(
  array: string[],
  index1: number,
  index2: number,
): string[] {
  const newArray = [...array];
  [newArray[index1], newArray[index2]] = [newArray[index2], newArray[index1]];
  return newArray;
}
