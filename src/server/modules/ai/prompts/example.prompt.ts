import { readFileSync } from 'node:fs';
import Handlebars from 'handlebars';
import JSON5 from 'json5';
import { z } from 'zod';

import config from '../../../config';
import { getConfig, System, User } from '../index';

const exampleSystemTemplate = Handlebars.compile(
  readFileSync(new URL('./example.system.handlebars', import.meta.url), 'utf8')
);
const exampleUserTemplate = Handlebars.compile(
  readFileSync(new URL('./example.user.handlebars', import.meta.url), 'utf8')
);

export const exampleProviderSchema = z
  .enum(['openrouter', 'openai'])
  .optional();
export const exampleModelSchema = z.string().optional();
export const exampleReasoningEffortSchema = z
  .enum(['none', 'minimal', 'low', 'medium', 'high', 'xhigh'])
  .optional();
export const exampleTemperatureSchema = z.number().optional();

export type ExamplePromptInput = {
  task: string;
  data: Record<string, unknown>;
  constraints?: string | string[] | Record<string, unknown>;
};
export const examplePrompt = ({ input }: { input: ExamplePromptInput }) => {
  const systemContent = exampleSystemTemplate({});
  const userContent = exampleUserTemplate({
    task: input.task,
    data: JSON5.stringify(input.data, null, 2),
    constraints: input.constraints
      ? JSON5.stringify(input.constraints, null, 2)
      : null,
  });

  return getConfig(
    config.PROMPTS_EXAMPLE_PROVIDER || 'openai',
    config.PROMPTS_EXAMPLE_MODEL || 'gpt-5.2',
    {
      temperature: config.PROMPTS_EXAMPLE_TEMPERATURE || 0,
      providerOptions: {
        openai: {
          reasoningEffort: config.PROMPTS_EXAMPLE_REASONING_EFFORT || 'low',
        },
      },
      messages: [System(systemContent), User(userContent)],
    }
  );
};
