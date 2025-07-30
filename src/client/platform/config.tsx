import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import statusCodes from 'http-status-codes';
import z, { ZodError } from 'zod';
import { Error } from './errors/Error';
import { BaseError } from './errors/errors';

const configSchema = z.object({
  env: z.string().min(1, 'env option is required'),
});

export const config: z.infer<typeof configSchema> = {} as any;

const loadConfigFromServer = async () => {
  try {
    const { data: loadedConfig } = await axios.get('/config.json');
    const parsedConfig = configSchema.safeParse(loadedConfig);
    if (!parsedConfig.success) {
      return parsedConfig;
    }

    (
      Object.keys(parsedConfig.data) as (keyof z.infer<typeof configSchema>)[]
    ).forEach((key) => {
      config[key] = parsedConfig.data[key];
    });

    return parsedConfig;
  } catch (error: any) {
    return { success: false, error };
  }
};

export const loadConfig = async () => {
  const configJsonResult = await loadConfigFromServer();

  if (configJsonResult.success) {
    console.log('Loaded config from /config.json', config);
    return;
  }

  // suggestions regarding the error
  if (configJsonResult.error instanceof ZodError) {
    console.error('Config loaded from /config.json failed validation');
    throw configJsonResult.error;
  }
  if (configJsonResult.error instanceof AxiosError) {
    console.error(
      'Config at /config.json could not be loaded for the following reason:',
      configJsonResult.error
    );
    throw configJsonResult.error;
  }
};

const ConfigLoadingStatus = {
  Loading: 'loading',
  Loaded: 'loaded',
  Error: 'error',
};
export const ConfigLoader = ({ children }: { children: React.ReactNode }) => {
  const [configLoadingStatus, setConfigLoadingStatus] = useState(
    ConfigLoadingStatus.Loading
  );
  const [error, setError] = useState<BaseError | null>(null);

  useEffect(() => {
    loadConfig()
      .then(() => {
        setConfigLoadingStatus(ConfigLoadingStatus.Loaded);
      })
      .catch((error) => {
        setConfigLoadingStatus(ConfigLoadingStatus.Error);
        setError(error);
      });
  }, []);

  if (configLoadingStatus === ConfigLoadingStatus.Loaded) {
    return children;
  }
  if (configLoadingStatus === ConfigLoadingStatus.Error) {
    return (
      <Error
        error={
          new BaseError({
            message:
              'Could not load config. This is most likely our fault, so your only hope is to pray and refresh the page.',
            httpStatus: statusCodes.INTERNAL_SERVER_ERROR,
            devMessage: error?.message || 'No error message',
            details: { originalError: error },
          })
        }
      />
    );
  }
};
