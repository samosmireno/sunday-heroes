import { z } from "zod";
import { CompetitionType, MatchType } from "@repo/shared-types";
import { createStepSchema } from "../multi-step-form/utils";

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
  hasPenalties: z.boolean(),
  penaltyHomeScore: z.coerce.number().min(0).optional(),
  penaltyAwayScore: z.coerce.number().min(0).optional(),
});

const playersSchema = z.object({
  homePlayers: z
    .array(
      z.string().min(2, { message: "Name must be longer than two characters" }),
    )
    .min(4, { message: "Minimum of four players is required" }),
  awayPlayers: z
    .array(
      z.string().min(2, { message: "Name must be longer than two characters" }),
    )
    .min(4, { message: "Minimum of four players is required" }),
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
  homeTeam: z.string().min(1, "Home team name is required"),
  awayTeam: z.string().min(1, "Away team name is required"),
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

const createTeamStatsValidation = (schema: typeof AddDuelFormSchema) => {
  return schema.refine(
    (data: DuelFormData) => {
      const match = data.match;
      const players = data.matchPlayers?.players || [];
      const homePlayers = data.players?.homePlayers || [];

      const homePlayerGoals = players
        .slice(0, homePlayers.length)
        .reduce((sum: number, player: any) => sum + (player.goals || 0), 0);

      const homePlayerAssists = players
        .slice(0, homePlayers.length)
        .reduce((sum: number, player: any) => sum + (player.assists || 0), 0);

      const awayPlayerGoals = players
        .slice(homePlayers.length)
        .reduce((sum: number, player: any) => sum + (player.goals || 0), 0);

      const awayPlayerAssists = players
        .slice(homePlayers.length)
        .reduce((sum: number, player: any) => sum + (player.assists || 0), 0);

      const homeGoalsValid = homePlayerGoals <= (match.homeTeamScore || 0);
      const awayGoalsValid = awayPlayerGoals <= (match.awayTeamScore || 0);

      const homeAssistsValid = homePlayerAssists <= (match.homeTeamScore || 0);
      const awayAssistsValid = awayPlayerAssists <= (match.awayTeamScore || 0);

      return (
        homeGoalsValid && awayGoalsValid && homeAssistsValid && awayAssistsValid
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
      return AddLeagueFormSchema;
    case CompetitionType.KNOCKOUT:
      return AddKnockoutFormSchema;
    default:
      throw new Error(`Unsupported competition type: ${competitionType}`);
  }
};
