import { z } from "zod/v3";

export const IntentSchema = z.object({
  intent: z.enum(["schedule", "cancel", "unknown"]).describe("The user intent"),
  professionalId: z
    .number()
    .optional()
    .describe("ID of the medical professional"),
  professionalName: z
    .string()
    .optional()
    .describe("Name of the medical professional"),
  datetime: z
    .string()
    .optional()
    .describe("Appointment date and time in ISO format"),
  patientName: z
    .string()
    .optional()
    .describe("Patient name extracted from question"),
  reason: z
    .string()
    .optional()
    .describe("Reason for appointment (for scheduling)"),
});

export type IntentData = z.infer<typeof IntentSchema>;

export const getSystemPrompt = (professionals: any[]) => {
  return JSON.stringify({
    role: "Intent Classifier for Medical Appointments",
    task: "Identify user intent and extract all appointment-related details",
    professionals: professionals.map((p) => ({
      id: p.id,
      name: p.name,
      specialty: p.specialty,
    })),
    current_date: new Date().toISOString(),
    rules: {
      schedule: {
        description: "User wants to book/schedule a new appointment",
        keywords: [
          "schedule",
          "book",
          "appointment",
          "I want to",
          "make an appointment",
        ],
        required_fields: ["professionalId", "datetime", "patientName"],
        optional_fields: ["reason"],
      },
      cancel: {
        description: "User wants to cancel an existing appointment",
        keywords: ["cancel", "remove", "delete", "cancel my appointment"],
        required_fields: ["professionalId", "datetime", "patientName"],
      },
      unknown: {
        description:
          "Anything not related to scheduling or cancelling appointments",
        examples: ["weather questions", "general info", "unrelated queries"],
      },
    },
    output_requirements: [
      "For the schedule and cancel intents, the response MUST include professionalId, datetime and patientName whenever the question mentions them",
      "Never replace datetime or patientName with another field",
      "Include reason only for the schedule intent, and omit it when the question does not state a reason",
      "Omit a field that has no value. Never use the string 'null' as a value",
    ],
    extraction_instructions: {
      professionalId:
        "Match the professional name mentioned in the question to the ID from the professionals list. Use fuzzy matching.",
      professionalName:
        "Extract the professional name as mentioned by the user",
      datetime:
        "Always resolve relative dates (today, tomorrow) and times to a full ISO datetime, using current_date as reference. Keep the hour as stated by the user, with zero minutes and seconds when not stated, as in the examples.",
      patientName: "Extract the patient name from the question or context",
      reason:
        "Extract the reason/purpose for the appointment (only for scheduling)",
    },
    examples: [
      {
        input:
          "I'm Maria Santos and I want to schedule with Dr. Alicio da Silva for tomorrow at 4pm for a check-up",
        output: {
          intent: "schedule",
          professionalId: 1,
          professionalName: "Dr. Alicio da Silva",
          datetime: "2026-02-12T16:00:00.000Z",
          patientName: "Maria Santos",
          reason: "check-up",
        },
      },
      {
        input:
          "Cancel my appointment with Dr. Ana Pereira today at 11am, my name is Joao da Silva",
        output: {
          intent: "cancel",
          professionalId: 2,
          professionalName: "Dr. Ana Pereira",
          datetime: "2026-02-11T11:00:00.000Z",
          patientName: "Joao da Silva",
        },
      },
      {
        input: "What is the weather today?",
        output: { intent: "unknown" },
      },
    ],
  });
};

export const getUserPromptTemplate = (question: string) => {
  return JSON.stringify({
    question,
    instructions: [
      "Carefully analyze the question to determine the user intent",
      "Extract all relevant appointment details",
      "Convert dates and times to ISO format",
      "Match professional names to their IDs",
      "Always return the required fields of the identified intent when the question mentions them, including relative dates and the patient name",
      "Omit only the fields that the question does not mention",
    ],
  });
};
