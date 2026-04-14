import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

import config from '../../config';

export interface OpenRouterModel {
  id: string;
  canonical_slug: string;
  name: string;
  created: number;
  pricing: Pricing;
  context_length: number;
  architecture: Architecture;
  top_provider: TopProvider;
  per_request_limits: any;
  supported_parameters: string[];
  default_parameters: any;
  description: string;
  expiration_date: any;
}

export interface Pricing {
  prompt: string;
  completion: string;
  request: string;
  image: string;
}

export interface Architecture {
  modality: string;
  input_modalities: string[];
  output_modalities: string[];
  tokenizer: string;
  instruct_type: string;
}

export interface TopProvider {
  is_moderated: boolean;
  context_length: number;
  max_completion_tokens: number;
}

const MODELS_PATH = path.resolve('data/openRouterModelsCache.json');
const MODELS_TYPE_PATH = path.resolve(__dirname, 'availableModels.ts');

export const fetchModels = async (): Promise<OpenRouterModel[]> => {
  try {
    const cached = await (async () => {
      const modelsLastUpdated = await fs
        .stat(MODELS_PATH)
        .then(s => s.mtimeMs)
        .catch(() => 0);
      if (Date.now() - modelsLastUpdated < 24 * 60 * 60 * 1000) {
        return JSON.parse(await fs.readFile(MODELS_PATH, 'utf8'));
      }
    })();
    if (cached) {
      console.log('Openrouter models cache hit', cached.length);
      return cached;
    }

    console.log('Openrouter models cache miss');
    const { data } = await axios({
      url: `${config.OPENROUTER_URL}/api/v1/models`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
      },
    });
    if (!data?.data) return [];

    console.log('Fetched Openrouter models', data.data.length);
    try {
      await fs.writeFile(MODELS_PATH, JSON.stringify(data.data));
    } catch (error) {
      console.warn('Failed to write models to file', error);
    }
    return data.data;
  } catch (error) {
    console.warn('Failed to fetch models from OpenRouter', error);
    return [];
  }
};

export const generateModelsType = (models: OpenRouterModel[]): string =>
  models.map(model => `'${model.id}' | '${model.canonical_slug}'`).join(' | ');
export const generateModelsArray = (models: OpenRouterModel[]): string =>
  `[${models.map(model => `'${model.id}', '${model.canonical_slug}'`).join(', ')}]`;
export const updateOpenRouterTypes = async (): Promise<string> => {
  const models = await fetchModels();
  const modelsType = generateModelsType(models);
  const modelsArray = generateModelsArray(models);
  await fs.writeFile(
    MODELS_TYPE_PATH,
    `export type OpenRouterModel = ${modelsType};\nexport const openRouterModels = ${modelsArray} as const;\nexport const openRouterModelsSet = new Set(openRouterModels)`
  );
  return modelsType;
};
