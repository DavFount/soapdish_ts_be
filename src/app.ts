import express, { Application } from "express";
import { v1routes } from "./routes/v1/index";
import cors from "cors";

const app: Application = express();

const allowedOrigins = ["*"];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  exposedHeaders: ["Access-Control-Allow-Origin"],
};

app.use(cors(options));
app.use("/v1/", v1routes);

export default app;
