import { Request, Response, NextFunction } from "express";
import { InvitationService } from "../services/invitation-service";
import z from "zod";
import { config } from "../config/config";
import { sendSuccess } from "../utils/response-utils";
import { BadRequestError, ValidationError } from "../utils/errors";
import { extractUserId } from "../utils/request-utils";
import logger from "../logger";

const createInvitationSchema = z.object({
  dashboardPlayerId: z.string().uuid(),
  email: z.string().email().optional(),
  expirationHours: z.number().positive().max(720).optional(),
});

export const createInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const validation = createInvitationSchema.safeParse(req.body);

    logger.info({ userId, body: req.body }, "Create invitation attempt");

    if (!validation.success) {
      throw new ValidationError(
        validation.error.errors.map((error) => ({
          field: error.path.join("."),
          message: error.message,
          code: "INVALID",
        })),
      );
    }

    const token = await InvitationService.createInvitation({
      ...validation.data,
      invitedById: userId,
    });

    logger.info(
      {
        userId,
        dashboardPlayerId: validation.data.dashboardPlayerId,
      },
      "Invitation created",
    );
    sendSuccess(
      res,
      {
        success: true,
        token,
        inviteUrl: `${config.client}/invite/${token}`,
      },
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const validateInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const invitation = await InvitationService.validateInvitation(
      req.params.token,
    );
    if (!invitation) {
      throw new BadRequestError("Invalid or expired invitation token");
    }

    logger.info("Invitation validated");
    sendSuccess(res, invitation);
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.params;
    const userId = extractUserId(req);

    await InvitationService.acceptInvitation(token, userId);

    logger.info({ userId, token: token.slice(0, 8) }, "Invitation accepted");
    sendSuccess(res, {
      success: true,
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    next(error);
  }
};
