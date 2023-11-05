import { ConnectOptions, Model, Schema, createConnection, model, Types } from "mongoose";
import { IUser } from "#models/User";
import { config } from "#configs/index";
import Validator from "validatorjs";

const connectionOptions: ConnectOptions = {
  bufferCommands: false,
};

const connection = createConnection(config.database.connectionUri, connectionOptions);

export enum TeamRoles {
  Member,
  Moderator,
  Owner,
}

interface IMembers {
  user: Types.ObjectId;
  role: Number;
  status?: boolean;
  joinDate?: Date;
}

export interface ITeam {
  name: string;
  description?: string;
  members?: Array<IMembers>;
}

interface TeamModel extends Model<ITeam> {
  createValidator(data: Object): Validator.Validator<ITeam>;
}

const TeamSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  members: [
    {
      user: { type: Types.ObjectId, ref: "User", required: true },
      role: { type: Number, default: TeamRoles.Member },
      status: { type: Boolean, default: false },
      joinDate: { type: Date },
    },
  ],
});

TeamSchema.statics.createValidator = (data: Object) => {
  const rules = {
    name: "required|string|min:3|max:255",
    description: "string|max:500",
  };

  return new Validator(data, rules);
};

export const Team = connection.model<ITeam, TeamModel>("Team", TeamSchema);
