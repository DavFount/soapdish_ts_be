import { createConnection, ConnectOptions, Model, Schema } from "mongoose";
import { ITeam } from "#models/Team";
import bcrypt from "bcrypt";
import { toLower } from "lodash";
import { justNumericCharacters } from "#utils/db.util";
import Validator from "validatorjs";
import { config } from "#configs/index";
import jwt from "jsonwebtoken";

const connectionOptions: ConnectOptions = {
  bufferCommands: false,
};

const connection = createConnection(config.database.connectionUri, connectionOptions);

export interface IUser {
  email: string;
  password: string;
  details: {
    firstName: string;
    lastName: string;
    phone?: string;
    language: string;
    translation?: string;
  };
  socials: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  prayers?: Array<string>;
  teams: Array<ITeam>;
  emailVerified?: boolean;
}

interface IUserMethods {
  validPassword(password: string): boolean;
  generateRefreshToken(): string;
  generateAccessToken(): string;
}
interface UserModel extends Model<IUser, {}, IUserMethods> {
  generateHash(password: string): string;
  createValidator(data: Object): Validator.Validator<IUser>;
}

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: String, trim: true, index: { unique: true }, required: true, get: toLower, set: toLower },
    password: { type: String, required: true, trim: true },
    details: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phone: { type: String, required: false, set: justNumericCharacters },
      language: { type: String, required: false, default: "en" },
      translation: { type: String, required: false, default: "NIV" },
    },
    socials: {
      facebook: { type: String, required: false },
      twitter: { type: String, required: false },
      instagram: { type: String, required: false },
      linkedin: { type: String, required: false },
    },
    prayers: [{ type: String, required: false }],
    teams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
    emailVerified: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

UserSchema.statics.generateHash = (password: string) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

UserSchema.statics.createValidator = (data: Object) => {
  const rules = {
    "email": "required|email",
    "password": "required|min:8",
    "details.firstName": "required|min:2",
    "details.lastName": "required|min:2",
  };

  return new Validator(data, rules);
};

UserSchema.methods.validPassword = function (password: string) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.method("generateAccessToken", function () {
  return jwt.sign({ id: this._id }, config.jwt.secret, { expiresIn: config.jwt.accessTokenExpiry });
});

export const User = connection.model<IUser, UserModel>("User", UserSchema);
