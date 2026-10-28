import { END, MessagesZodMeta, START, StateGraph } from "@langchain/langgraph";
import { withLangGraph } from "@langchain/langgraph/zod";
import { BaseMessage } from "langchain";
import { z } from "zod/v3";
import { identifyIntent } from "./nodes/indentifyIntentNode.ts";
import { chatResponseNode } from "./nodes/chatResponse.ts";
import { lowerCaseNode } from "./nodes/lowerCaseNode.ts";
import { upperCaseNode } from "./nodes/upperCaseNode.ts";
import { fallbackNode } from "./nodes/fallbackNode.ts";
const GraphState = z.object({
  messages: withLangGraph(z.custom<BaseMessage[]>(), MessagesZodMeta),
  output: z.string(),
  command: z.enum(["uppercase", "lowercase", "unknown"]),
});

export type GraphState = z.infer<typeof GraphState>;

export function buildGraph() {
  const workflow = new StateGraph({
    stateSchema: GraphState,
  })
    .addNode("identifyIntent", identifyIntent)
    .addNode("chatResponse", chatResponseNode)
    .addNode("uppercase", upperCaseNode)
    .addNode("lowercase", lowerCaseNode)
    .addNode("fallback", fallbackNode)
    .addEdge(START, "identifyIntent")
    .addConditionalEdges(
      "identifyIntent",
      (state: GraphState) => {
        if (state.command === "uppercase") {
          return "uppercase";
        } else if (state.command === "lowercase") {
          return "lowercase";
        } else {
          return "fallback";
        }
      },
      {
        uppercase: "uppercase",
        lowercase: "lowercase",
        fallback: "fallback",
      },
    )
    .addEdge("uppercase", "chatResponse")
    .addEdge("lowercase", "chatResponse")
    .addEdge("fallback", "chatResponse")
    .addEdge("chatResponse", END);
  return workflow.compile();
}
