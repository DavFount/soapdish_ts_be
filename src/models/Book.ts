import { ConnectOptions, Schema, createConnection, model } from "mongoose";
import { IChapter } from "#models/Chapter";
import { config } from "#configs/index";

const connectionOptions: ConnectOptions = {
  bufferCommands: false,
};

const connection = createConnection(config.database.connectionUri, connectionOptions);

interface IBook {
  name: string;
  translation: string;
  chapters: Array<IChapter>;
}

const BookSchema = new Schema({
  name: { type: String, required: true },
  translation: { type: String, required: true },
  chapters: [{ type: Schema.Types.ObjectId, ref: "Chapter" }],
});

export const Book = connection.model<IBook>("Bible", BookSchema);
