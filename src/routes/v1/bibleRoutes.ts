import { Router } from "express";
import { BibleController } from "#controllers/BibleController";
import { verifyToken } from "#middleware/auth";
import { isAdmin } from "#middleware/guard";

export const bibleRoutes = Router();
const bibleController = new BibleController();

bibleRoutes.get("/bibles", verifyToken, bibleController.getBooks);

bibleRoutes.get("/bibles/:translation/:book", verifyToken, bibleController.getBook);

bibleRoutes.post("/bibles", verifyToken, isAdmin, bibleController.createBible);

bibleRoutes.delete("/bibles/:translation", verifyToken, isAdmin, bibleController.deleteBible);
