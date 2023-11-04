import express, { Application } from "express";
import { v1routes } from "./routes/v1/index";

const app: Application = express();

app.use("/api/v1/", v1routes);

export default app;
