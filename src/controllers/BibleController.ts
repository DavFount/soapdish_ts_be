import { Response } from "express";
import { Request } from "express-jwt";
import { Book } from "#models/Book";

export class BibleController {
  getBooks = async (req: Request, res: Response) => {
    if (req.body.translation === undefined) {
      return res.status(400).json({ message: "Translation is required!" });
    }

    const books = await Book.find(
      {
        translation: req.body.translation,
      },
      { __v: 0 }
    );

    res.status(200).json({ books: books });
  };

  getBook = async (req: Request, res: Response) => {
    const book = await Book.findOne({
      translation: req.params.translation,
      name: req.params.book,
    });

    res.status(200).json({ book: book });
  };

  createBible = async (req: Request, res: Response) => {
    const books = req.body.books;
    const translation = req.body.translation;

    for (const index in books) {
      const bookObj = new Book({
        name: books[index].name,
        translation: translation,
        number: books[index].number,
        chapters: books[index].chapters,
      });
      await bookObj.save();
    }
    res.status(201).json({ message: "Bible created successfully!" });
  };

  deleteBible = async (req: Request, res: Response) => {
    await Book.deleteMany({ translation: req.params.translation });
    res.status(200).json({ message: "Bible deleted successfully!" });
  };
}
