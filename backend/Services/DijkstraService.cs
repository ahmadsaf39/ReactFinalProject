using System.Diagnostics;
using FinalProject.DTOs;
using FinalProject.Graph;
using Microsoft.Extensions.Logging;

namespace FinalProject.Services
{
    public class DijkstraService
    {
        private readonly ILogger<DijkstraService> _logger;

        public DijkstraService(ILogger<DijkstraService> logger)
        {
            _logger = logger;
        }

        public RoutingResultDto FindShortestPath(
            Graph.Graph graph,
            int sourceNodeId,
            int destinationNodeId)
        {
            _logger.LogInformation(
                "Running Dijkstra from node {SourceNodeId} to node {DestinationNodeId}",
                sourceNodeId,
                destinationNodeId);

            var stopwatch = Stopwatch.StartNew();

            var result = new RoutingResultDto
            {
                Algorithm = "Dijkstra"
            };

            // Validate source and destination
            if (!graph.AdjacencyList.ContainsKey(sourceNodeId) ||
                !graph.AdjacencyList.ContainsKey(destinationNodeId))
            {
                result.PathFound = false;

                _logger.LogWarning(
                    "Invalid source or destination node. Source: {SourceNodeId}, Destination: {DestinationNodeId}",
                    sourceNodeId,
                    destinationNodeId);

                return result;
            }

            var distances = new Dictionary<int, double>();
            var previous = new Dictionary<int, int?>();
            var visited = new HashSet<int>();
            var priorityQueue = new PriorityQueue<int, double>();

            foreach (var nodeId in graph.AdjacencyList.Keys)
            {
                distances[nodeId] = double.PositiveInfinity;
                previous[nodeId] = null;
            }

            distances[sourceNodeId] = 0;
            priorityQueue.Enqueue(sourceNodeId, 0);

            int edgeRelaxations = 0;

            while (priorityQueue.Count > 0)
            {
                int currentNode = priorityQueue.Dequeue();

                if (visited.Contains(currentNode))
                    continue;

                visited.Add(currentNode);

                if (currentNode == destinationNodeId)
                    break;

                foreach (var edge in graph.AdjacencyList[currentNode])
                {
                    if (visited.Contains(edge.ToNodeId))
                        continue;

                    double newDistance =
                        distances[currentNode] + edge.Cost;

                    edgeRelaxations++;

                    if (newDistance < distances[edge.ToNodeId])
                    {
                        distances[edge.ToNodeId] = newDistance;
                        previous[edge.ToNodeId] = currentNode;

                        priorityQueue.Enqueue(
                            edge.ToNodeId,
                            newDistance);
                    }
                }
            }

            stopwatch.Stop();

            if (double.IsPositiveInfinity(distances[destinationNodeId]))
            {
                result.PathFound = false;
                result.ExecutionTimeMs =
                    stopwatch.Elapsed.TotalMilliseconds;
                result.VisitedNodes = visited.Count;
                result.EdgeRelaxations = edgeRelaxations;

                _logger.LogWarning(
                    "No path found from node {SourceNodeId} to node {DestinationNodeId}",
                    sourceNodeId,
                    destinationNodeId);

                return result;
            }

            var path = new List<int>();
            int? current = destinationNodeId;

            while (current != null)
            {
                path.Add(current.Value);
                current = previous[current.Value];
            }

            path.Reverse();

            result.PathFound = true;
            result.PathNodeIds = path;
            result.TotalCost = distances[destinationNodeId];
            result.ExecutionTimeMs =
                stopwatch.Elapsed.TotalMilliseconds;
            result.VisitedNodes = visited.Count;
            result.EdgeRelaxations = edgeRelaxations;

            _logger.LogInformation(
                "Path found. Total Cost: {TotalCost}, Visited Nodes: {VisitedNodes}, Edge Relaxations: {EdgeRelaxations}, Execution Time: {ExecutionTimeMs} ms",
                result.TotalCost,
                result.VisitedNodes,
                result.EdgeRelaxations,
                result.ExecutionTimeMs);

            return result;
        }
    }
}