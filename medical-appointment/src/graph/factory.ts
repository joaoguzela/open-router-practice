import { config } from "../config.ts";
import { AppointmentService } from "../services/appointmentService.ts";
import { OpenRouterService } from "../services/openRouterService.ts";
import { buildAppointmentGraph } from "./graph.ts";

export function buildGraph() {
  const llmCliente = new OpenRouterService(config);
  const appointmentService = new AppointmentService();
  return buildAppointmentGraph(llmCliente, appointmentService);
}

export const graph = async () => {
  return buildGraph();
};

export default graph;
