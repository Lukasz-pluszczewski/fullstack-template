import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import axios, { AxiosRequestConfig } from 'axios';
import { ZodType } from 'zod';

const defaultOptions = {
  refetchOnWindowFocus: false,
  staleTime: 2 * 60 * 1000, // 2 minutes
};
export const useCustomQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  key: TQueryKey,
  axiosParams: AxiosRequestConfig,
  schema?: ZodType<TQueryFnData> | null,
  options: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await axios({
        ...axiosParams,
      });
      if (!schema) {
        return data;
      }
      return schema.parseAsync(data);
    },
    ...defaultOptions,
    ...options,
  });
};

export const useCustomMutation = <
  TVariables,
  TData = unknown,
  TError = unknown,
  TContext = unknown,
>(
  getConfig: (data: TVariables) => AxiosRequestConfig,
  mutationParamsSchema?: ZodType<TVariables> | null,
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    'mutationFn'
  > & { invalidateKeys?: string[]; responseSchema?: ZodType<TData> }
) => {
  const queryClient = useQueryClient();
  const { invalidateKeys, ...useMutationOptions } = options || {};

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: async (rawData: TVariables) => {
      const data = mutationParamsSchema
        ? await mutationParamsSchema.parseAsync(rawData)
        : rawData;
      const axiosParams = getConfig(data);

      const { data: responseData } = await axios({
        ...axiosParams,
      });

      return options?.responseSchema
        ? await options.responseSchema.parseAsync(responseData)
        : responseData;
    },
    ...useMutationOptions,
    onSuccess: (...args) => {
      if (options?.onSuccess) {
        options.onSuccess(...args);
      }
      options?.invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
  });
};
