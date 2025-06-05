import { Request, Response, NextFunction } from "express";
import { InvitationService } from "../services/invitation-service";
import z from "zod";
import { AuthenticatedRequest } from "../types";
import { config } from "../config/config";

const createInvitationSchema = z.object({
  dashboardPlayerId: z.string().uuid(),
  email: z.string().email().optional(),
  expirationHours: z.number().positive().max(720).optional(),
});

export const createInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const validation = createInvitationSchema.safeParse(authenticatedReq.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.errors });
    }

    const userId = authenticatedReq.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = await InvitationService.createInvitation({
      ...validation.data,
      invitedById: userId,
    });
    res.status(201).json({
      success: true,
      token,
      inviteUrl: `${config.client}/invite/${token}`,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const validateInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const invitation = await InvitationService.validateInvitation(
      req.params.token
    );
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    res.json(invitation);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "An error occurred",
    });
  }
};

export const acceptInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { token } = req.params;
    const userId = authenticatedReq.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await InvitationService.acceptInvitation(token, userId);
    res.json({ success: true, message: "Invitation accepted successfully" });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "An error occurred",
    });
  }
};
