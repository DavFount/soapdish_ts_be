import express, { Application } from "express";
import { v1routes } from "./routes/v1/index";
import cors from "cors";

const app: Application = express();

const allowedOrigins = ["http://thesoapdish.test:5173", "https://thesoapdish.app", "http://thesoapdish.app"];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  preflightContinue: false,
  credentials: true,
};

app.use(cors(options));
app.use("/v1/", v1routes);

export default app;
