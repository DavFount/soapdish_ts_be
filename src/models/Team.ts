import { Schema, model } from "mongoose";

export interface ITeam {
  name: string;
  description?: string;
}

const TeamSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
});

export const Team = model<ITeam>("Team", TeamSchema);
