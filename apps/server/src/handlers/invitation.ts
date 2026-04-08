import { Request, Response, NextFunction } from "express";
import { InvitationService } from "../services/invitation-service";
import { config } from "../config/config";
import { sendSuccess } from "../utils/response-utils";
import { BadRequestError } from "../utils/errors";
import { extractUserId } from "../utils/request-utils";
import { CreateInvitationRequest } from "../schemas/invitation-schemas";
import logger from "../logger";

export const createInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = extractUserId(req);
    const { dashboardPlayerId, email, expirationHours } =
      req.body as CreateInvitationRequest;

    logger.info({ userId, dashboardPlayerId }, "Create invitation attempt");

    const token = await InvitationService.createInvitation({
      dashboardPlayerId,
      email,
      expirationHours,
      invitedById: userId,
    });

    logger.info({ userId, dashboardPlayerId }, "Invitation created");
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
