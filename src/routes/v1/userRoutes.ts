import { Router, Request, Response } from "express";
import { UsersController } from "#controllers/UsersController";

export const userRoutes = Router();
const usersController = new UsersController();

userRoutes.get("/users", usersController.getUsers);

userRoutes.get("/users/:id", usersController.getUser);

userRoutes.post("/users", usersController.createUser);

userRoutes.put("/users/:id", usersController.updateUser);

userRoutes.delete("/users/:id", usersController.deleteUser);
