import express from "express";
import { defaultRoute } from "./defaultRoute";
import { userRoutes } from "./userRoutes";
import { authRoutes } from "./authRoutes";
import { bibleRoutes } from "./bibleRoutes";

export const v1routes = express.Router();

v1routes.use(express.json({ limit: "50mb" }));
v1routes.use(express.urlencoded({ extended: true, limit: "50mb" }));
v1routes.use(defaultRoute);
v1routes.use(authRoutes);
v1routes.use(userRoutes);
v1routes.use(bibleRoutes);
