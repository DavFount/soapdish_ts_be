import { Router } from "express";
import { AuthController } from "#controllers/AuthController";
import { verifyToken } from "#middleware/auth";

export const authRoutes = Router();
const authController = new AuthController();

authRoutes.post("/login", authController.login); // Test Complete

authRoutes.delete("/logout", verifyToken, authController.logout); // Test Complete

authRoutes.post("/register", authController.register); // Test Complete

authRoutes.post("/resend", authController.resendVerificationEmail); // Test Complete

authRoutes.get("/verify", authController.verify); // Test Complete

authRoutes.post("/refresh", authController.refresh); // Test Complete

// TODO: Add endpoint to reset password
