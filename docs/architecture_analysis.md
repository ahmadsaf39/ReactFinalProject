# 🧠 Complete Project Architecture Analysis

This document serves as a deep-dive educational analysis of the entire Network Routing Simulation project. It breaks down the architecture, request lifecycles, debugging lessons, and current state.

---

## 1. Current Architecture Overview
The project is a modern Full-Stack web application.
- **Backend**: Built with **ASP.NET Core 10 Web API** using C#. It uses **Entity Framework Core** with **SQL Server** for the database. Authentication is handled via stateless **JWT (JSON Web Tokens)**.
- **Frontend**: A Single Page Application (SPA) built with **React 19, TypeScript, and Vite**. Styling and components are powered by **Material UI (MUI v5)**.
- **Integration**: The frontend communicates with the backend via RESTful JSON APIs using **Axios**.

## 2. Frontend Structure Explanation
The React application follows a feature-based architecture combined with global utilities:
- `src/api/`: Contains Axios configuration (`axiosInstance.ts`) and discrete API wrappers (e.g., `nodesApi.ts`, `routingApi.ts`).
- `src/context/`: Contains `AuthContext.tsx`, providing user session state system-wide.
- `src/features/`: Isolated feature modules. For example, `routing/` contains the `RoutingPage`, `GraphCanvas`, and `PathResult`.
- `src/hooks/`: Custom React hooks (e.g., `useRouting`, `useSimulations`) that encapsulate local state, loading indicators, error handling, and API calls.
- `src/types/`: TypeScript interfaces that perfectly mirror backend DTOs to enforce strict typing.
- `src/utils/`: Pure utility functions like `formatCost` and `tokenStorage`.

## 3. Backend Structure Explanation
The ASP.NET Core project follows the classic Controller-Service-Repository pattern (though EF Core acts as the repository):
- `Controllers/`: HTTP endpoints (`NodesController`, `RoutingController`) that handle HTTP validation, authorization, and audit logging.
- `Middleware/`: Interceptor pipelines (`RequestLoggingMiddleware`) capturing HTTP diagnostics, response durations, and username contexts.
- `Services/`: Core business logic isolated from HTTP concerns (`DijkstraService` for algorithms, `GraphBuilderService` for caching, `JwtService` for auth, and `ActivityLogger` for thread-safe file logging).
- `Data/`: `AppDbContext` configures database sets and Entity Framework relationships.
- `Models/`: Domain entities mapping directly to SQL tables (`Node`, `Link`, `Simulation`).
- `DTOs/`: Data Transfer Objects used to shape JSON requests/responses safely.
- `Logs/`: Local storage containing structured activity logs (`activity.log`) capturing system audit trails.

## 4. Authentication Flow Explanation
1. User submits `LoginForm` → hits `POST /api/Auth/login`.
2. Backend validates via `BCrypt` and returns a **short-lived Access Token (JWT)** and a **long-lived Refresh Token**.
3. Frontend stores these in `localStorage` via `tokenStorage.ts`.
4. On every subsequent app load, `AuthContext.tsx` reads the JWT and calls `GET /api/Auth/me` to fetch the user profile and restore the session in React state.
5. All protected endpoints require `[Authorize]` and validate the JWT signature.

## 5. Routing / Dijkstra Flow Explanation
1. User selects source and destination in `RoutingPage` and clicks "Run".
2. `useRouting.ts` calls `routingApi.dijkstra(src, dest)`.
3. `RoutingController` handles `GET /api/Routing/dijkstra`.
4. It calls `GraphBuilderService.BuildGraphAsync()` which checks `IMemoryCache`. If empty, it queries the DB, builds an adjacency list, and caches it.
5. `DijkstraService.FindShortestPath()` runs the algorithm using a `PriorityQueue`, tracking execution time and visited nodes.
6. `RoutingController` logs the result to the DB as a `Simulation` with `SimulationPath` records.
7. Backend returns `RoutingResultDto` to the frontend, which renders metrics and the `GraphCanvas`.

## 6. Graph Visualization Explanation
`GraphCanvas.tsx` is an HTML5 `<canvas>` component. It is used instead of SVG for better performance with glowing shadow effects.
- **Layout Engine**: If all nodes have (0,0) coordinates, it automatically arranges them in a perfect circle using trigonometry. Otherwise, it scales real X/Y coordinates to fit the canvas dimensions.
- **Rendering**: It draws glowing blue edges with arrowheads for the shortest path. Nodes are drawn as circles (Green for source, Amber for destination, Blue for intermediate paths).
- **HiDPI**: It scales the canvas using `window.devicePixelRatio` so lines remain perfectly crisp on Retina displays.

## 7. Database Relationships (EF Core)
- **Node to Link**: A Node has many `SourceLinks` and `DestinationLinks`. EF Core is configured with `DeleteBehavior.Restrict` for Links. The backend manually deletes connected links inside a transaction before deleting a Node to prevent orphaned records safely.
- **Simulation to Path**: A `Simulation` has many `SimulationPath` records. Configured with `DeleteBehavior.Cascade` so deleting a simulation automatically cleans up its child paths.

## 8. CRUD Flow Explanation
Example: Creating a Node.
1. User submits `NodeForm`.
2. `useNodes.createNode(payload)` sets `loading = true` and calls `nodesApi.create(payload)`.
3. `POST /api/Nodes` validates the payload.
4. `NodesController` saves the entity via `_context.Nodes.Add()`.
5. Crucially, it calls `_graphBuilder.ClearCache()` so the routing engine knows the network changed.
6. Backend returns the new node. `useNodes` appends it to React state. UI updates instantly.

## 9. Axios Interceptor Explanation
Located in `axiosInstance.ts`, interceptors act as middleware for all API requests.
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` to every request.
- **Response Interceptor**: Catches `401 Unauthorized` errors globally. If an access token expires, it pauses the request, calls `POST /api/Auth/refresh-token`, updates `localStorage` with new tokens, and **replays** the original failed request seamlessly without the user noticing. If the refresh fails, it redirects to `/login`.

## 10. Cache System Explanation
Building a graph from SQL tables every time a user requests a route is expensive.
`GraphBuilderService` queries active Nodes/Links, constructs an `AdjacencyList`, and saves it into `IMemoryCache` for 30 minutes. Whenever a Node or Link is created, updated, or deleted, the respective controller calls `ClearCache()`. This ensures the algorithm always runs instantly on O(1) memory lookups while remaining perfectly synchronized with the DB.

---

## 11. Important Bugs Encountered Previously
1. **The Phantom Logout**: `AuthContext` was calling `/api/Auth/me` on mount, but that endpoint didn't exist. It returned a 404, triggering the interceptor to clear tokens and log the user out on every page reload.
2. **Open Data Leak**: None of the core controllers (`Nodes`, `Links`, `Routing`, `Simulation`) had `[Authorize]` attributes. Anyone could hit the API via Postman without logging in.
3. **Simulation Deletion Crash**: Deleting a Simulation from the table threw a Foreign Key Constraint error from SQL Server.
4. **Enum Integer Serialization**: `Simulation.Algorithm` was returning as integer `0` instead of the string `"Dijkstra"`, breaking the UI chip.
5. **Tailwind Misdiagnosis**: Early analysis assumed Tailwind was missing because of `className="flex"` usage, but it was actually properly configured via Vite v4 plugin.
6. **Icon Resolution Error**: MUI icons like `CheckCircleOutlineIcon` failed to compile because the actual NPM package filename was `CheckCircleOutlined`.

## 12. How Those Bugs Were Fixed
1. Created `[HttpGet("me")]` in `AuthController.cs` reading user ID from `ClaimTypes.NameIdentifier`.
2. Added `[Authorize]` class-level attributes to all 5 protected backend controllers.
3. Added `OnDelete(DeleteBehavior.Cascade)` to `AppDbContext.cs` for `SimulationPath` and ran an EF migration.
4. Registered `JsonStringEnumConverter` in `Program.cs`.
5. Ignored the Tailwind assumption; it was working fine.
6. Fixed the import path strings in `StatsGrid.tsx` and `SimulationTable.tsx` to match exact filesystem names.

---

## 13. Important Engineering Decisions
- **Segregation of Concerns**: Dijkstra logic was placed in `DijkstraService` instead of `RoutingController` to allow for easy unit testing and potential reuse.
- **Optimistic UI Updates**: In `useSimulations.ts`, deleting a simulation removes it from the local React state array immediately rather than triggering a full re-fetch of the table, saving bandwidth and feeling faster.
- **Centralized Error Handling**: A custom `extractError()` utility parses various Axios error shapes (strings, ProblemDetails, validation arrays) into a single human-readable string for `react-hot-toast` notifications.

## 14. Which Features Are Fully Completed
- **Authentication**: JWT Register, Login, Session Restore, Auto-Refresh Token.
- **Network Management**: Full CRUD for Nodes and Links, including validation (e.g., self-linking prevention).
- **Routing Engine**: Dijkstra algorithm execution, graph caching, path metric calculation.
- **Simulation History**: Database logging of runs, viewing in a data table, cascading deletion.
- **Dashboard**: Real-time aggregation of network statistics via SQL.
- **Visualization**: HTML5 Canvas rendering of the shortest path.
- **Diagnostics & Audit Trail**: Thread-safe file logging of all HTTP requests (method, route, IP, execution time) and semantic actions (user registrations, logins, Dijkstra executions, database modifications).

## 15. Which Features Are Partially Completed
- **None**. All requested baseline features are fully functional.

## 16. Which Features Are Still Missing
- The `AlgorithmType` enum contains `BellmanFord`, `BFS`, and `DFS`, but the UI and controllers currently only support `Dijkstra`.

## 17. Potential Future Improvements
- **Interactive Graph Editor**: Allow users to drag and drop nodes visually on the Canvas to create networks, rather than typing X/Y coordinates into a form.
- **Real-Time Sync**: Add SignalR/WebSockets so if User A adds a Node, User B's Dashboard updates instantly without clicking "Refresh".
- **Pagination**: The Simulation history table fetches all records at once. Adding server-side pagination would help scale to thousands of simulations.

## 18. Possible Weaknesses or Technical Debt
- **Cache Race Condition**: `GraphBuilderService` is registered as a `Scoped` dependency, but `IMemoryCache` is a `Singleton`. If 100 users request routing simultaneously on an empty cache, 100 scoped instances might all query the DB and build the graph before the first one populates the cache.
- **Heavy Includes**: `_context.Links.Include(l => l.SourceNode).Include(...)` in the graph builder is fine for small networks, but for a 10,000-link network, raw SQL or Dapper would be significantly faster than EF Core tracking.

## 19. Core Components to Understand for Demo/Presentation
If presenting this project, focus on:
1. **The Interceptor (`axiosInstance.ts`)**: Show how an expired token is seamlessly refreshed behind the scenes.
2. **Dijkstra Logic (`DijkstraService.cs`)**: Demonstrate the C# Priority Queue implementation and edge relaxation loop.
3. **Graph Rendering (`GraphCanvas.tsx`)**: Explain the math behind circular node layout and canvas drawing.
4. **Cache Invalidation**: Explain how adding a new Link safely clears the `IMemoryCache` so Dijkstra is always accurate.

## 20. The Core Files of the System
**Backend Core:**
- `FinalProject/Services/DijkstraService.cs` (Algorithm engine)
- `FinalProject/Services/GraphBuilderService.cs` (Cache & topology map)
- `FinalProject/Services/ActivityLogger.cs` (Audit log management)
- `FinalProject/Middleware/RequestLoggingMiddleware.cs` (Request diagnostic interception)
- `FinalProject/Controllers/RoutingController.cs` (Execution entry point)

**Frontend Core:**
- `src/api/axiosInstance.ts` (Network nervous system)
- `src/context/AuthContext.tsx` (Session heart)
- `src/features/routing/RoutingPage.tsx` (Main interaction layer)
- `src/features/routing/GraphCanvas.tsx` (Visualization engine)

---

# 🗺️ Roadmap & Final Status

### ✅ Production-Ready Now
- Core Architecture (EF Core + React hooks + API layer)
- Authentication & JWT Rotation Security
- Routing Math (Dijkstra)
- Database schema and integrity (Cascade rules)
- Responsive UI and visual layouts

### 🟡 Needs Polishing (Optional)
- X/Y Coordinate assignment is currently manual; most users will leave them as `0,0` which triggers the fallback circular layout.

### 🎯 Recommendation before Final Submission
The codebase is currently in excellent shape. **Do not attempt major refactoring.** The architecture is sound, the bugs are squashed, and the application compiles and runs flawlessly. The project is ready for submission/demo as is.
