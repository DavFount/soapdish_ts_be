export const config = {
  port: process.env.PORT || 8000,
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
  },
};
