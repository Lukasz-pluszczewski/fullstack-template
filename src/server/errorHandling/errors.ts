import statusCodes from 'http-status-codes';

type BaseErrorParams = {
  message?: string;
  httpStatus?: number;
  devMessage?: string;
  details?: any;
  cause?: any;
};
export class BaseError extends Error {
  constructor({
    message,
    httpStatus,
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
  httpStatus?: number;
  details?: any; // arbitrary data
}

export class InitializationError extends BaseError {
  override defaultMessage = 'Initialization error';
}

export class ConfigValidationError extends InitializationError {
  constructor({
    inputConfig,
    ...rest
  }: BaseErrorParams & { inputConfig?: Record<string, unknown> } = {}) {
    super({ ...rest });
    this.inputConfig = inputConfig;
  }
  inputConfig?: Record<string, unknown>;
  override defaultMessage = 'Config validation error';
}

export class RouteNotFoundError extends BaseError {
  override defaultMessage = 'Route not found';
  override defaultHttpStatus = statusCodes.NOT_FOUND;
}
