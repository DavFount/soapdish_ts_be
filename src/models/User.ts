import { Schema, model } from "mongoose";
import { ITeam } from "./Team";
import bcrypt from "bcrypt";
import { toLower } from "lodash";
import { justNumericCharacters } from "../utils";

export interface IUser {
  email: string;
  password: string;
  details: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  socials: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  team: Array<ITeam>;
}

const UserSchema = new Schema({
  email: { type: String, trim: true, index: { unique: true }, required: true, get: toLower, set: toLower },
  password: { type: String, required: true, trim: true },
  details: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: false, set: justNumericCharacters },
  },
  socials: {
    facebook: { type: String, required: false },
    twitter: { type: String, required: false },
    instagram: { type: String, required: false },
    linkedin: { type: String, required: false },
  },
  team: [{ type: Schema.Types.ObjectId, ref: "Team" }],
});

UserSchema.statics.generateHash = function (password: string) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

UserSchema.methods.validPassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

export const User = model<IUser>("User", UserSchema);
