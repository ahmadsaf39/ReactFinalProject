using FinalProject.Data;
using FinalProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinalProject.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SimulationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ActivityLogger _logger;

        public SimulationController(AppDbContext context, ActivityLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        private string CurrentUser =>
            User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? "unknown";

        // GET: api/simulation
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var simulations = await _context.Simulations
                .Include(s => s.PathNodes)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            _logger.LogInfo(CurrentUser, "SIMULATIONS_FETCH", $"Fetched simulation history. Count={simulations.Count}");
            return Ok(simulations);
        }

        // GET: api/simulation/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var simulation = await _context.Simulations
                .Include(s => s.PathNodes)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (simulation == null)
            {
                _logger.LogWarning(CurrentUser, "SIMULATION_FETCH", $"Simulation not found. id={id}");
                return NotFound();
            }

            return Ok(simulation);
        }

        // DELETE: api/simulation/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var simulation = await _context.Simulations.FindAsync(id);

            if (simulation == null)
            {
                _logger.LogWarning(CurrentUser, "SIMULATION_DELETE_FAILED", $"Simulation not found. id={id}");
                return NotFound();
            }

            _context.Simulations.Remove(simulation);
            await _context.SaveChangesAsync();

            _logger.LogInfo(CurrentUser, "SIMULATION_DELETED",
                $"Simulation deleted. id={id} source={simulation.SourceNodeId} dest={simulation.DestinationNodeId}");

            return NoContent();
        }
    }
}