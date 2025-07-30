import { ErrorHandler } from 'simple-express-framework';
import config from '../config';
import { RouteParams } from '../types';

const errorHandlers: ErrorHandler<RouteParams>[] = [
  error => (console.log('error', error), ({
    status: error.httpStatus || error.defaultHttpStatus || 500,
    body: {
      message: error.message || error.defaultMessage || 'Unknown error',
      ...((config.NODE_ENV === 'development' && error.devMessage) ? { devMessage: error.devMessage } : {}),
      ...((config.NODE_ENV === 'development' && error.details) ? { details: error.details } : {}),
    }
  })),
  error => ({
    status: 500,
    body: 'Unknown error'
  }),
];

export default errorHandlers;
