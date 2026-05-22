# 🔍 Full Code Review — Network Routing Project

## Project Overview
- **Backend**: ASP.NET Core 8 Web API (C#) — `c:\Users\Pc\source\repos\FinalProject\FinalProject`
- **Frontend**: React + TypeScript (Vite + MUI) — `d:\FinalReactProject\network-routing-frontend`
- **Database**: SQL Server via Entity Framework Core

---

## 🔴 CRITICAL BUGS & ERRORS

### 1. Backend — `AuthController` calls a non-existent `/api/Auth/me` endpoint
**File**: There is NO `[HttpGet("me")]` action in `AuthController.cs`, but the frontend calls it.

**Frontend calls**: `GET /api/Auth/me` (in `authApi.ts` line 33 and `AuthContext.tsx` line 16)

**Backend has**: Only `register`, `login`, and `refresh-token` endpoints.

**Effect**: Every page refresh throws a 404 error. `AuthContext` catches it and clears the token, logging the user out silently on every page reload.

**Fix needed in `AuthController.cs`**:
```csharp
// Add this action:
[HttpGet("me")]
[Authorize]
public async Task<IActionResult> Me()
{
    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var user = await _context.Users.FindAsync(userId);
    if (user == null) return Unauthorized();
    return Ok(new { id = user.Id, username = user.Username, email = user.Email, isAdmin = user.IsAdmin });
}
```

---

### 2. Backend — `AuthController` has no `[Authorize]` attribute on protected endpoints
**Files**: `NodesController.cs`, `LinksController.cs`, `RoutingController.cs`, `SimulationController.cs`, `DashboardController.cs`

**Issue**: None of these controllers have `[Authorize]` attribute. Any unauthenticated user can access all data.

**Fix**: Add `[Authorize]` attribute to all protected controllers.

---

### 3. Frontend — `routingApi.ts` and `simulationApi.ts` are empty stubs
**Files**:
- `src/api/routingApi.ts` — returns `{} as any` (not connected to backend)
- `src/api/simulationApi.ts` — returns `[] as any[]` (not connected to backend)
- `src/hooks/useRouting.ts` — returns `{} as any`
- `src/hooks/useSimulations.ts` — returns `[] as any[]`

**Effect**: The **Routing page** and **Simulation page** are completely non-functional stubs. They just show plain text "Routing" and "Simulation".

---

### 4. Frontend — `Dashboard.tsx` and `StatsGrid.tsx` are empty stubs
**Files**:
- `src/features/dashboard/Dashboard.tsx` — only shows `<div>Dashboard</div>`
- `src/features/dashboard/StatsGrid.tsx` — only shows `<div>StatsGrid</div>` (68 bytes)

**Effect**: The main dashboard page shows no data. The `GET /api/Dashboard` endpoint exists but is never called.

---

### 5. Frontend — `RoutingResult.ts` type is empty
**File**: `src/types/RoutingResult.ts`
```ts
export interface RoutingResult {}  // ← completely empty!
```
**Effect**: The routing result from Dijkstra (`pathFound`, `pathNodeIds`, `totalCost`, etc.) has no TypeScript type definition.

**Fix needed**:
```ts
export interface RoutingResult {
  pathFound: boolean;
  pathNodeIds: number[];
  totalCost: number;
  executionTimeMs: number;
  visitedNodes: number;
  edgeRelaxations: number;
  algorithm: string;
}
```

---

### 6. Frontend — `Simulation.ts` type is empty
**File**: `src/types/Simulation.ts`
```ts
export interface RoutingResult {}  // ← wrong name AND empty!
```
**Effect**: No type for simulation history data.

---

### 7. Backend — `GraphBuilderService` is `Scoped` but `IMemoryCache` is `Singleton` — potential race condition
**File**: `Program.cs` line 23, `GraphBuilderService.cs`

The graph cache uses `IMemoryCache` (singleton) correctly. However `GraphBuilderService` is registered as `Scoped`. This is fine architecturally, but the cache key is a static string `"NetworkGraph"`. If multiple users trigger simultaneous requests, the graph may be built twice before cache is populated. This is a minor race condition (not a crash, but wasteful).

---

### 8. Backend — `Link.Cost` is `int` but `GraphEdge.Cost` is `double` — silent precision inconsistency
**File**: `Models/Link.cs` (Cost is `int`), `Graph/GraphEdge.cs` (Cost is `double`), `GraphBuilderService.cs` line 64

The assignment `Cost = link.Cost` implicitly converts int→double (safe). However, the `Simulation.TotalCost` is `double` while costs are integers, which is technically fine but can cause confusion in the UI.

---

### 9. Frontend — `LoginForm` and `SignupForm` use Tailwind CSS classes (e.g., `className="flex items-center..."`) but there's NO Tailwind configured
**Files**: `LoginForm.tsx`, `SignupForm.tsx`, `Navbar.tsx`, `ProtectedRoute.tsx`

The `package.json` and `vite.config.ts` don't include Tailwind. All `className` attributes with Tailwind utility classes (e.g., `flex`, `items-center`, `min-h-screen`, `bg-gradient-to-br`, `text-slate-400`) will have **no effect**.

**Effect**: Login/Signup/Navbar layout is broken — it relies on Tailwind but gets no styles. The dark gradient background won't render.

---

### 10. Frontend — `apiRoutes.ts` has `/api/Auth/logout` but no logout endpoint exists on backend
**File**: `src/constants/apiRoutes.ts` line 7

```ts
logout: '/api/Auth/logout',  // ← this endpoint doesn't exist in AuthController
```
The `authApi.logout()` just does `Promise.resolve()` so it never actually calls this URL, but it's misleading dead code.

---

## 🟡 WARNINGS & IMPROVEMENTS NEEDED

### 11. Backend — JWT key exposed in `appsettings.json`
**File**: `appsettings.json` line 7

```json
"Key": "ThisIsMySuperSecretKeyForNetworkRoutingProject2026"
```
Should be moved to user secrets or environment variables, never committed to source control.

### 12. Backend — No `[FromBody]` on `RefreshToken` endpoint parameter
**File**: `AuthController.cs` line 153

```csharp
public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
```
Sending a raw JSON string works but is unusual. The frontend sends `JSON.stringify(refreshToken)` which produces `"\"tokenvalue\""` — double-encoded. This may cause the backend to receive `null` or fail to parse depending on the content-type.

### 13. Frontend — `NodeForm` doesn't expose `x` and `y` fields to the user
**File**: `src/features/nodes/NodeForm.tsx` line 42-43

```ts
x: initialData?.x ?? 0,  // always defaults to 0
y: initialData?.y ?? 0,  // always defaults to 0
```
Node coordinates default to 0 and can never be changed through the UI. This is a problem for the graph visualization that needs coordinates.

### 14. Frontend — `useLinks` and `useNodes` call `setLoading(true)` during CRUD but don't reset it properly on throw
In `useNodes.ts` and `useLinks.ts`, the `finally` block correctly resets `loading`. However, these hooks can cause flickering because the shared `loading` state is used for both fetch and mutations simultaneously.

### 15. Backend — `SimulationController.Delete` doesn't delete related `SimulationPath` records
**File**: `SimulationController.cs` line 53

```csharp
_context.Simulations.Remove(simulation);
```
`SimulationPath` records have a FK to `Simulation`. If cascade delete is not configured for this relationship, this will throw a FK constraint error. The `AppDbContext` only configures `Link→Node` cascade behavior, not `SimulationPath→Simulation`.

### 16. Backend — `NodesController.Create` and `LinksController.Create` accept the full entity without input validation DTO
**Files**: `NodesController.cs` line 46, `LinksController.cs` line 53

These accept raw `Node` and `Link` model objects directly. A malicious client could set `Id` to bypass the auto-increment, or set navigation properties.

### 17. Frontend — Missing loading state in `NodesPage` initial load
**File**: `NodesPage.tsx` — shows an empty table while nodes are loading instead of a spinner like `LinksPage.tsx` does.

---

## ✅ WHAT IS WORKING WELL

- **Auth flow** (register/login/refresh token) — backend logic is solid
- **Dijkstra algorithm** — correct implementation with proper priority queue
- **Graph builder** with memory cache and cache invalidation on mutations
- **Node CRUD** — fully wired frontend ↔ backend
- **Link CRUD** — fully wired with good validation (self-link prevention, cost validation)
- **Axios interceptor** — auto refresh token on 401 is well implemented
- **Error extraction** — `extractError` utility in `useNodes`/`useLinks` handles multiple error formats
- **Delete node** — correctly removes related links first, then node in a transaction
- **DB relationships** — `Restrict` cascade on Link→Node prevents orphaned links

---

## 📋 SUMMARY OF WHAT NEEDS TO BE BUILT/FIXED

| Priority | Item |
|----------|------|
| 🔴 Critical | Add `GET /api/Auth/me` endpoint to backend |
| 🔴 Critical | Implement `RoutingPage` with Dijkstra form + result display |
| 🔴 Critical | Implement `SimulationPage` with simulation history table |
| 🔴 Critical | Implement `Dashboard` with stats from `/api/Dashboard` |
| 🔴 Critical | Fix Tailwind CSS not being installed (or replace className with MUI sx) |
| 🔴 Critical | Add `routingApi.ts` real implementation |
| 🔴 Critical | Add `simulationApi.ts` real implementation |
| 🔴 Critical | Fill in `RoutingResult` and `Simulation` TypeScript interfaces |
| 🟡 Warning | Add `[Authorize]` to all protected controllers |
| 🟡 Warning | Add `x`/`y` coordinate inputs to `NodeForm` |
| 🟡 Warning | Fix SimulationPath cascade delete |
| 🟡 Warning | Move JWT key to environment variable |

---

---

# 🤖 GEMINI CONTINUATION PROMPT

Copy this entire prompt and give it to Gemini to continue building the project:

---

```
You are continuing development of a Network Routing Simulation web application.

## Project Structure

### Backend (ASP.NET Core 8, C#)
Path: c:\Users\Pc\source\repos\FinalProject\FinalProject

Already implemented:
- Models: Node, Link, User, Simulation, SimulationPath, AlgorithmType, NodeType
- DbContext: AppDbContext with SQL Server (NetworkRoutingDB)
- Controllers: AuthController (register/login/refresh-token), NodesController (CRUD), LinksController (CRUD), RoutingController (GET dijkstra), SimulationController (GET all/by-id/delete), DashboardController (GET stats)
- Services: DijkstraService, GraphBuilderService (with IMemoryCache), JwtService, PasswordService (BCrypt)
- DTOs: AuthResponseDto, LoginRequestDto, RegisterRequestDto, RoutingResultDto
- Graph: Graph.cs, GraphEdge.cs

### Frontend (React + TypeScript + Vite + MUI v5)
Path: d:\FinalReactProject\network-routing-frontend

Already implemented:
- Auth: LoginForm, SignupForm, AuthContext, tokenStorage, JWT refresh interceptor
- Nodes: NodesPage, NodeTable, NodeForm, useNodes hook, nodesApi
- Links: LinksPage, LinkTable, LinkForm, useLinks hook, linksApi
- Types: Node.ts (with NodeType enum), Link.ts, Auth.ts
- Layout: Navbar, PageWrapper, ProtectedRoute
- Constants: apiRoutes.ts (API_BASE_URL = 'https://localhost:7161')

## Tasks To Complete

### Task 1: Fix the /api/Auth/me endpoint (Backend)
Add this endpoint to AuthController.cs. It's required by the frontend's AuthContext on every page load to restore user session. Use `[Authorize]` attribute and read the user ID from JWT claims:

```csharp
[HttpGet("me")]
[Authorize]
public async Task<IActionResult> Me()
{
    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var user = await _context.Users.FindAsync(userId);
    if (user == null) return Unauthorized();
    return Ok(new { id = user.Id, username = user.Username, email = user.Email, isAdmin = user.IsAdmin });
}
```
Add `using System.Security.Claims;` and `using Microsoft.AspNetCore.Authorization;` to the using directives.

### Task 2: Add [Authorize] to all protected controllers (Backend)
Add `[Authorize]` attribute to the class-level of: NodesController, LinksController, RoutingController, SimulationController, DashboardController.

### Task 3: Fix SimulationPath cascade delete (Backend)
In AppDbContext.cs OnModelCreating, add cascade delete for SimulationPath so deleting a Simulation also deletes its paths:
```csharp
modelBuilder.Entity<SimulationPath>()
    .HasOne(sp => sp.Simulation)
    .WithMany(s => s.PathNodes)
    .HasForeignKey(sp => sp.SimulationId)
    .OnDelete(DeleteBehavior.Cascade);
```

### Task 4: Fix Tailwind CSS issue (Frontend)
The LoginForm.tsx, SignupForm.tsx, and Navbar.tsx use Tailwind CSS class names (flex, items-center, min-h-screen, bg-gradient-to-br, text-slate-400, etc.) but Tailwind is NOT installed.

Option A: Install Tailwind CSS v3:
- Run: npm install -D tailwindcss@3 postcss autoprefixer
- Run: npx tailwindcss init -p
- Configure tailwind.config.js content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
- Add to index.css: @tailwind base; @tailwind components; @tailwind utilities;

Option B (alternative): Replace className attributes in LoginForm, SignupForm, Navbar with MUI sx props.

Choose Option A (install Tailwind v3) since the existing JSX already uses Tailwind class names extensively.

### Task 5: Complete RoutingResult and Simulation TypeScript types (Frontend)
Replace the contents of src/types/RoutingResult.ts:
```typescript
export interface RoutingResult {
  pathFound: boolean;
  pathNodeIds: number[];
  totalCost: number;
  executionTimeMs: number;
  visitedNodes: number;
  edgeRelaxations: number;
  algorithm: string;
}
```

Replace the contents of src/types/Simulation.ts:
```typescript
export interface SimulationPath {
  id: number;
  simulationId: number;
  nodeId: number;
  stepOrder: number;
}

export interface Simulation {
  id: number;
  sourceNodeId: number;
  destinationNodeId: number;
  algorithm: string;
  totalCost: number;
  executionTimeMs: number;
  visitedNodes: number;
  edgeRelaxations: number;
  pathFound: boolean;
  createdAt: string;
  pathNodes: SimulationPath[];
}
```

### Task 6: Implement routingApi.ts (Frontend)
Replace src/api/routingApi.ts with a proper implementation that calls GET /api/Routing/dijkstra?sourceNodeId=X&destinationNodeId=Y and returns RoutingResult.

### Task 7: Implement simulationApi.ts (Frontend)
Replace src/api/simulationApi.ts with proper implementation calling GET /api/Simulation, GET /api/Simulation/{id}, DELETE /api/Simulation/{id}.

### Task 8: Implement useRouting hook (Frontend)
Replace src/hooks/useRouting.ts with a proper hook that:
- Has state: result (RoutingResult | null), loading (boolean), error (string | null)
- Has function: runDijkstra(sourceNodeId: number, destinationNodeId: number) — calls routingApi
- Shows toast on success ("Path found!") or error

### Task 9: Implement useSimulations hook (Frontend)
Replace src/hooks/useSimulations.ts with a proper hook that:
- Has state: simulations (Simulation[]), loading (boolean)
- Fetches all simulations on mount
- Has deleteSimulation(id: number) function

### Task 10: Implement RoutingPage (Frontend)
Replace src/features/routing/RoutingPage.tsx with a full implementation:
- Two dropdown selects for Source Node and Destination Node (populated from useNodes)
- A "Run Dijkstra" button
- After running, display results:
  - Path Found: Yes/No chip
  - Path: node names joined with → arrows
  - Total Cost (formatted as meters)
  - Execution Time (formatted as ms)
  - Visited Nodes count
  - Edge Relaxations count
- Show a visual path display highlighting the nodes visited
- Use MUI components (Card, Select, Typography, Chip, Alert)
- Use the existing useNodes hook to get nodes for dropdowns
- Use useRouting hook for the algorithm execution
- Show loading spinner while computing

### Task 11: Implement SimulationPage (Frontend)
Replace src/features/simulation/SimulationPage.tsx with a full implementation:
- Display a table of all past simulations from the API
- Columns: ID, Source→Destination, Algorithm, Path Found, Total Cost, Exec Time ms, Visited Nodes, Date
- Show node names (look them up from useNodes) instead of raw IDs
- Add a delete button per row
- Sort by most recent first (already handled by backend)
- Show empty state message when no simulations exist
- Use MUI Table components
- Replace src/features/simulation/SimulationTable.tsx with actual implementation

### Task 12: Implement Dashboard (Frontend)
Replace src/features/dashboard/Dashboard.tsx with a full implementation:
- Fetch stats from GET /api/Dashboard using axiosInstance
- Show stat cards for: Total Nodes, Total Links, Total Simulations, Active Nodes, Inactive Nodes, Average Link Cost
- Use MUI Card components in a responsive grid (3 columns on desktop, 1 on mobile)
- Add icons for each stat (use @mui/icons-material)
- Show loading skeletons while fetching
- Replace src/features/dashboard/StatsGrid.tsx with actual implementation

### Task 13: Add x/y coordinate inputs to NodeForm (Frontend)
In src/features/nodes/NodeForm.tsx, add two number input fields for X and Y coordinates so nodes can have real positions for future graph visualization.

## API Endpoints Reference

Backend runs on: https://localhost:7161
All protected endpoints require: Authorization: Bearer {jwt_token}

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/Auth/register | Register |
| POST | /api/Auth/login | Login |
| POST | /api/Auth/refresh-token | Refresh JWT |
| GET | /api/Auth/me | Get current user (needs to be created) |
| GET | /api/Nodes | Get all nodes |
| POST | /api/Nodes | Create node |
| PUT | /api/Nodes/{id} | Update node |
| DELETE | /api/Nodes/{id} | Delete node (also deletes related links) |
| GET | /api/Links | Get all links (includes source/dest node names) |
| POST | /api/Links | Create link |
| PUT | /api/Links/{id} | Update link |
| DELETE | /api/Links/{id} | Delete link |
| GET | /api/Routing/dijkstra?sourceNodeId=X&destinationNodeId=Y | Run Dijkstra |
| GET | /api/Simulation | Get all simulations |
| GET | /api/Simulation/{id} | Get simulation by ID |
| DELETE | /api/Simulation/{id} | Delete simulation |
| GET | /api/Dashboard | Get dashboard stats |

## Dashboard Response Shape
```json
{
  "totalNodes": 10,
  "totalLinks": 15,
  "totalSimulations": 8,
  "activeNodes": 9,
  "inactiveNodes": 1,
  "averageLinkCost": 342.5
}
```

## RoutingResult Response Shape
```json
{
  "pathFound": true,
  "pathNodeIds": [1, 3, 7, 10],
  "totalCost": 850.0,
  "executionTimeMs": 0.45,
  "visitedNodes": 6,
  "edgeRelaxations": 12,
  "algorithm": "Dijkstra"
}
```

## Important Notes
- Frontend uses MUI v5 for all UI components
- Frontend uses react-hot-toast for notifications
- All API calls go through src/api/axiosInstance.ts (which handles auth headers and token refresh)
- Use the existing extractError pattern from useNodes.ts for error handling in new hooks
- The project uses TypeScript strictly — avoid 'any' types
- Tailwind CSS needs to be installed (see Task 4)
```
```
