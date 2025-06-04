import { Request, Response, NextFunction } from "express";
import { InvitationService } from "../services/invitation-service";
import { z } from "zod";
import prisma from "../repositories/prisma-client";
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
  } catch (error: any) {
    if (
      error.message.includes("not found") ||
      error.message.includes("permission")
    ) {
      return res.status(404).json({ error: error.message });
    }
    if (
      error.message.includes("already exists") ||
      error.message.includes("already has")
    ) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};

export const validateInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    const invitation = await InvitationService.validateInvitation(token);

    if (!invitation) {
      return res.status(404).json({ error: "Invalid or expired invitation" });
    }

    res.json(invitation);
  } catch (error) {
    next(error);
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
  } catch (error: any) {
    if (
      error.message.includes("Invalid") ||
      error.message.includes("expired")
    ) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("already has")) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
};

export const getDashboardInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { dashboardId } = req.params;

    const userId = authenticatedReq.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const dashboard = await prisma.dashboard.findFirst({
      where: {
        id: dashboardId,
        admin_id: userId,
      },
    });

    if (!dashboard) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to dashboard" });
    }

    const invitations =
      await InvitationService.getInvitationsByDashboard(dashboardId);

    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

export const getUserInvitations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const userId = authenticatedReq.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const invitations = await InvitationService.getInvitationsByUser(userId);

    res.json(invitations);
  } catch (error) {
    next(error);
  }
};
