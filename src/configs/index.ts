export const config = {
  port: process.env.PORT || 8000,
  app: {
    url: process.env.APP_URL || "http://localhost:8000",
  },
  jwt: {
    issuer: process.env.JWT_ISSUER!,
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY!,
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY!,
  },
  database: {
    connectionUri: process.env.CONNECTION_URI!,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    bucketName: process.env.AWS_BUCKET_NAME!,
  },
  email: {
    host: process.env.EMAIL_HOST!,
    port: process.env.EMAIL_PORT!,
    user: process.env.EMAIL_HOST_USER!,
    password: process.env.EMAIL_HOST_PASSWORD!,
    useTls: process.env.EMAIL_USE_TLS!,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY!,
    newUserTemplate: process.env.SENDGRID_NEW_USER_TEMPLATE!,
    teamInviteNewUserTemplate: process.env.SENDGIRD_TEAM_INVITE_NEW_USER_TEMPLATE!,
    teamInviteExistingUserTemplate: process.env.SENDGRID_TEAM_INVITE_EXISTING_USER_TEMPLATE!,
    passwordResetTemplate: process.env.SENDGRID_PASSWORD_RESET_TEMPLATE!,
  },
};
