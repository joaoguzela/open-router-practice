import { PromptTemplate } from "@langchain/core/prompts";
import type { GraphState } from "../state.ts";
import { prompts } from "../../config.ts";
import { AIMessage } from "langchain";

export async function blockedNode(
  state: GraphState,
): Promise<Partial<GraphState>> {
  const guardReailCheck = state.guardrailCheck!;
  const anlaysis = guardReailCheck.analysis
    ? "**Analsysis:**\n" + guardReailCheck.analysis + "\n\n"
    : "";

  const permissions = state.user.permissions.length
    ? state.user.permissions?.join(", ")
    : "None";
  const template = PromptTemplate.fromTemplate(prompts.blocked);
  const blockedMessage = await template.format({
    REASON: guardReailCheck.reason ?? "Security check failed",
    ANALYSIS: anlaysis,
    USER_ROLE: state.user.role,
    PERMISSIONS: permissions,
  });
  return {
    messages: [new AIMessage(blockedMessage)],
  };
}
