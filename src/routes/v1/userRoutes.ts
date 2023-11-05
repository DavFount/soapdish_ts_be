import { Router } from "express";
import { UsersController } from "#controllers/UsersController";
import { verifyToken } from "#middleware/auth";
import { isAdmin } from "#middleware/guard";

export const userRoutes = Router();
const usersController = new UsersController();

userRoutes.get("/users", verifyToken, usersController.getUsers);

userRoutes.get("/users/:id", verifyToken, usersController.getUser);

userRoutes.post("/users", verifyToken, isAdmin, usersController.createUser);

userRoutes.put("/users/:id", verifyToken, usersController.updateUser);

userRoutes.delete("/users/:id", verifyToken, isAdmin, usersController.deleteUser);

// TODO: Add route for inviting users
