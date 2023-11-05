import { Router } from "express";
import { AuthController } from "#controllers/AuthController";
import { verifyToken } from "#middleware/auth";

export const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/login", authController.login);

authRoutes.delete("/logout", verifyToken, authController.logout);

authRoutes.post("/register", authController.register);

authRoutes.post("/resend", authController.resendVerificationEmail);

authRoutes.get("/verify", authController.verify);

authRoutes.post("/refresh", authController.refresh);

// TODO: Add endpoint to reset password
