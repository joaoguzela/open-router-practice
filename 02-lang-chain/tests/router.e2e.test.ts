import test from "node:test";
import assert from "node:assert";

import { createServer } from "../src/server.ts";
console.assert(
  process.env.OPENROUTER_API_KEY,
  "OPENROUTER_API_KEY is not set in the environment variables.",
);

test.todo("command upper transforms message into UPPERCASE", async (t) => {
  const server = createServer();
  const msg = "make This message UPPERCASE please";
  const expected = msg.toUpperCase();
  const response = await server.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: msg,
    },
  });
  assert.equal(response.statusCode, 200, "Expected status code 200");
  assert.equal(response.body, expected);
});

test.todo("command lower transforms message into LOWERCASE", async (t) => {
  const server = createServer();
  const msg = "make This message LOWERCASE please";
  const expected = msg.toLowerCase();
  const response = await server.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: msg,
    },
  });
  assert.equal(response.statusCode, 200, "Expected status code 200");
  assert.equal(response.body, expected);
});

test.todo("command unknown transforms message into UNKNOWN", async (t) => {
  const server = createServer();
  const msg = "HEY THERE!";
  const expected =
    "Unknown command. Please use 'upper' or 'lower' in your message.";
  const response = await server.inject({
    method: "POST",
    url: "/chat",
    payload: {
      question: msg,
    },
  });
  assert.equal(response.statusCode, 200, "Expected status code 200");
  assert.equal(response.body, expected);
});
