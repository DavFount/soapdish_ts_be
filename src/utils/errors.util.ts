export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

type ErrorName =
  | "USER_NOT_FOUND"
  | "INVALID_USERNAME_PASSWORD"
  | "EMAIL_NOT_VERIFIED"
  | "EMAIL_ALREADY_VERIFIED"
  | "TOKEN_EXPIRED"
  | "TOKEN_INVALID"
  | "REFRESH_TOKEN_INVALID"
  | "REFRESH_TOKEN_EXPIRED"
  | "NOT_AUTHORIZED"
  | "TEAM_NOT_FOUND";

export class SoapError extends Error {
  name: ErrorName;
  message: string;
  status: number;
  cause: any;

  constructor({ name, message, status, cause }: { name: ErrorName; message: string; status: number; cause?: any }) {
    super();
    this.name = name;
    this.message = message;
    this.status = status;
    this.cause = cause;
  }
}
