import { config } from "#configs/index";
import { expressjwt, Request as JWTRequest } from "express-jwt";

export const verifyToken = expressjwt({
  issuer: config.jwt.issuer,
  secret: config.jwt.secret,
  algorithms: ["HS256"],
});
