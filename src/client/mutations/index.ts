import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosRequestConfig } from 'axios';
import { ZodType } from 'zod';

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
