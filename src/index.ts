import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/../.env" });

import express, { Application } from "express";
import { routes } from "./routes/index";

const app: Application = express();
const port = process.env.PORT || 8000;

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
