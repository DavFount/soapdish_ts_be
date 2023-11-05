import { Response, NextFunction } from "express";
import { Request } from "express-jwt";
import { SoapError } from "#utils/errors.util";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Invalid Token!" });
  }

  if (err instanceof SoapError) {
    return res.status(err.status).json({ error: err.message });
  }
};
