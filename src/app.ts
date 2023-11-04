import express, { Application } from "express";
import { routes } from "./routes/v1/index";

const app: Application = express();

app.use("/api/v1/", routes);

export default app;
