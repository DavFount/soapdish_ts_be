import { createConnection, ConnectOptions, Model, Schema } from "mongoose";
import { config } from "#configs/index";
import { IUser } from "#models/User";
import { v4 as uuidv4 } from "uuid";
import SHA256 from "crypto-js/sha256";

const connectionOptions: ConnectOptions = {
  bufferCommands: false,
};
const connection = createConnection(config.database.connectionUri, connectionOptions);

export interface IRefreshToken {
  user: IUser;
  refreshToken: string;
  expiresAt: Date;
}

interface RefreshTokenModel extends Model<IRefreshToken> {
  generateRefreshToken(): string;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

RefreshTokenSchema.statics.generateRefreshToken = function () {
  const uuid = uuidv4();
  return SHA256(uuid);
};

export const RefreshToken = connection.model<IRefreshToken, RefreshTokenModel>("RefreshToken", RefreshTokenSchema);
