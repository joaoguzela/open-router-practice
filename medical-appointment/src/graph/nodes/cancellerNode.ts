import { AppointmentService } from "../../services/appointmentService.ts";
import type { GraphState } from "../graph.ts";
import { z } from "zod/v3";
const CancellerRequiredFieldsSchema = z.object({
  professionalId: z.number().describe("ID of the medical professional"),
  datetime: z.string().describe("Appointment date and time in ISO format"),
  patientName: z.string().describe("Patient name extracted from question"),
});

export function createCancellerNode(appointmentService: AppointmentService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`❌ Cancelling appointment...`);

    try {
      const validation = CancellerRequiredFieldsSchema.safeParse({
        professionalId: state.professionalId,
        datetime: state.datetime,
        patientName: state.patientName,
      });
      if (!validation.success) {
        const errorMessages = validation.error.errors
          .map((e) => e.message)
          .join(", ");
        return {
          actionSuccess: false,
          actionError: errorMessages,
        };
      }
      appointmentService.cancelAppointment(
        validation.data.professionalId,
        validation.data.patientName,
        new Date(validation.data.datetime),
      );
      console.log(`✅ Appointment cancelled successfully`);
      1;

      return {
        actionSuccess: true,
      };
    } catch (error) {
      console.log(
        `❌ Cancellation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return {
        ...state,
        actionSuccess: false,
        actionError:
          error instanceof Error ? error.message : "Cancellation failed",
      };
    }
  };
}
