import express from "express";
import { defaultRoute } from "./v1/defaultRoute";
import { userRoutes } from "./v1/userRoutes";

export const routes = express.Router();

routes.use(express.json());
routes.use(express.urlencoded({ extended: true }));
routes.use(defaultRoute);
routes.use(userRoutes);
