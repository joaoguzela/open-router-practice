import {
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import { prompts } from "../../config.ts";
import { OpenRouterService } from "../../services/openrouterService.ts";
import type { GraphState } from "../state.ts";

export const createGuardrailsCheckNode = (
  openRouterService: OpenRouterService,
) => {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    try {
      const userPrompt = state.messages.at(-1)?.text!;
      const template = PromptTemplate.fromTemplate(prompts.system);
      const sytemPrompt = await template.format({
        USER_ROLE: state.user.role,
        USER_NAME: state.user.displayName,
      });
      const msg = sytemPrompt.concat("\n", userPrompt);
      const result = await openRouterService.checkGuardRails(
        msg,
        state.guardrailsEnabled,
      );
      return {
        guardrailCheck: result,
      };
    } catch (error) {
      console.error("Guardrails check failed:", error);

      return {
        guardrailCheck: {
          safe: false,
          reason:
            "An error occurred while checking guardrails. Please try again later.",
        },
      };
    }
  };
};
