import { z } from "zod";
import { CompetitionType, MatchType } from "@repo/shared-types";
import { createStepSchema } from "../multi-step-form/utils";

const MIN_PLAYERS_PER_TEAM = 4;
const MIN_NAME_LENGTH = 2;

const baseMatchSchema = z.object({
  date: z.coerce.date().optional(),
  homeTeamScore: z.coerce
    .number({
      invalid_type_error: "Required",
    })
    .min(0),
  awayTeamScore: z.coerce
    .number({
      invalid_type_error: "Required",
    })
    .min(0),
  matchType: z.nativeEnum(MatchType),
  hasPenalties: z.boolean().default(false),
  penaltyHomeScore: z.coerce.number().min(0).optional(),
  penaltyAwayScore: z.coerce.number().min(0).optional(),
});

const playersSchema = z.object({
  homePlayers: z
    .array(
      z.string().min(MIN_NAME_LENGTH, {
        message: "Name must be longer than two characters",
      }),
    )
    .min(4, { message: "Minimum of four players is required" }),
  awayPlayers: z
    .array(
      z.string().min(MIN_NAME_LENGTH, {
        message: "Name must be longer than two characters",
      }),
    )
    .min(MIN_PLAYERS_PER_TEAM, {
      message: "Minimum of four players is required",
    }),
});

const matchPlayersSchema = z.object({
  players: z.array(
    z.object({
      nickname: z.string(),
      goals: z.coerce
        .number({
          invalid_type_error: "Required",
        })
        .min(0)
        .default(0),
      assists: z.coerce
        .number({
          invalid_type_error: "Required",
        })
        .min(0)
        .default(0),
      position: z.coerce.number().min(0),
    }),
  ),
});

const teamsSchema = z.object({
  homeTeam: z.string().min(MIN_NAME_LENGTH, "Home team name is required"),
  awayTeam: z.string().min(MIN_NAME_LENGTH, "Away team name is required"),
});

export const AddDuelFormSchema = createStepSchema({
  match: baseMatchSchema,
  players: playersSchema,
  matchPlayers: matchPlayersSchema,
});

export const AddLeagueFormSchema = createStepSchema({
  match: teamsSchema.extend(baseMatchSchema.shape),
  players: playersSchema,
  matchPlayers: matchPlayersSchema,
});

export const AddKnockoutFormSchema = createStepSchema({
  match: teamsSchema.extend(baseMatchSchema.shape),
  players: playersSchema,
  matchPlayers: matchPlayersSchema,
});

export type CompetitionPlayersData = z.infer<typeof playersSchema>;
export type MatchPlayersData = z.infer<typeof matchPlayersSchema>;

export type DuelFormData = z.infer<typeof AddDuelFormSchema>;
export type PartialDuelFormData = Partial<DuelFormData>;
export type LeagueFormData = z.infer<typeof AddLeagueFormSchema>;
export type KnockoutFormData = z.infer<typeof AddKnockoutFormSchema>;

export type MatchFormData = DuelFormData | LeagueFormData | KnockoutFormData;

export type MatchSchema =
  | typeof AddDuelFormSchema
  | typeof AddLeagueFormSchema
  | typeof AddKnockoutFormSchema;

const createTeamStatsValidation = (schema: MatchSchema) => {
  return schema.refine(
    (data: MatchFormData) => {
      const { match, matchPlayers, players } = data;
      const playerStats = matchPlayers?.players || [];
      const homePlayersCount = players?.homePlayers?.length || 0;

      const homeStats = playerStats.slice(0, homePlayersCount).reduce(
        (acc, player) => ({
          goals: acc.goals + (player.goals || 0),
          assists: acc.assists + (player.assists || 0),
        }),
        { goals: 0, assists: 0 },
      );

      const awayStats = playerStats.slice(homePlayersCount).reduce(
        (acc, player) => ({
          goals: acc.goals + (player.goals || 0),
          assists: acc.assists + (player.assists || 0),
        }),
        { goals: 0, assists: 0 },
      );

      return (
        homeStats.goals <= (match.homeTeamScore || 0) &&
        awayStats.goals <= (match.awayTeamScore || 0) &&
        homeStats.assists <= (match.homeTeamScore || 0) &&
        awayStats.assists <= (match.awayTeamScore || 0)
      );
    },
    {
      message: "Player stats cannot exceed team totals",
      path: ["matchPlayers"],
    },
  );
};

export const createMatchFormSchema = (competitionType: CompetitionType) => {
  switch (competitionType) {
    case CompetitionType.DUEL:
      return createTeamStatsValidation(AddDuelFormSchema);
    case CompetitionType.LEAGUE:
      return createTeamStatsValidation(AddLeagueFormSchema);
    case CompetitionType.KNOCKOUT:
      return createTeamStatsValidation(AddKnockoutFormSchema);
    default:
      throw new Error(`Unsupported competition type: ${competitionType}`);
  }
};
