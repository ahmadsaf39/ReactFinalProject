# Simulations System

## Purpose
The Simulations system tracks, persists, and provides historical analysis of every routing algorithm execution. Instead of just calculating a path and throwing the data away, NetRoute saves the exact execution details to the database.

## Architecture

When a user requests a route via `POST /api/Routing`, the `RoutingController` delegates to the `DijkstraService`.
The service does not return a simple string or array. It builds a complex `Simulation` entity.

### The Simulation Entity
A `Simulation` record tracks:
- `Algorithm`: The algorithm used (e.g., Dijkstra).
- `TotalCost`: The mathematical distance of the shortest path.
- `ExecutionTimeMs`: Captured via `System.Diagnostics.Stopwatch` inside the algorithm loop.
- `VisitedNodes`: The number of nodes dequeued from the Priority Queue.
- `EdgeRelaxations`: The number of times a shorter path to a node was discovered.
- `PathFound`: Boolean indicating success or failure (e.g., if a node was isolated).

### Simulation Paths
A `Simulation` has a one-to-many relationship with `SimulationPath`.
Each `SimulationPath` represents a single "step" in the final calculated route, storing the `NodeId` and the `StepOrder`.
This allows the frontend to reconstruct and animate the exact path step-by-step on the Graph Canvas.

## Database Transactions & Persistence
Saving a Simulation involves inserting 1 Simulation row and $N$ SimulationPath rows. 
Entity Framework's `_context.SaveChangesAsync()` automatically wraps these inserts in a database transaction. If the database crashes while saving step 3 of 10, the entire transaction rolls back, preventing corrupted half-saved simulations.

## Visualization
The `SimulationPage` in React fetches all historical simulations (`GET /api/Routing/simulations`) and displays them in a data grid, allowing network administrators to analyze routing efficiency and algorithm execution times over the lifetime of the network.
