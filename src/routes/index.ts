import express from "express";
import { defaultRoute } from "./v1/defaultRoute";
import { userRoutes } from "./v1/userRoutes";
import { authRoutes } from "./v1/authRoutes";

export const routes = express.Router();

routes.use(express.json());
routes.use(express.urlencoded({ extended: true }));
routes.use(defaultRoute);
routes.use(userRoutes);
routes.use(authRoutes);
