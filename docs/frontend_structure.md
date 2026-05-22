# Frontend Project Structure

Here is the directory and file structure of the **NetRoute React Frontend** with a brief description of each component:

## Root Configuration Files
* `package.json` — Manages project dependencies, scripts (start, dev, build), metadata, and package versions.
* `tsconfig.json` & `tsconfig.app.json` — Configuration files setting compiler choices, paths, and type checking rules for TypeScript.
* `vite.config.ts` — Vite compiler settings, asset configurations, plugin registrations, and development server port options.
* `index.html` — The main HTML template where the React application mounts.

## Core Application Files (`/src`)
* `src/main.tsx` — The application entry point rendering the React application to the DOM inside the root container.
* `src/App.tsx` — Configures the main React Router mapping URLs to pages, sets up protected routes, and handles layout wrap-around.
* `src/index.css` — Global styles setting margins, fonts, and baseline styling resets.
* `src/App.css` — Styling rules shared across layout headers, responsive elements, and components.

## API Services (`/src/api`)
* `axiosInstance.ts` — Configured Axios client with interceptors injecting JWT headers and handling automatic 401 token refresh.
* `authApi.ts` — HTTP request routines for user registration, user login, and user profile authentication checks.
* `dashboardApi.ts` — HTTP request routines fetching aggregate node, link, and simulation counts for stats grids.
* `nodesApi.ts` — HTTP request routines managing node records (fetching list, creating, updating, and deleting nodes).
* `linksApi.ts` — HTTP request routines managing link records (fetching list, creating, updating, and deleting links).
* `routingApi.ts` — HTTP request routine running the Dijkstra routing path calculations on the backend.
* `simulationApi.ts` — HTTP request routines saving, fetching history, and deleting simulation records.

## Layout Components (`/src/components/layout`)
* `Navbar.tsx` — The top navigation bar displaying link tabs for dashboard pages, active session info, and log out options.
* `PageWrapper.tsx` — Main wrapper container providing uniform margins, background colors, and responsive page heights.
* `ProtectedRoute.tsx` — Security wrapper guarding routes and redirecting non-authenticated users back to the login screen.

## Reusable UI Components (`/src/components/ui`)
* `Badge.tsx` — Custom tag component for displaying node roles or operational statuses.
* `Button.tsx` — Reusable, standardized styled button component.
* `StatCard.tsx` — Standardized display cards presenting dashboard metrics.
* `Table.tsx` — Reusable table layout wrapper for data lists.

## Context Providers (`/src/context`)
* `AuthContext.tsx` — React Context storing the active user session, handling login/logout events, and loading tokens on boot.

## Custom Hooks (`/src/hooks`)
* `useAuth.ts` — Syntactic hook providing component access to AuthContext methods (user state, login, logout).
* `useNodes.ts` — Abstracted hook handling nodes data fetching, cached states, editing, and form error states.
* `useLinks.ts` — Abstracted hook handling links data fetching, connection options, and validation states.
* `useRouting.ts` — Hook managing Dijkstra path parameters, coordinates mapping, algorithm execution, and reset states.
* `useSimulations.ts` — Hook managing the list of simulations, saving routes, and orchestrating simulation playback speeds.

## Features & Screens (`/src/features`)
### Authentication (`/src/features/auth`)
* `LoginPage.tsx` — Outer page template wrapper for the user authentication screen.
* `LoginForm.tsx` — Interactive login inputs with authentication request mapping and validation handling.
* `SignupPage.tsx` — Outer page template wrapper for user account registration.
* `SignupForm.tsx` — Interactive registration inputs validating passwords and creating user records.

### Dashboard (`/src/features/dashboard`)
* `Dashboard.tsx` — Home screen presenting summary stats, interactive action buttons, and system status charts.
* `StatsGrid.tsx` — Styled layout grid containing dashboard cards with active metric counters.

### Node Management (`/src/features/nodes`)
* `NodesPage.tsx` — Screen wrapper for node administration with add forms and list views.
* `NodeForm.tsx` — Pop-up dialog containing validation forms for creating or modifying node coordinates and configurations.
* `NodeTable.tsx` — Organized list of nodes with pagination, search filtration, and editing actions.

### Link Management (`/src/features/links`)
* `LinksPage.tsx` — Screen wrapper for link administration.
* `LinkForm.tsx` — Dialog form linking two nodes with bandwidth, delay, and weight parameters.
* `LinkTable.tsx` — List of existing connections showing node names, weights, and modification triggers.

### Path Routing (`/src/features/routing`)
* `RoutingPage.tsx` — Interactive Dijkstra sandbox screen with node selections, results summaries, and step animation playback.
* `GraphCanvas.tsx` — Advanced HTML5 Canvas canvas plotting node entities, link lines, and highlighted paths.
* `PathResult.tsx` — Side drawer displaying computed routing hops, total costs, and execution details.

### Simulation Library (`/src/features/simulation`)
* `SimulationPage.tsx` — Screen listing previously saved simulation routes.
* `SimulationTable.tsx` — Detailed list of simulation records with options to replay paths in the canvas.

### Topology Map (`/src/features/network`)
* `NetworkMapPage.tsx` — Page wrapper hosting the full, standalone network topology map view.
* `NetworkGraph.tsx` — Customized canvas graph displaying all nodes, link connections, weights, and zoom/pan toolsets.

## Utility Helpers (`/src/utils`)
* `tokenStorage.ts` — Securely loads, updates, or deletes authentication JWT keys from the browser's localStorage.
* `formatCost.ts` — Standardizes weight/cost numbers into readable routing metric formats.
* `formatMs.ts` — Standardizes milliseconds into readable floating-point execution time formats.

## TypeScript Types (`/src/types`)
* `Auth.ts` — Interfaces mapping authentication payloads, login data, and account details.
* `Node.ts` — Interfaces defining node models, spatial coordinates, and enum types.
* `Link.ts` — Interfaces defining connection details, costs, and node links.
* `RoutingResult.ts` — Interfaces mapping path results, cost breakdowns, and elapsed execution times.
* `Simulation.ts` — Interfaces mapping saved simulations and simulation path steps.
