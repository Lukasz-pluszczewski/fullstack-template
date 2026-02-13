import { ErrorHandler } from 'simple-express-framework';

import config from '../config';
import { Locals, RouteParams } from '../types';

type ErrorData = {
  message?: string;
  devMessage?: string;
  details?: any;
  cause?: ErrorData;
};
const getErrorData = (error: any, includeDevInfo: boolean, includeStack: boolean): ErrorData => ({
  message: error.message || error.defaultMessage || 'Unknown error',
  ...(includeDevInfo && error.devMessage
    ? { devMessage: error.devMessage }
    : {}),
  ...(includeDevInfo && error.details ? { details: error.details } : {}),
  ...(includeDevInfo && error.cause
    ? { cause: getErrorData(error.cause, includeDevInfo, includeStack) }
    : {}),
  ...(includeStack && error.stack ? { stack: error.stack } : {}),
});

const errorHandlers: ErrorHandler<RouteParams, Locals>[] = [
  (error) => (
    console.error('Error handler', error, getErrorData(error, true, config.INCLUDE_STACK_IN_ERROR_RESPONSES)),
    {
      status:
        (error as any)?.httpStatus || (error as any)?.defaultHttpStatus || 500,
      body: getErrorData(error, config.NODE_ENV === 'development', config.INCLUDE_STACK_IN_ERROR_RESPONSES),
    }
  ),
  (error) => {
    console.error('Unexpected error (most likely thrown in error handler)', error);
    return {
      status: 500,
      body: config.NODE_ENV === 'development' ? {
        message: 'Unexpected error (most likely thrown in error handler',
        errorMessage: error?.message,
        ...(config.INCLUDE_STACK_IN_ERROR_RESPONSES && error.stack ? { stack: error.stack } : {}),
      } : { message: 'Unknown error' },
    };
  },
];

export default errorHandlers;
