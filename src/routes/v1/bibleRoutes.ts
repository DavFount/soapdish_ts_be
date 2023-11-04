import { Router } from "express";
import { BibleController } from "#controllers/BibleController";
import { verifyToken } from "#middleware/auth";

export const bibleRoutes = Router();
const bibleController = new BibleController();

bibleRoutes.get("/bibles", verifyToken, bibleController.getBooks);

bibleRoutes.get("/bibles/:translation/:book", verifyToken, bibleController.getBook);

bibleRoutes.post("/bibles", verifyToken, bibleController.createBible);

bibleRoutes.delete("/bibles/:translation", verifyToken, bibleController.deleteBible);
