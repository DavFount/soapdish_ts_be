import { ConnectOptions, Schema, createConnection, model } from "mongoose";
import { config } from "#configs/index";

const connectionOptions: ConnectOptions = {
  bufferCommands: false,
};

const connection = createConnection(config.database.connectionUri, connectionOptions);

interface IBook {
  name: string;
  translation: string;
  number: Number;
  chapters: Array<Array<string>>;
}

const BookSchema = new Schema({
  name: { type: String, required: true },
  translation: { type: String, required: true },
  number: { type: Number, required: true },
  chapters: [[{ type: String }]],
});

export const Book = connection.model<IBook>("Book", BookSchema);
