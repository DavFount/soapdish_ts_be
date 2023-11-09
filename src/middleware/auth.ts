import { config } from "#configs/index";
import { expressjwt } from "express-jwt";

export const verifyToken = expressjwt({
  issuer: config.jwt.issuer,
  secret: config.jwt.access_secret,
  algorithms: ["HS256"],
});
