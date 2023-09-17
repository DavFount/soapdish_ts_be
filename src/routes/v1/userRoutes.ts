import { Router, Request, Response } from "express";
import { UsersController } from "#controllers/UsersController";
import { verifyToken } from "#middleware/auth";

export const userRoutes = Router();
const usersController = new UsersController();

userRoutes.get("/users", verifyToken, usersController.getUsers);

userRoutes.get("/users/:id", verifyToken, usersController.getUser);

userRoutes.post("/users", verifyToken, usersController.createUser);

userRoutes.put("/users/:id", verifyToken, usersController.updateUser);

userRoutes.delete("/users/:id", verifyToken, usersController.deleteUser);
