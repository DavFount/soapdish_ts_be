import { ConnectOptions, Schema, createConnection, model } from "mongoose";
import { config } from "#configs/index";

const connectionOptions: ConnectOptions = {
  bufferCommands: false,
};

const connection = createConnection(config.database.connectionUri, connectionOptions);

export interface ITeam {
  name: string;
  description?: string;
}

const TeamSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
});

export const Team = connection.model<ITeam>("Team", TeamSchema);
