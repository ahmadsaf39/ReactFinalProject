// Matches backend: FinalProject.Models.SimulationPath
export interface SimulationPath {
  id: number;
  simulationId: number;
  nodeId: number;
  stepOrder: number;
}

// Matches backend: FinalProject.Models.Simulation
// algorithm is serialized as string due to JsonStringEnumConverter on the backend
export interface Simulation {
  id: number;
  sourceNodeId: number;
  destinationNodeId: number;
  algorithm: string;
  totalCost: number;
  executionTimeMs: number;
  visitedNodes: number;
  edgeRelaxations: number;
  pathFound: boolean;
  createdAt: string;
  pathNodes: SimulationPath[];
}
