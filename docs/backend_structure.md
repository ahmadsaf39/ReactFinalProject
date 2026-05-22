# Backend Project Structure

Here is the directory and file structure of the **NetRoute Backend API** with a brief description of each component:

## Root Configuration
* `Program.cs` — Configures the application services, middleware pipeline, database connection, JWT authentication, CORS policies, and runs the web host.
* `appsettings.json` — Stores global configuration settings such as database connection strings, logging configuration, and JWT options.
* `appsettings.Development.json` — Stores local development configurations and overrides for the development environment.
* `FinalProject.csproj` — The project configuration file listing NuGet packages, dependencies, and target framework (.NET Core).
* `seed_data.sql` — SQL seed script used to pre-populate node and link records in the database with a realistic topology.

## Controllers (`/Controllers`)
* `AuthController.cs` — Contains endpoints for user authentication, including user registration and login token generation.
* `DashboardController.cs` — Provides dashboard-level analytics such as total nodes, total links, active simulations, and system status metrics.
* `LinksController.cs` — Implements CRUD (Create, Read, Update, Delete) endpoints to manage network links in the database.
* `NodesController.cs` — Implements CRUD (Create, Read, Update, Delete) endpoints to manage network nodes (routers, switches, hosts).
* `RoutingController.cs` — Implements the shortest path routing endpoint, using Dijkstra's algorithm to compute the path between source and target nodes.
* `SimulationController.cs` — Provides endpoints for managing simulation records, including saving simulation results, retrieval, and deletion.

## Data & Database (`/Data`)
* `AppDbContext.cs` — Database context mapping domain models to database tables using Entity Framework Core, detailing relationships and keys.

## Data Transfer Objects (`/DTOs`)
* `AuthResponseDto.cs` — DTO representing the user model and JWT access token returned to the client upon successful authentication.
* `LoginRequestDto.cs` — DTO containing user credentials (username and password) sent during login requests.
* `RegisterRequestDto.cs` — DTO containing details (username, email, password, full name) required for registering a new user.
* `RoutingResultDto.cs` — DTO representing the calculated path, hop cost list, total weight, and algorithm computation execution duration.

## Graph Data Structures (`/Graph`)
* `Graph.cs` — Class representation of the network topology graph containing lists of nodes and edges for routing computations.
* `GraphEdge.cs` — Represents a single directed/undirected edge connecting two nodes with an associated cost.

## Models (`/Models`)
* `AlgorithmType.cs` — Enum defining available routing algorithms (e.g., Dijkstra).
* `Link.cs` — Database entity representing a connection between two nodes, tracking bandwith, delay, cost, and source/target relationships.
* `Node.cs` — Database entity representing a network hardware device, containing coordinates (X, Y), IP address, and status.
* `NodeType.cs` — Enum defining types of network nodes (Router, Switch, Host).
* `Simulation.cs` — Database entity representing a saved routing simulation run.
* `SimulationPath.cs` — Database entity mapping simulation steps to specific path nodes, referencing the parent simulation.
* `User.cs` — Database entity representing a registered system user, storing username, email, and password hash.

## Middleware (`/Middleware`)
* `RequestLoggingMiddleware.cs` — Custom HTTP middleware that intercepts every request to log HTTP method, path, IP, response status code, execution duration, and username.

## Services (`/Services`)
* `DijkstraService.cs` — Implementation of Dijkstra's algorithm to compute the shortest routing path and total cost between nodes.
* `GraphBuilderService.cs` — Fetches node and link entities from the database to build a cacheable Graph representation.
* `JwtService.cs` — Generates, signs, and decodes JSON Web Tokens (JWT) for secure authentication.
* `PasswordService.cs` — Handles secure password hashing and verification using BCrypt.
* `ActivityLogger.cs` — Thread-safe custom logging service that writes structured system activity, user actions, and request telemetry to a local file.

## Generated Log Files (`/Logs`)
* `activity.log` — Text file where structured log entries (info, warnings, errors, and request tracking metadata) are saved.
