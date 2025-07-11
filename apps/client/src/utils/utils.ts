import {
  PartialAddDuelFormValues,
  MatchType,
  MatchResponse,
} from "@repo/shared-types";
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

export function formatErrorStack(stack?: string): string {
  if (!stack) return "No stack trace available";

  const lines = stack.split("\n");
  const formattedLines = lines
    .filter((line) => line.trim()) // Remove empty lines
    .map((line) => {
      // Extract function name and file path
      const match = line.match(/^(.+?)@(.+?)$/);
      if (!match) return line;

      const [, functionName, fullPath] = match;

      // Clean up function name
      const cleanFunctionName = functionName.trim() || "anonymous";

      // Extract meaningful file path (remove localhost and node_modules noise)
      let cleanPath = fullPath;

      // Remove localhost prefix
      cleanPath = cleanPath.replace(/^https?:\/\/localhost:\d+\//, "");

      // Simplify node_modules paths
      if (cleanPath.includes("node_modules")) {
        const nodeModulesMatch = cleanPath.match(/node_modules\/([^\/]+)/);
        if (nodeModulesMatch) {
          cleanPath = `node_modules/${nodeModulesMatch[1]}`;
        }
      }

      // Extract line and column numbers
      const lineColMatch = cleanPath.match(/:(\d+):(\d+)$/);
      let lineCol = "";
      if (lineColMatch) {
        lineCol = `:${lineColMatch[1]}:${lineColMatch[2]}`;
        cleanPath = cleanPath.replace(/:(\d+):(\d+)$/, "");
      }

      // Remove query parameters and hash
      cleanPath = cleanPath.replace(/\?.*$/, "").replace(/#.*$/, "");

      return `  ${cleanFunctionName}\n    at ${cleanPath}${lineCol}`;
    })
    .slice(0, 10); // Limit to first 10 stack frames

  return formattedLines.join("\n");
}

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
      is_completed: false,
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
    is_completed: false,
  };
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

export const formatDate = (date: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  };
  return new Date(date).toLocaleString("en-US", options);
};
