console.assert(
  process.env.OPENROUTER_API_KEY,
  "OPENROUTER_API_KEY is not set in the environment variables.",
);
export const environment: ModelEnvironment = {
  apiKey: process.env.OPENROUTER_API_KEY || "",
  httpReferer: "https://openrouter-ai-pos.com",
  xTitle: "OpenRouter AI POS",
  port: 3000,
  models: [
    "nvidia/nemotron-3.5-lightning:free",
    "inclusionai/ling-3.0-flash-sante:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
  ],
  temperature: 0.2,
  maxTokens: 50,
  systemPrompt: "You are a helpful assistant.",
  provider: {
    sort: {
      by: "price",
      partition: "none",
    },
  },
};
export type ModelEnvironment = {
  apiKey: string;
  httpReferer: string;
  xTitle: string;
  port: number;
  models: string[];
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  provider: {
    sort: {
      by: string;
      partition: string;
    };
  };
};
