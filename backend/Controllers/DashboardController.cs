using FinalProject.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinalProject.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/dashboard
        [HttpGet]
        public async Task<IActionResult> GetStatistics()
        {
            var totalNodes = await _context.Nodes.CountAsync();
            var totalLinks = await _context.Links.CountAsync();
            var totalSimulations = await _context.Simulations.CountAsync();

            var activeNodes = await _context.Nodes
                .CountAsync(n => n.IsActive);

            var inactiveNodes = await _context.Nodes
                .CountAsync(n => !n.IsActive);

            var averageLinkCost = await _context.Links.AnyAsync()
                ? await _context.Links.AverageAsync(l => l.Cost)
                : 0;

            var result = new
            {
                TotalNodes = totalNodes,
                TotalLinks = totalLinks,
                TotalSimulations = totalSimulations,
                ActiveNodes = activeNodes,
                InactiveNodes = inactiveNodes,
                AverageLinkCost = averageLinkCost
            };

            return Ok(result);
        }
    }
}