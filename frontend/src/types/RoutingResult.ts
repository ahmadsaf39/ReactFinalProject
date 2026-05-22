// Matches backend: FinalProject.DTOs.RoutingResultDto
export interface RoutingResult {
  pathFound: boolean;
  pathNodeIds: number[];
  totalCost: number;
  executionTimeMs: number;
  visitedNodes: number;
  edgeRelaxations: number;
  algorithm: string;
}
