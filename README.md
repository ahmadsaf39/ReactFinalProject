# NetRoute - Network Routing Simulator

## 📌 Project Overview
NetRoute is a full-stack, comprehensive web application designed to simulate, visualize, and analyze network routing topologies. It enables users to construct virtual network maps (Nodes and Links) and dynamically calculate the mathematically shortest paths between network points utilizing **Dijkstra's Shortest Path Algorithm**. 

Built as a university-grade engineering project, NetRoute emphasizes clean architecture, real-time metrics, robust database integrity, and high-performance interactive graphing.

---

## 🚀 Features
- **Interactive Topology Visualization:** HTML5 Canvas rendering of network nodes, links, and highlighted execution paths.
- **Dynamic Shortest-Path Routing:** Calculates and tracks the Dijkstra algorithm step-by-step, recording execution time (ms) and visited nodes.
- **Full CRUD Management:** Create, Read, Update, and Delete physical Nodes and logical Links. 
- **Historical Simulations:** Automatically logs routing queries to a database for playback, auditing, and analytical history.
- **JWT Authentication Flow:** Fully secured API with stateless tokens, short-lived access, automatic background token refresh, and identity protection.
- **Real-Time Dashboard Grid:** Provides an aggregate overview of the entire system (Node counts, Link loads, total active simulations).
- **Audit Logging System:** Thread-safe backend file logging capturing every user action, HTTP request, error, and routing computation.

---

## 🛠️ Technologies Used
### **Frontend**
* **Framework:** React 19 + TypeScript
* **Build Tool:** Vite
* **Styling:** Material UI (MUI v5) + custom CSS
* **State & Networking:** React Hooks, Context API, Axios (with Interceptors)
* **Graphics:** HTML5 Canvas API

### **Backend**
* **Framework:** ASP.NET Core 10 Web API (C#)
* **Database Management:** Entity Framework Core (Code-First)
* **Database Engine:** Microsoft SQL Server
* **Security:** JWT (JSON Web Tokens), BCrypt.Net for password hashing
* **Documentation:** Scalar OpenAPI

---

## 🧠 Architecture Overview
NetRoute follows a modern, decoupled N-Tier architecture pattern:
1. **Frontend SPA (Single Page Application)** consuming RESTful JSON APIs.
2. **Backend API Layer (Controllers)** handling HTTP validation, routing, and JWT authorization.
3. **Business Logic Layer (Services)** separating mathematical computations (`DijkstraService`), caching mechanisms (`GraphBuilderService`), and audit tracking (`ActivityLogger`).
4. **Data Access Layer (Repository)** powered by EF Core, interacting with the SQL Server and enforcing referential cascade integrity.

---

## 🔐 Authentication System
The application features a robust custom authentication pipeline:
1. **Registration & Login**: Passwords are mathematically hashed and salted via `BCrypt`.
2. **Access Tokens**: Short-lived JWTs (typically 15-30 minutes) are generated for API security.
3. **Refresh Tokens**: Long-lived refresh tokens are stored securely to rotate the user's access token transparently.
4. **Axios Interceptor**: The React frontend intercepts `401 Unauthorized` responses. If a token expires, the interceptor pauses the request queue, hits the `/api/Auth/refresh-token` endpoint, and seamlessly replays the failed requests without interrupting the user's session.

---

## 🧮 Dijkstra Shortest Path Explanation
When a user executes a simulation:
1. The `GraphBuilderService` constructs an Adjacency List `Dictionary<int, List<Edge>>` representation of the network topology from the SQL database.
2. The `DijkstraService` initializes a `PriorityQueue` mapping node distances to infinity, except the source node which starts at `0`.
3. The engine iteratively explores the network, relaxing edges (updating shortest-known paths) until it reaches the destination node.
4. It extracts the finalized path array, total cost metric, total edge relaxations, and exact execution duration (in milliseconds).

---

## 🎨 Graph Visualization Explanation
The frontend `GraphCanvas` component leverages the raw power of the **HTML5 `<canvas>` API** instead of standard DOM/SVG elements to ensure crisp performance.
- If physical X/Y coordinates are absent (0,0), it automatically applies a **trigonometry-based circular layout algorithm** to neatly organize nodes into a ring.
- Link lines are dynamically drawn beneath nodes, with computed arrowheads indicating directionality.
- Glowing drop shadows and customized color strokes highlight active simulation paths (Green for Source, Amber for Destination, Blue for Path).

---

## 📂 Folder Structure
The repository is split into clean, modularized layers:

```
/
├── backend/                  # ASP.NET Core Web API
│   ├── Controllers/          # API Route endpoints
│   ├── Data/                 # EF Core DB Context
│   ├── DTOs/                 # Request/Response shapes
│   ├── Migrations/           # EF Core SQL Migrations
│   ├── Models/               # SQL Database Entities
│   └── Services/             # Core Business & Math Logic
│
├── frontend/                 # React SPA
│   ├── public/               # Static assets
│   └── src/
│       ├── api/              # Axios wrappers
│       ├── components/       # Shared UI & Layouts
│       ├── context/          # React State Providers
│       ├── features/         # Isolated Domain Modules (auth, nodes, routing)
│       ├── hooks/            # Custom reusable logic
│       └── types/            # Strict TypeScript Interfaces
│
└── docs/                     # Engineering & Architecture Markdown Files
```

---

## 💻 Setup Instructions

### Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Microsoft SQL Server](https://www.microsoft.com/sql-server/)

### 1. Database Setup
1. Open SQL Server Management Studio (SSMS).
2. Create an empty database (e.g., `NetRouteDb`).
3. Update the `DefaultConnection` string inside `backend/appsettings.json` with your SQL server credentials.
4. Open a terminal in `/backend` and run:
   ```bash
   dotnet ef database update
   ```
5. *(Optional)* Run the provided `backend/seed_data.sql` script directly in SSMS to populate the system with a realistic baseline network.

### 2. Backend Setup
```bash
cd backend
dotnet restore
dotnet build
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

---

## 🏃 Run Instructions

### Running the Backend Server
```bash
cd backend
dotnet run
```
*The API will start at `https://localhost:xxxx` (check console for exact port).*

### Running the Frontend Server
```bash
cd frontend
npm run dev
```
*The React application will start at `http://localhost:5173`.*

---

## 🌐 API Overview
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/Auth/login` | Authenticate and retrieve JWT | No |
| `GET` | `/api/Auth/me` | Restore user session | Yes |
| `GET` | `/api/Nodes` | Fetch all network nodes | Yes |
| `POST` | `/api/Links` | Create a new network connection | Yes |
| `GET` | `/api/Routing/dijkstra` | Execute algorithmic path calculation | Yes |
| `GET` | `/api/Simulation` | Fetch simulation history logs | Yes |

---

## 🖼️ Screenshots

> **Note:** Replace the placeholders below with actual imagery.

![Dashboard Overview](placeholder_dashboard.png)
*Dashboard showing real-time statistics.*

![Network Map](placeholder_network_map.png)
*Interactive topology graph canvas.*

![Dijkstra Execution](placeholder_dijkstra.png)
*Shortest path calculated and highlighted in blue.*

---

## 🔮 Future Improvements
- **WebSockets / SignalR:** Implement real-time synchronization so changes made by one user instantly reflect on the dashboard of other active users.
- **Alternative Algorithms:** Introduce UI dropdowns to select different algorithms (e.g., Bellman-Ford or A*) and compare execution times against Dijkstra.
- **Interactive Canvas Editor:** Allow dragging, dropping, and connecting nodes directly inside the canvas rather than using text-based forms.
- **Server-Side Pagination:** Optimize the simulation history tables for massive datasets (10,000+ records) using `Skip` and `Take`.
