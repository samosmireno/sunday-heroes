import z from "zod";

export const updateTeamNamesSchema = z.object({
  teamUpdates: z
    .array(
      z.object({
        id: z.string().uuid("Invalid team ID format"),
        name: z
          .string()
          .min(1, "Team name is required")
          .max(30, "Team name too long"),
      })
    )
    .min(1, "At least one team update is required"),
});
