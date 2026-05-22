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
    public class NodesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly GraphBuilderService _graphBuilderService;
        private readonly ActivityLogger _logger;

        public NodesController(
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

        // GET: api/nodes
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var nodes = await _context.Nodes.ToListAsync();
            _logger.LogInfo(CurrentUser, "NODES_FETCH", $"Fetched all nodes. Count={nodes.Count}");
            return Ok(nodes);
        }

        // GET: api/nodes/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var node = await _context.Nodes.FindAsync(id);

            if (node == null)
            {
                _logger.LogWarning(CurrentUser, "NODE_FETCH", $"Node not found. id={id}");
                return NotFound();
            }

            return Ok(node);
        }

        // POST: api/nodes
        [HttpPost]
        public async Task<IActionResult> Create(Node node)
        {
            _context.Nodes.Add(node);
            await _context.SaveChangesAsync();

            _graphBuilderService.ClearCache();

            _logger.LogInfo(CurrentUser, "NODE_CREATED", $"New node created. id={node.Id} name='{node.Name}' type={node.Type}");

            return CreatedAtAction(
                nameof(GetById),
                new { id = node.Id },
                node);
        }

        // PUT: api/nodes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Node updatedNode)
        {
            if (id != updatedNode.Id)
            {
                _logger.LogWarning(CurrentUser, "NODE_UPDATE_FAILED", $"ID mismatch. url-id={id} body-id={updatedNode.Id}");
                return BadRequest();
            }

            var existingNode = await _context.Nodes.FindAsync(id);

            if (existingNode == null)
            {
                _logger.LogWarning(CurrentUser, "NODE_UPDATE_FAILED", $"Node not found. id={id}");
                return NotFound();
            }

            existingNode.Name = updatedNode.Name;
            existingNode.Type = updatedNode.Type;
            existingNode.X = updatedNode.X;
            existingNode.Y = updatedNode.Y;
            existingNode.IsActive = updatedNode.IsActive;

            await _context.SaveChangesAsync();

            _graphBuilderService.ClearCache();

            _logger.LogInfo(CurrentUser, "NODE_UPDATED", $"Node updated. id={id} name='{existingNode.Name}' active={existingNode.IsActive}");

            return NoContent();
        }

        // DELETE: api/nodes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var node = await _context.Nodes.FindAsync(id);

            if (node == null)
            {
                _logger.LogWarning(CurrentUser, "NODE_DELETE_FAILED", $"Node not found. id={id}");
                return NotFound();
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Remove all Links that reference this node as source or destination.
                // The Link -> Node FK is configured with DeleteBehavior.Restrict in
                // AppDbContext, so SQL Server will reject the node delete if any link
                // still references it. We clean them up manually first.
                var relatedLinks = await _context.Links
                    .Where(l => l.SourceNodeId == id || l.DestinationNodeId == id)
                    .ToListAsync();

                if (relatedLinks.Count > 0)
                {
                    _context.Links.RemoveRange(relatedLinks);
                    _logger.LogInfo(CurrentUser, "NODE_DELETE", $"Cascade-removed {relatedLinks.Count} link(s) referencing node id={id}");
                }

                _context.Nodes.Remove(node);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _graphBuilderService.ClearCache();

                _logger.LogInfo(CurrentUser, "NODE_DELETED", $"Node deleted. id={id} name='{node.Name}'");

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(CurrentUser, "NODE_DELETE_ERROR", $"DB constraint error deleting node id={id}", ex);
                return Conflict(new
                {
                    error = "Failed to delete node due to a database constraint.",
                    detail = ex.InnerException?.Message ?? ex.Message
                });
            }
        }
    }
}