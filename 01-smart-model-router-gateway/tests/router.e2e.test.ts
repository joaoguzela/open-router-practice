import test from "node:test";
import assert from "node:assert";

import { environment } from "../src/config.ts";
import {
  type LLMResponse,
  OpenRouterService,
} from "../src/openrouterService.ts";
import { createServer } from "../src/server.ts";
console.assert(
  process.env.OPENROUTER_API_KEY,
  "OPENROUTER_API_KEY is not set in the environment variables.",
);

test.todo("routes to cheapest model by default", async (t) => {
  const customConfig = {
    ...environment,
    provider: {
      sort: {
        ...environment.provider.sort,
        by: "price",
      },
    },
  };

  const routerService = new OpenRouterService(customConfig);
  const server = createServer(routerService);
  const response = await server.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: "What is the capital of France?",
    },
  });
  assert.equal(response.statusCode, 200, "Expected status code 200");
  const body = response.json() as LLMResponse;
  assert.equal(
    body.model,
    "nvidia/nemotron-3.5-lightning:free",
    "Expected model to be the cheapest one",
  );
});

test.todo("routes to highest throughput model by default", async (t) => {
  const customConfig = {
    ...environment,
    provider: {
      sort: {
        ...environment.provider.sort,
        by: "throughput",
      },
    },
  };

  const routerService = new OpenRouterService(customConfig);
  const server = createServer(routerService);
  const response = await server.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: "What is the capital of France?",
    },
  });
  assert.equal(response.statusCode, 200, "Expected status code 200");
  const body = response.json() as LLMResponse;
  assert.equal(
    body.model,
    "inclusionai/ling-3.0-flash-sante:free",
    "Expected model to be the highest throughput one",
  );
});
