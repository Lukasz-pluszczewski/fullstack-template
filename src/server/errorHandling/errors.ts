import statusCodes from 'http-status-codes';

type BaseErrorParams = {
  message?: string,
  httpStatus?: number,
  devMessage?: string,
  details?: any,
  cause?: any,
};
export class BaseError extends Error {
  constructor({
    message,
    httpStatus = statusCodes.INTERNAL_SERVER_ERROR,
    devMessage,
    details,
    cause,
  }: BaseErrorParams = {}) {
    super(message);
    this.devMessage = devMessage;
    this.httpStatus = httpStatus;
    this.details = details;
    this.cause = cause;
    return this;
  }
  defaultMessage = 'Unknown error'; // default user-facing message
  defaultHttpStatus = statusCodes.INTERNAL_SERVER_ERROR;
  devMessage?: string; // message included in development logs
  httpStatus: number;
  details?: any; // arbitrary data
  cause?: any;
}

export class InitializationError extends BaseError {
  defaultMessage = 'Initialization error';
}

export class ConfigValidationError extends InitializationError {
  defaultMessage = 'Config validation error';
}

export class RouteNotFoundError extends BaseError {
  defaultMessage = 'Route not found';
  defaultHttpStatus = statusCodes.NOT_FOUND;
}
