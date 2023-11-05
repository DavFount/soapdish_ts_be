import express, { Application } from "express";
import { expressjwt } from "express-jwt";
import { v1routes } from "./routes/v1/index";

const app: Application = express();

app.use("/v1/", v1routes);

export default app;
