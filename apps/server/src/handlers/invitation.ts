import { Request, Response, NextFunction } from "express";
import { InvitationService } from "../services/invitation-service";
import z from "zod";
import { AuthenticatedRequest } from "../types";
import { config } from "../config/config";
import {
  sendAuthError,
  sendNotFoundError,
  sendSuccess,
  sendValidationError,
} from "../utils/response-utils";

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
      return sendValidationError(res, validation.error);
    }

    const userId = authenticatedReq.userId;
    if (!userId) {
      return sendAuthError(res);
    }
    const token = await InvitationService.createInvitation({
      ...validation.data,
      invitedById: userId,
    });
    sendSuccess(
      res,
      {
        success: true,
        token,
        inviteUrl: `${config.client}/invite/${token}`,
      },
      201
    );
  } catch (error) {
    next(error);
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
      return sendNotFoundError(res, "Invitation");
    }
    sendSuccess(res, invitation);
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
      return sendAuthError(res);
    }
    await InvitationService.acceptInvitation(token, userId);
    sendSuccess(res, {
      success: true,
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    next(error);
  }
};
