import { Request, Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import { config } from "#configs/index";

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({ error: "No token, Authorization Denied" });
    }

    const decoded = verify(token, config.jwt.secret);
    (req as CustomRequest).token = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token is not valid" });
  }
};
