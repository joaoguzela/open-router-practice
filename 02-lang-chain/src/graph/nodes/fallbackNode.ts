import { AIMessage } from "langchain";
import type { GraphState } from "../graph.ts";

export function fallbackNode(state: GraphState): GraphState {
  const message =
    "Unknown command. Please use 'upper' or 'lower' in your message.";
  const fallBackMessage = new AIMessage(message).content.toString();
  return {
    ...state,
    output: fallBackMessage,
    messages: [...state.messages],
  };
}
