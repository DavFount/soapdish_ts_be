import { createConnection, ConnectOptions, Schema } from "mongoose";
import { config } from "#configs/index";
import { IUser } from "#models/User";

const connectionOptions: ConnectOptions = {
  bufferCommands: false,
};
const connection = createConnection(config.database.connectionUri, connectionOptions);

export interface IActivation {
  user: IUser;
  verificationToken: string;
  expiresAt: Date;
}

export const ActivationSchema = new Schema<IActivation>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  verificationToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

export const Activation = connection.model<IActivation>("Activation", ActivationSchema, "activations");
