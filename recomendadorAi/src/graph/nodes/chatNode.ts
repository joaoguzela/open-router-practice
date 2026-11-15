import type { Runtime } from "@langchain/langgraph";
import { OpenRouterService } from "../../services/openrouterService.ts";
import type { GraphState } from "../graph.ts";
import {
  ChatResponseSchema,
  getSystemPrompt,
  getUserPromptTemplate,
} from "../../prompts/v1/chatResponse.ts";
import { AIMessage, HumanMessage } from "langchain";
import { PreferencesService } from "../../services/preferencesService.ts";
import { config } from "../../config.ts";

export function createChatNode(
  llmClient: OpenRouterService,
  preferencesService: PreferencesService,
) {
  return async (
    state: GraphState,
    runtime?: Runtime,
  ): Promise<Partial<GraphState>> => {
    const userId = String(
      runtime?.context?.userId || state.userId || "unknown",
    );
    const userContext =
      state.userContext || (await preferencesService.getBasicInfo(userId));
    const systemPrompt = getSystemPrompt(userContext);
    const conversationHistory = state.messages
      .map(
        (message) =>
          `${HumanMessage.isInstance(message) ? "User" : "AI"}: ${message.text}`,
      )
      .join("\n");

    const userMessage = state.messages.at(-1)?.text!;
    const userPrompt = getUserPromptTemplate(userMessage, conversationHistory);
    const result = await llmClient.generateStructured(
      userPrompt,
      systemPrompt,
      ChatResponseSchema,
    );
    if (!result.success) {
      console.log("✖️ Falha ao gerar resposta estruturada:", result.error);
      return {
        messages: [
          new AIMessage(
            "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.",
          ),
        ],
      };
    }
    // Calculate if the conversation needs summarization based on the number of messages and the configured threshold
    // After summarization, the conversation history can be condensed to maintain context without exceeding the message limit.
    const response = result.data!;
    const totalMessages = state.messages.length;
    const needsSummarization = totalMessages > config.maxMessagesToSummary;

    return {
      messages: [new AIMessage(response.message)],
      extractedPreferences: response.shouldSavePreferences
        ? response.preferences
        : undefined,
      needsSummarization,
    };
  };
}
