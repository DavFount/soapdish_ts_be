import { Router, Request, Response } from "express";

export const defaultRoute = Router();

defaultRoute.get("/", async (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the SOAP Dish API v1!",
  });
});
