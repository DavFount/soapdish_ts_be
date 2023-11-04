import express from "express";
import { defaultRoute } from "./defaultRoute";
import { userRoutes } from "./userRoutes";
import { authRoutes } from "./authRoutes";
import { bibleRoutes } from "./bibleRoutes";

export const routes = express.Router();

routes.use(express.json({ limit: "50mb" }));
routes.use(express.urlencoded({ extended: true, limit: "50mb" }));
routes.use(defaultRoute);
routes.use(authRoutes);
routes.use(userRoutes);
routes.use(bibleRoutes);
