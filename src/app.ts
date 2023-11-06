import express, { Application } from "express";
import { v1routes } from "./routes/v1/index";
import cors from "cors";

const app: Application = express();

app.use("/v1/", v1routes);

const options: cors.CorsOptions = {
  origin: "*",
};
app.use(cors(options));

export default app;
