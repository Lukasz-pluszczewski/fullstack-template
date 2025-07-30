import statusCodes from 'http-status-codes';

type BaseErrorParams = {
  message?: string;
  description?: string;
  httpStatus?: number;
  devMessage?: string;
  details?: any;
};
export class BaseError extends Error {
  constructor({
    message,
    httpStatus = statusCodes.INTERNAL_SERVER_ERROR,
    description,
    devMessage,
    details,
  }: BaseErrorParams = {}) {
    super(message);
    this.description = description;
    this.devMessage = devMessage;
    this.httpStatus = httpStatus;
    this.details = details;
  }
  defaultMessage = 'Unknown error';
  defaultHttpStatus = statusCodes.INTERNAL_SERVER_ERROR;
  description?: string;
  devMessage?: string;
  httpStatus: number;
  details?: any;
}

export class RouteNotFoundError extends BaseError {
  defaultMessage = 'Route not found';
  defaultHttpStatus = statusCodes.NOT_FOUND;
}
