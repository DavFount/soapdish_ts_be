declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;

      JWT_ISSUER: string;
      JWT_SECRET_ACCESS: string;
      JWT_SECRET_REFRESH: string;
      JWT_SECRET_VERIFICATION: string;
      JWT_SECRET_PASSWORD_RESET: string;
      JWT_ACCESS_TOKEN_EXPIRY: string;
      JWT_REFRESH_TOKEN_EXPIRY: string;
      JWT_VERIFICATION_TOKEN_EXPIRY: string;
      JWT_PASSWORD_RESET_TOKEN_EXPIRY: string;

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
      SENDGRID_NEW_USER_TEMPLATE: string;
      SENDGIRD_TEAM_INVITE_NEW_USER_TEMPLATE: string;
      SENDGRID_TEAM_INVITE_EXISTING_USER_TEMPLATE: string;
      SENDGRID_PASSWORD_RESET_TEMPLATE: string;
    }
  }
}

export {};
