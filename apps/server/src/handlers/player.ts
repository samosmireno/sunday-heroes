import { UserRepo } from "../repositories/user-repo";
import { NextFunction, Request, Response } from "express";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.query as string;
    let players;

    if (query) {
      players = await UserRepo.getUsersByQuery(query);
    } else {
      players = await UserRepo.getAllUsers();
    }

    res.json(players);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const player = await UserRepo.getUserById(req.params.id);
    if (player) {
      res.json(player);
    } else {
      res.status(404).send("Player not found");
    }
  } catch (error) {
    next(error);
  }
};
