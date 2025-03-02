import { Team, User, MatchType, MatchPlayer, Match } from "@prisma/client";

interface MatchPlayerWithPlayer extends Omit<MatchPlayer,'player'>{
  player: User
}

export interface MatchWithPlayers extends Omit<MatchPlayer,'matchPlayer'>{
  matchPlayer: MatchPlayerWithPlayer
}

/*export interface MatchWithPlayers extends Match {
  players: {
    id: string;
    matchId: number;
    playerId: number;
    goals: number;
    assists: number;
    rating: number;
    position: number;
    team: Team;
    player: {
      id: number;
      name: string;
    };
  }[];
}*/

/*export interface matchPlayer {
  id: number;
  player: Player;
  goals: number;
  assists: number;
  rating: number;
  team: Team;
}

export interface MatchDetail {
  id: number;
  date: string;
  team1: Player[];
  team2: Player[];
  team1Score: number;
  team2Score: number;
}*/

export interface RefreshToken {
  token: string;
  createdAt: number;
}

/*export interface User {
  username: string;
  password: string;
  email: string;
  authType: AuthType;
  "refresh-token": RefreshToken;
}*/

export enum AuthType {
  LOCAL,
  GOOGLE,
}
