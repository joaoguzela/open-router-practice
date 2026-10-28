import { createServer } from "./server.ts";

const server = createServer();

await server.listen({ port: 3000, host: "0.0.0.0" });
console.log("Server is running on http://localhost:3000");
// server
//   .inject({
//     method: "POST",
//     url: "/chat",
//     payload: {
//       question: "What is the capital of France?",
//     },
//   })
//   .then((response) => {
//     console.log("Response from /chat endpoint:", response.payload);
//   });
