import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  AssistantModelMessage,
  FlexibleSchema,
  Output,
  SystemModelMessage,
  UserModelMessage,
} from 'ai';
import { fetch as undiciFetch } from 'undici';

import type { OpenRouterModel } from '../openrouter/availableModels';

const openrouter = createOpenAICompatible<
  OpenRouterModel,
  string,
  string,
  string
>({
  name: 'openrouter',
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  includeUsage: true, // Include usage information in streaming responses
  fetch: undiciFetch as unknown as typeof fetch, // Workaround for Bun's buggy globalThis.fetch
});
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch: undiciFetch as unknown as typeof fetch, // Workaround for Bun's buggy globalThis.fetch
});

export const providers = {
  openrouter,
  openai,
};

type ExtractModelId<T> = T extends (modelId: infer M) => any ? M : never;

type ProviderModelMap = {
  [K in keyof typeof providers]: ExtractModelId<(typeof providers)[K]>;
};

export function getConfig<TProvider extends keyof typeof providers, TConfig>(
  providerName: TProvider,
  modelName: ProviderModelMap[TProvider],
  config: TConfig
) {
  return {
    model: providers[providerName](modelName as any),
    ...config,
    experimental_telemetry: {
      isEnabled: true,
      ...(Object.hasOwnProperty.call(config, 'experimental_telemetry')
        ? (config as { experimental_telemetry: any }).experimental_telemetry
        : {}),
    },
  };
}

export const User = (
  content: UserModelMessage['content'],
  providerOptions?: UserModelMessage['providerOptions']
) => ({ role: 'user' as const, content, providerOptions });
export const System = (
  content: SystemModelMessage['content'],
  providerOptions?: SystemModelMessage['providerOptions']
) => ({ role: 'system' as const, content, providerOptions });
export const Assistant = (
  content: AssistantModelMessage['content'],
  providerOptions?: AssistantModelMessage['providerOptions']
) => ({ role: 'assistant' as const, content, providerOptions });

export const ObjectOutput = <TObject>(schema: FlexibleSchema<TObject>) =>
  Output.object({
    schema,
  });

export const ArrayOutput = <TArray extends any[]>(
  element: FlexibleSchema<TArray[number]>
) =>
  Output.array({
    element,
  });
