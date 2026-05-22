using FinalProject.Data;
using FinalProject.Models;
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
    public class LinksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly GraphBuilderService _graphBuilderService;
        private readonly ActivityLogger _logger;

        public LinksController(
            AppDbContext context,
            GraphBuilderService graphBuilderService,
            ActivityLogger logger)
        {
            _context = context;
            _graphBuilderService = graphBuilderService;
            _logger = logger;
        }

        private string CurrentUser =>
            User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? "unknown";

        // GET: api/links
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var links = await _context.Links
                .Include(l => l.SourceNode)
                .Include(l => l.DestinationNode)
                .ToListAsync();

            _logger.LogInfo(CurrentUser, "LINKS_FETCH", $"Fetched all links. Count={links.Count}");
            return Ok(links);
        }

        // GET: api/links/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var link = await _context.Links
                .Include(l => l.SourceNode)
                .Include(l => l.DestinationNode)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (link == null)
            {
                _logger.LogWarning(CurrentUser, "LINK_FETCH", $"Link not found. id={id}");
                return NotFound();
            }

            return Ok(link);
        }

        // POST: api/links
        [HttpPost]
        public async Task<IActionResult> Create(Link link)
        {
            _context.Links.Add(link);
            await _context.SaveChangesAsync();

            _graphBuilderService.ClearCache();

            _logger.LogInfo(CurrentUser, "LINK_CREATED", $"New link created. id={link.Id} source={link.SourceNodeId} dest={link.DestinationNodeId} cost={link.Cost}");

            return CreatedAtAction(
                nameof(GetById),
                new { id = link.Id },
                link);
        }

        // PUT: api/links/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Link updatedLink)
        {
            if (id != updatedLink.Id)
            {
                _logger.LogWarning(CurrentUser, "LINK_UPDATE_FAILED", $"ID mismatch. url-id={id} body-id={updatedLink.Id}");
                return BadRequest();
            }

            var existingLink = await _context.Links.FindAsync(id);

            if (existingLink == null)
            {
                _logger.LogWarning(CurrentUser, "LINK_UPDATE_FAILED", $"Link not found. id={id}");
                return NotFound();
            }

            existingLink.SourceNodeId = updatedLink.SourceNodeId;
            existingLink.DestinationNodeId = updatedLink.DestinationNodeId;
            existingLink.Cost = updatedLink.Cost;
            existingLink.IsActive = updatedLink.IsActive;

            await _context.SaveChangesAsync();

            _graphBuilderService.ClearCache();

            _logger.LogInfo(CurrentUser, "LINK_UPDATED", $"Link updated. id={id} source={existingLink.SourceNodeId} dest={existingLink.DestinationNodeId} cost={existingLink.Cost}");

            return NoContent();
        }

        // DELETE: api/links/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var link = await _context.Links.FindAsync(id);

            if (link == null)
            {
                _logger.LogWarning(CurrentUser, "LINK_DELETE_FAILED", $"Link not found. id={id}");
                return NotFound();
            }

            _context.Links.Remove(link);
            await _context.SaveChangesAsync();

            _graphBuilderService.ClearCache();

            _logger.LogInfo(CurrentUser, "LINK_DELETED", $"Link deleted. id={id} source={link.SourceNodeId} dest={link.DestinationNodeId}");

            return NoContent();
        }
    }
}