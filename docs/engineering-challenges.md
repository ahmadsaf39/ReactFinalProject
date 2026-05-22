# Engineering Challenges & Bug Fixes

## Purpose
This document serves as an archive of major technical hurdles overcome during the development of NetRoute. It explains the symptoms, root cause, and engineering solution for critical bugs.

---

## 1. The JSON Serialization Cycle Crash
**Symptoms:** 
When navigating to the Simulations page, the backend returned a `500 Internal Server Error`, specifically: `System.Text.Json.JsonException: A possible object cycle was detected.`

**Root Cause:**
Entity Framework navigation properties created an infinite loop. The `Simulation` entity contained a collection of `SimulationPath` (PathNodes). Each `SimulationPath` contained a back-reference to its parent `Simulation`. The JSON serializer bounced back and forth between them endlessly until it crashed.

**Solution:**
We added the `[JsonIgnore]` attribute to the `Simulation` property inside the `SimulationPath.cs` model. This tells the JSON serializer to ignore the back-reference, breaking the loop, while perfectly preserving EF Core's ability to use the relationship for SQL `Include()` queries.

---

## 2. Foreign Key Constraint Delete Crash
**Symptoms:**
Attempting to delete a Simulation from the UI threw a database constraint error, refusing the deletion.

**Root Cause:**
SQL Server strictly enforces referential integrity. We were trying to `DELETE FROM Simulations WHERE Id = X`, but rows in the `SimulationPaths` table still referenced that `Id`.

**Solution:**
We modified the Entity Framework `DbContext` to enforce Cascade Deletes. By adding a migration `AddSimulationPathCascadeDelete`, SQL Server now knows that when a parent `Simulation` is deleted, it should automatically purge all orphaned `SimulationPath` rows.

---

## 3. Network Graph Scaling Bug
**Symptoms:**
The newly built Network Map feature rendered successfully, but the entire 30-node topology was clustered into a tiny, unreadable 100x100 pixel dot in the center of the screen.

**Root Cause:**
The `nodePositions` `useMemo` hook was artificially scaling database coordinates into a hardcoded 800x600 virtual bounding box *before* applying viewport transformations.

**Solution:**
Rewrote the algorithm to pass raw database coordinates straight to the Canvas. Inside the `ResizeObserver`, we added logic to calculate the absolute bounding box of the graph, and compute a dynamic `fitScale` that matches the exact width/height of the user's current browser window, ensuring the graph fills the screen automatically without distortion.

---

## 4. React Runtime ReferenceError in Graph
**Symptoms:**
Opening the Network Map threw a red screen of death: `ReferenceError: node is not defined`.

**Root Cause:**
A variable shadowing mismatch inside a `.forEach` loop. 
```typescript
nodes.forEach(n => {
  posMap.set(node.id, ...); // 'node' didn't exist, it was supposed to be 'n'
})
```

**Solution:**
Fixed the variable reference to `n.id`.

---

## 5. MUI v9 InputProps Deprecation Warnings
**Symptoms:**
The console was flooded with React warnings regarding `InputProps` being deprecated on MUI `TextField` components in the Login/Signup forms.

**Root Cause:**
Material UI v9 shifted their API to a slot-based architecture, deprecating `InputProps` in favor of `slotProps.input`.

**Solution:**
Refactored `LoginForm.tsx` and `SignupForm.tsx` to use `slotProps={{ input: { endAdornment: ... } }}` and stripped out generic Tailwind classes in favor of robust MUI `sx` styling props for visual consistency.

---

## 6. Authentication State Loss on Refresh
**Symptoms:**
If a logged-in user pressed F5 to refresh the browser, they were immediately booted to the login screen, even though their HttpOnly cookie and LocalStorage tokens were valid.

**Root Cause:**
The React `AuthContext` state exists only in browser memory and resets to `null` on a hard refresh.

**Solution:**
Implemented a new backend endpoint `GET /api/Auth/me`. On application load, the AuthContext attempts to fetch this endpoint. Because the Axios interceptor injects the stored JWT token, the request succeeds, the backend returns the user's profile, and the React context restores the session seamlessly before rendering protected routes.
