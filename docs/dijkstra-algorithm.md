# Dijkstra's Algorithm Implementation

## Purpose
The core mathematical heart of NetRoute is calculating the shortest path between a source node and a destination node based on link weights (cost/distance). This is implemented in the `DijkstraService.cs` class.

## The Graph Data Structure
Before Dijkstra can run, the system needs an Adjacency List. 
This is handled by the `GraphBuilderService`, which constructs a `Dictionary<int, List<Edge>>` representing the graph, where the key is the `NodeId` and the value is a list of connected links. To optimize performance, this dictionary is cached in server RAM using `IMemoryCache`.

## Algorithm Flow

1. **Initialization:**
   - Create a `distances` dictionary mapping every node to `infinity`, except the source node which is `0`.
   - Create a `previous` dictionary to reconstruct the path later.
   - Create a `PriorityQueue` (using .NET's built-in `PriorityQueue<TElement, TPriority>`) to explore nodes with the smallest known distance first.
   - Enqueue the source node.

2. **Exploration (Relaxation):**
   - Dequeue the node with the lowest distance (let's call it `current`).
   - If `current` is the destination, the algorithm halts early (optimization).
   - For every edge connected to `current`:
     - Calculate `newDist = distances[current] + edge.Cost`.
     - If `newDist < distances[edge.TargetNode]`, update `distances[edge.TargetNode]` and enqueue the target node with the new priority.

3. **Path Reconstruction:**
   - Starting from the destination node, use the `previous` dictionary to trace backward to the source.
   - Reverse the list to get the chronological path.

## Pseudocode / C# Implementation

```csharp
public Simulation RunDijkstra(int sourceId, int destId, Dictionary<int, List<Edge>> graph) 
{
    var distances = new Dictionary<int, double>();
    var previous = new Dictionary<int, int>();
    var priorityQueue = new PriorityQueue<int, double>();

    foreach (var node in graph.Keys) distances[node] = double.MaxValue;
    distances[sourceId] = 0;
    priorityQueue.Enqueue(sourceId, 0);

    int visitedNodes = 0;
    int edgeRelaxations = 0;

    while (priorityQueue.Count > 0) {
        int current = priorityQueue.Dequeue();
        visitedNodes++;

        if (current == destId) break; 

        foreach (var edge in graph[current]) {
            double newDist = distances[current] + edge.Cost;
            if (newDist < distances[edge.TargetId]) { 
                distances[edge.TargetId] = newDist;
                previous[edge.TargetId] = current;
                priorityQueue.Enqueue(edge.TargetId, newDist);
                edgeRelaxations++;
            }
        }
    }
    return BuildPathAndSimulation(previous, destId, visitedNodes, edgeRelaxations);
}
```

## Performance Tracking
The implementation explicitly tracks `visitedNodes`, `edgeRelaxations`, and `executionTimeMs` via a `Stopwatch`. This data is saved to the `Simulation` entity to allow users to analyze algorithm efficiency.
