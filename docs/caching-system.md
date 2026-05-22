# Memory Caching System

## Purpose
Network routing requires an Adjacency List (a mathematical representation of nodes and edges). Building this list requires fetching every single Node and Link from the SQL database and looping over them. Doing this on every single routing request would cripple the database.

## Implementation: IMemoryCache
We implemented Microsoft's `IMemoryCache` inside the `GraphBuilderService`.

### The Cache Flow
1. User requests a route from Node A to Node B.
2. `DijkstraService` asks `GraphBuilderService` for the graph.
3. `GraphBuilderService` checks RAM: `cache.TryGetValue("NetworkGraph", out graph)`.
4. **Cache Hit:** The graph is instantly returned in $O(1)$ time. Zero database queries are executed.
5. **Cache Miss:** The service queries EF Core, builds the adjacency dictionary, stores it in `cache.Set("NetworkGraph", graph)` with a 30-minute expiration, and returns it.

## Cache Invalidation Strategy
A cache is only useful if it's accurate. If an admin deletes a Node, the cached graph is instantly wrong, and Dijkstra might try to route through a deleted node.

**Solution:**
Whenever a modification occurs, we evict the cache.
In `NodesController.cs` and `LinksController.cs`, inside every `[HttpPost]`, `[HttpPut]`, and `[HttpDelete]` endpoint, we inject the cache and call:
`_cache.Remove("NetworkGraph");`

This guarantees that the next routing request will experience a Cache Miss, forcing a fresh database read to rebuild the graph with the updated topology.

## Performance Impact
By implementing this cache, we reduced database load for routing algorithms by roughly 99%. The routing endpoint is now completely CPU-bound (running Dijkstra in memory) rather than I/O bound.
