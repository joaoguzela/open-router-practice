import Fastify from "fastify";

export const createServer = () => {
  const server = Fastify({});

  server.post(
    "/chat",
    {
      schema: {
        body: {
          type: "object",
          required: ["question"],

          properties: {
            question: { type: "string", minLength: 5 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { question } = request.body as { question: string };
        // Here you can implement your logic to handle the question and generate a response
        const answer = `You asked: ${question}. This is a placeholder answer.`;
        return reply.send({ answer });
      } catch (error) {
        console.error("Error processing chat request:", error);
        return reply.status(500).send({ error: "Internal server error" });
      }
    },
  );
  return server;
};
