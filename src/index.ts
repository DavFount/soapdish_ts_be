import express, { Express, Request, Response, Application } from "express";
import dotenv from "dotenv";
import { routes } from "./routes/index";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
