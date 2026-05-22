# CRUD Lifecycle (Nodes & Links)

## Purpose
This document explains the full end-to-end lifecycle of a Create, Read, Update, or Delete (CRUD) operation within the NetRoute system, tracking the flow from the React UI down to the SQL Server database.

## End-to-End Flow Example: Adding a Node

### 1. Frontend Interaction
- The user navigates to the Nodes page and clicks "Add Node".
- They fill out the `NodeForm` (Name, Type, X, Y) and click Save.

### 2. Custom Hook Invocation
- The component calls `createNode(data)` provided by the `useNodes` hook.
- `useNodes` manages the `loading` state, setting it to `true` to disable buttons and show spinners.

### 3. Axios Interceptor
- The hook triggers an Axios `POST /api/Nodes` request.
- The Axios interceptor intercepts the outgoing request, checks local storage, and attaches the JWT `Authorization: Bearer <token>` header.

### 4. Backend Controller
- `NodesController` receives the request.
- The `[Authorize]` attribute intercepts the request, validates the JWT signature, and decodes the user claims.
- ASP.NET automatically binds the JSON payload to the `NodeDto`.

### 5. Validation & EF Core
- The controller validates the DTO (e.g., ensuring Name is not null).
- It maps the DTO to a `Node` EF entity.
- `_context.Nodes.Add(node)` tracks the entity.
- `_context.SaveChangesAsync()` commits an `INSERT` statement to SQL Server.

### 6. Cache Invalidation
- Before returning the 200 OK response, the controller executes `_cache.Remove("NetworkGraph")`.
- This ensures the `GraphBuilderService` will rebuild its Adjacency List to include the new node on the next routing request.

### 7. Frontend State Update
- The Axios request completes successfully.
- `useNodes` appends the new node to its local `nodes` array state.
- `loading` is set back to `false`.
- The React UI re-renders, displaying the new node in the table instantly.
- A success toast notification is shown via `react-hot-toast`.
