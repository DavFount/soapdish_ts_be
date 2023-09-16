declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      CONNECTION_URI: string!;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_BUCKET_NAME: string;
      EMAIL_HOST: string;
      EMAIL_PORT: string;
      EMAIL_HOST_USER: string;
      EMAIL_HOST_PASSWORD: string;
      EMAIL_USE_TLS: string;
      SENDGRID_API_KEY: string;
    }
  }
}

export {};
