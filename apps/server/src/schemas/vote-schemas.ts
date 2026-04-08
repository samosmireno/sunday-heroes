import { z } from "zod";

export const submitVotesSchema = z.object({
  matchId: z.string(),
  voterId: z.string(),
  votes: z
    .array(
      z.object({
        playerId: z.string(),
        points: z.coerce.number().min(1).max(3),
      }),
    )
    .length(3),
});

export type SubmitVotesRequest = z.infer<typeof submitVotesSchema>;
