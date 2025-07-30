import statusCodes from 'http-status-codes';

type BaseErrorParams = {
  message?: string;
  httpStatus?: number;
  devMessage?: string;
  details?: any;
};
export class BaseError extends Error {
  constructor({
    message,
    httpStatus = statusCodes.INTERNAL_SERVER_ERROR,
    devMessage,
    details,
  }: BaseErrorParams = {}) {
    super(message);
    this.devMessage = devMessage;
    this.httpStatus = httpStatus;
    this.details = details;
  }
  defaultMessage = 'Unknown error';
  defaultHttpStatus = statusCodes.INTERNAL_SERVER_ERROR;
  devMessage?: string;
  httpStatus: number;
  details?: any;
}

export class RouteNotFoundError extends BaseError {
  defaultMessage = 'Route not found';
  defaultHttpStatus = statusCodes.NOT_FOUND;
}
