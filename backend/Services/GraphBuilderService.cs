using FinalProject.Data;
using FinalProject.Graph;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace FinalProject.Services
{
    public class GraphBuilderService
    {
        private const string CacheKey = "NetworkGraph";

        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;

        public GraphBuilderService(
            AppDbContext context,
            IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<Graph.Graph> BuildGraphAsync()
        {
            // Check if graph exists in cache
            if (_cache.TryGetValue(CacheKey, out Graph.Graph? cachedGraph))
            {
                return cachedGraph!;
            }

            // Create empty graph
            var graph = new Graph.Graph();

            // Load all active nodes
            var nodes = await _context.Nodes
                .Where(n => n.IsActive)
                .ToListAsync();

            // Initialize adjacency list
            foreach (var node in nodes)
            {
                graph.AdjacencyList[node.Id] = new List<GraphEdge>();
            }

            // Load all active links
            var links = await _context.Links
                .Include(l => l.SourceNode)
                .Include(l => l.DestinationNode)
                .Where(l =>
                    l.IsActive &&
                    l.SourceNode != null &&
                    l.DestinationNode != null &&
                    l.SourceNode.IsActive &&
                    l.DestinationNode.IsActive)
                .ToListAsync();

            // Build adjacency list
            foreach (var link in links)
            {
                graph.AdjacencyList[link.SourceNodeId].Add(
                    new GraphEdge
                    {
                        ToNodeId = link.DestinationNodeId,
                        Cost = link.Cost
                    });
            }

            // Store graph in cache for 30 minutes
            _cache.Set(
                CacheKey,
                graph,
                TimeSpan.FromMinutes(30));

            return graph;
        }

        public void ClearCache()
        {
            _cache.Remove(CacheKey);
        }
    }
}