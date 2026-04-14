import type { AxiosError, AxiosResponse } from 'axios';

const isAxiosError = (error: any): error is AxiosError =>
  error?.isAxiosError ?? false;
export const getAxiosResults = (response?: AxiosResponse) => {
  if (!response) return {};
  return {
    status: response.status,
    statusText: response.statusText,
    data: response.data,
    headers: response.headers,
  };
};
export const getAxiosResultsFromError = (error?: any) => {
  if (error && isAxiosError(error)) {
    return {
      ...getAxiosResults(error.response),
      code: error.code,
      cause: error.cause,
    };
  }
  return {};
};
