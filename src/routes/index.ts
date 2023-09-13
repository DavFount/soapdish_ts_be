import express from "express";
import { defaultRoute } from "./v1/defaultRoute";

export const routes = express.Router();

routes.use(defaultRoute);
