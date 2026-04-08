import { z } from "zod";

export const createInvitationSchema = z.object({
  dashboardPlayerId: z.string().uuid(),
  email: z.string().email().optional(),
  expirationHours: z.number().positive().max(720).optional(),
});

export type CreateInvitationRequest = z.infer<typeof createInvitationSchema>;
