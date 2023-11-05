import { Response, NextFunction } from "express";
import { Request } from "express-jwt";
import { SoapError } from "#utils/errors.util";
import { User } from "#models/User";
import { Team, TeamRoles } from "#models/Team";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.auth?.role !== "admin") {
      throw new SoapError({
        name: "NOT_AUTHORIZED",
        message: "You are not allowed to access this resource!",
        status: 403,
      });
    }
  } catch (err: any) {
    next(err);
  }

  next();
};

export const isTeamOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ _id: req.auth?.id });
    if (!user) {
      throw new SoapError({
        name: "USER_NOT_FOUND",
        message: "User not found!",
        status: 404,
      });
    }

    const team = await Team.findOne({ _id: req.params.id });
    if (!team) {
      throw new SoapError({
        name: "TEAM_NOT_FOUND",
        message: "Team not found!",
        status: 404,
      });
    }

    const role = team!.members!.find((member) => member.user.equals(user?._id))!.role;

    if (req.auth?.role !== "admin" && role !== TeamRoles.Owner) {
      throw new SoapError({
        name: "NOT_AUTHORIZED",
        message: "You are not allowed to access this resource!",
        status: 403,
      });
    }
  } catch (err: any) {
    next(err);
  }

  next();
};

export const isTeamAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ _id: req.auth?.id });
    if (!user) {
      throw new SoapError({
        name: "USER_NOT_FOUND",
        message: "User not found!",
        status: 404,
      });
    }

    const team = await Team.findOne({ _id: req.params.id });
    if (!team) {
      throw new SoapError({
        name: "TEAM_NOT_FOUND",
        message: "Team not found!",
        status: 404,
      });
    }

    const role = team!.members!.find((member) => member.user.equals(user?._id))!.role;

    if (req.auth?.role !== "admin" && role !== TeamRoles.Owner && role !== TeamRoles.Moderator) {
      throw new SoapError({
        name: "NOT_AUTHORIZED",
        message: "You are not allowed to access this resource!",
        status: 403,
      });
    }
  } catch (err: any) {
    next(err);
  }

  next();
};
