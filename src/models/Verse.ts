import { Schema, model, ConnectOptions, createConnection } from "mongoose";
import { config } from "#configs/index";

const connectionOptions: ConnectOptions = {
  bufferCommands: false,
};

const connection = createConnection(config.database.connectionUri, connectionOptions);
export interface IVerse {
  verse: number;
  text: string;
}

const VerseSchema = new Schema({
  verse: { type: Number, required: true },
  text: { type: String, required: true },
});

export const Verse = connection.model<IVerse>("Team", VerseSchema);
