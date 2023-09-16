import { ConnectOptions, Schema, createConnection, model } from "mongoose";
import { IVerse } from "#models/Verse";
import { config } from "#configs/index";

const connectionOptions: ConnectOptions = {
  bufferCommands: false,
};

const connection = createConnection(config.database.connectionUri, connectionOptions);

export interface IChapter {
  chapter: number;
  verses: Array<IVerse>;
}

const ChapterSchema = new Schema({
  chapter: { type: Number, required: true },
  verses: [{ type: Schema.Types.ObjectId, ref: "Verse" }],
});

export const Chapter = connection.model<IChapter>("Chapter", ChapterSchema);
