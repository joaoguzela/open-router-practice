import { AppointmentService } from "../../services/appointmentService.ts";
import type { GraphState } from "../graph.ts";
import { z } from "zod/v3";
const ScheduleRequiredFieldsSchema = z.object({
  professionalId: z.number().describe("ID of the medical professional"),
  datetime: z.string().describe("Appointment date and time in ISO format"),
  patientName: z.string().describe("Patient name extracted from question"),
});

export function createSchedulerNode(appointmentService: AppointmentService) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    console.log(`📅 Scheduling appointment...`);

    try {
      const validation = ScheduleRequiredFieldsSchema.safeParse({
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
          actionError: `Missing required fields: ${errorMessages}`,
        };
      }

      const appointment = appointmentService.bookAppointment(
        validation.data.professionalId,
        new Date(validation.data.datetime),
        validation.data.patientName,
        state.reason ?? "No reason provided",
      );
      console.log(`✅ Appointment scheduled successfully`);

      return {
        ...state,
        actionSuccess: true,
        appointmentData: appointment,
      };
    } catch (error) {
      console.log(
        `❌ Scheduling failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      return {
        ...state,
        actionSuccess: false,
        actionError:
          error instanceof Error ? error.message : "Scheduling failed",
      };
    }
  };
}
