import { OpenRouter } from "@openrouter/sdk";
import { environment, type ModelEnvironment } from "./config.ts";
import { type ChatGenerationParams } from "@openrouter/sdk/models";

export type LLMResponse = {
  model: string;
  content: string;
};
export class OpenRouterService {
  private client: OpenRouter;
  private environment: ModelEnvironment;

  constructor(configOverride: ModelEnvironment) {
    this.environment = configOverride ?? environment;
    this.client = new OpenRouter({
      apiKey: this.environment.apiKey,
      httpReferer: this.environment.httpReferer,
      xTitle: this.environment.xTitle,
    });
  }
  async generate(prompt: string): Promise<LLMResponse> {
    const response = await this.client.chat.send({
      models: this.environment.models,
      messages: [
        {
          role: "system",
          content: this.environment.systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      temperature: this.environment.temperature,
      maxTokens: this.environment.maxTokens,
      provider: this.environment.provider as ChatGenerationParams["provider"],
    });

    const content = String(response.choices.at(0)?.message?.content) ?? "";
    console.log("Extracted content:", content);
    return { model: response.model, content };
  }
}
