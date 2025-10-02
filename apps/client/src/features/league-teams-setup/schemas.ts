import { z } from "zod";

export const createTeamNamesSchema = (numberOfTeams: number = 0) => {
  const teamFields = Array.from({ length: numberOfTeams }, (_, i) => [
    `team${i}`,
    z
      .string()
      .min(1, `Team ${i + 1} name is required`)
      .max(30, "Team name too long"),
  ]);

  return z.object(Object.fromEntries(teamFields));
};

// Example: for 4 teams, use createTeamNamesSchema(4)
export type TeamNamesFormData = z.infer<
  ReturnType<typeof createTeamNamesSchema>
>;
