import { createConnection, ConnectOptions, Model, Schema, Types } from "mongoose";
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

interface ITeamInvites {
  team: Types.ObjectId;
  token: string;
}

export interface IUser {
  email: string;
  password: string;
  role: string;
  details: {
    firstName: string;
    lastName: string;
    biography?: string;
    jobTitle?: string;
    testimonial?: string;
    location?: string;
    phone?: string;
    language: string;
    translation?: string;
    avatar?: string;
  };
  socials: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    linkedin?: string;
  };
  prayers?: Array<string>;
  teams: Array<Types.ObjectId>;
  teamInvites: Array<ITeamInvites>;
  emailVerified?: boolean;
  passwordChangeRequired?: boolean;
  resetPasswordToken?: string;
}

interface IUserMethods {
  validPassword(password: string): boolean;
  generateRefreshToken(): string;
  generateAccessToken(): string;
  generatePasswordResetToken(): string;
}
interface UserModel extends Model<IUser, {}, IUserMethods> {
  generateHash(password: string): string;
  createValidator(data: Object): Validator.Validator<IUser>;
}

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: String, trim: true, index: { unique: true }, required: true, get: toLower, set: toLower },
    password: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: ["user", "admin"], default: "user" },
    details: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      biography: { type: String, required: false },
      jobTitle: { type: String, required: false },
      testimonial: { type: String, required: false },
      location: { type: String, required: false },
      phone: { type: String, required: false, set: justNumericCharacters },
      language: { type: String, required: false, default: "en" },
      translation: { type: String, required: false, default: "NIV" },
      avatar: { type: String, required: false },
    },
    socials: {
      facebook: { type: String, required: false },
      twitter: { type: String, required: false },
      instagram: { type: String, required: false },
      tiktok: { type: String, required: false },
      linkedin: { type: String, required: false },
    },
    prayers: [{ type: String, required: false }],
    teams: [{ type: Types.ObjectId, ref: "Team" }],
    teamInvites: [
      {
        team: { type: Types.ObjectId, ref: "Team" },
        token: { type: String, required: true },
      },
    ],
    emailVerified: { type: Boolean, required: false, default: false },
    passwordChangeRequired: { type: Boolean, required: false, default: false },
    resetPasswordToken: { type: String, required: false },
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
  return jwt.sign({ id: this._id, role: this.role }, config.jwt.access_secret, {
    expiresIn: config.jwt.accessTokenExpiry,
    algorithm: "HS256",
    issuer: config.jwt.issuer,
  });
});

UserSchema.method("generateRefreshToken", function () {
  return jwt.sign({ id: this._id, role: this.role }, config.jwt.refresh_secret, {
    expiresIn: config.jwt.refreshTokenExpiry,
    algorithm: "HS256",
    issuer: config.jwt.issuer,
  });
});

UserSchema.method("generatePasswordResetToken", function () {
  return jwt.sign({ id: this._id }, config.jwt.password_reset_secret, {
    expiresIn: config.jwt.passwordResetTokenExpiry,
    algorithm: "HS256",
    issuer: config.jwt.issuer,
  });
});

export const User = connection.model<IUser, UserModel>("User", UserSchema);
