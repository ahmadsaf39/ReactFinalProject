using FinalProject.Data;
using FinalProject.Models;
using FinalProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinalProject.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class RoutingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly GraphBuilderService _graphBuilderService;
        private readonly DijkstraService _dijkstraService;
        private readonly ActivityLogger _logger;

        public RoutingController(
            AppDbContext context,
            GraphBuilderService graphBuilderService,
            DijkstraService dijkstraService,
            ActivityLogger logger)
        {
            _context = context;
            _graphBuilderService = graphBuilderService;
            _dijkstraService = dijkstraService;
            _logger = logger;
        }

        private string CurrentUser =>
            User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? "unknown";

        [HttpGet("dijkstra")]
        public async Task<IActionResult> RunDijkstra(
            int sourceNodeId,
            int destinationNodeId)
        {
            // Input validation
            if (sourceNodeId <= 0 || destinationNodeId <= 0)
            {
                _logger.LogWarning(CurrentUser, "DIJKSTRA_FAILED", $"Invalid node IDs. source={sourceNodeId} dest={destinationNodeId}");
                return BadRequest("Node IDs must be positive integers.");
            }

            _logger.LogInfo(CurrentUser, "DIJKSTRA_START", $"Routing calculation requested. source={sourceNodeId} dest={destinationNodeId}");

            // Build graph (from cache if available)
            var graph = await _graphBuilderService.BuildGraphAsync();

            // Run Dijkstra algorithm
            var result = _dijkstraService.FindShortestPath(
                graph,
                sourceNodeId,
                destinationNodeId);

            if (result.PathFound)
            {
                _logger.LogInfo(CurrentUser, "DIJKSTRA_SUCCESS",
                    $"Path found. source={sourceNodeId} dest={destinationNodeId} " +
                    $"totalCost={result.TotalCost} hops={result.PathNodeIds?.Count ?? 0} " +
                    $"executionMs={result.ExecutionTimeMs:F3} visitedNodes={result.VisitedNodes}");
            }
            else
            {
                _logger.LogWarning(CurrentUser, "DIJKSTRA_NO_PATH",
                    $"No path found. source={sourceNodeId} dest={destinationNodeId} " +
                    $"executionMs={result.ExecutionTimeMs:F3}");
            }

            // Create simulation entity
            var simulation = new Simulation
            {
                Algorithm = AlgorithmType.Dijkstra,
                SourceNodeId = sourceNodeId,
                DestinationNodeId = destinationNodeId,
                PathFound = result.PathFound,
                TotalCost = result.TotalCost,
                ExecutionTimeMs = result.ExecutionTimeMs,
                VisitedNodes = result.VisitedNodes,
                EdgeRelaxations = result.EdgeRelaxations,
                CreatedAt = DateTime.UtcNow,
                PathNodes = new List<SimulationPath>()
            };

            // Save path nodes if a path was found
            if (result.PathFound && result.PathNodeIds != null)
            {
                for (int i = 0; i < result.PathNodeIds.Count; i++)
                {
                    simulation.PathNodes.Add(new SimulationPath
                    {
                        NodeId = result.PathNodeIds[i],
                        StepOrder = i
                    });
                }
            }

            // Save simulation to database
            _context.Simulations.Add(simulation);
            await _context.SaveChangesAsync();

            _logger.LogInfo(CurrentUser, "SIMULATION_SAVED", $"Simulation saved to DB. simulationId={simulation.Id}");

            // Return algorithm result to the client
            return Ok(result);
        }
    }
}