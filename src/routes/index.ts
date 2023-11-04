import express from "express";
import { defaultRoute } from "./v1/defaultRoute";
import { userRoutes } from "./v1/userRoutes";
import { authRoutes } from "./v1/authRoutes";
import { bibleRoutes } from "./v1/bibleRoutes";

export const routes = express.Router();

routes.use(express.json({ limit: "50mb" }));
routes.use(express.urlencoded({ extended: true, limit: "50mb" }));
routes.use(defaultRoute);
routes.use(authRoutes);
routes.use(userRoutes);
routes.use(bibleRoutes);
