-- =============================================
-- NETWORK ROUTING DB - CLEANUP + SEED DATA
-- Run against: NetworkRoutingDB
-- =============================================

-- 1. CLEANUP: Delete all existing data (child tables first)
DELETE FROM SimulationPaths;
DELETE FROM Simulations;
DELETE FROM Links;
DELETE FROM Nodes;

-- 2. RESET IDENTITY COUNTERS
DBCC CHECKIDENT ('SimulationPaths', RESEED, 0);
DBCC CHECKIDENT ('Simulations', RESEED, 0);
DBCC CHECKIDENT ('Links', RESEED, 0);
DBCC CHECKIDENT ('Nodes', RESEED, 0);

-- 3. INSERT 30 NODES (realistic network topology)
-- Layout: nodes arranged roughly on a grid for clear visualization
-- Types: 0=Router, 1=Switch, 2=Customer

SET IDENTITY_INSERT Nodes ON;

INSERT INTO Nodes (Id, Name, Type, X, Y, IsActive) VALUES
-- Core routers (backbone)
(1,  'Core-R1',      0, 350, 50,  1),
(2,  'Core-R2',      0, 550, 50,  1),
(3,  'Core-R3',      0, 450, 150, 1),

-- Distribution layer
(4,  'Dist-SW1',     1, 100, 150, 1),
(5,  'Dist-SW2',     1, 250, 150, 1),
(6,  'Dist-SW3',     1, 650, 150, 1),
(7,  'Dist-SW4',     1, 800, 150, 1),

-- Access switches
(8,  'Access-SW1',   1, 50,  300, 1),
(9,  'Access-SW2',   1, 200, 300, 1),
(10, 'Access-SW3',   1, 350, 300, 1),
(11, 'Access-SW4',   1, 500, 300, 1),
(12, 'Access-SW5',   1, 650, 300, 1),
(13, 'Access-SW6',   1, 800, 300, 1),

-- Customer endpoints (left cluster)
(14, 'Office-A',     2, 30,  450, 1),
(15, 'Office-B',     2, 120, 450, 1),
(16, 'Lab-1',        2, 200, 420, 1),
(17, 'Lab-2',        2, 280, 450, 1),

-- Customer endpoints (center cluster)
(18, 'Server-Room',  2, 370, 420, 1),
(19, 'Data-Center',  2, 430, 460, 1),
(20, 'Dev-Floor',    2, 510, 420, 1),
(21, 'QA-Floor',     2, 480, 500, 1),

-- Customer endpoints (right cluster)
(22, 'Sales-Dept',   2, 620, 450, 1),
(23, 'HR-Dept',      2, 700, 420, 1),
(24, 'Finance',      2, 780, 450, 1),
(25, 'Exec-Suite',   2, 860, 420, 1),

-- Extra routers for alternative paths
(26, 'Edge-R1',      0, 150, 50,  1),
(27, 'Edge-R2',      0, 750, 50,  1),

-- Redundant switches
(28, 'Backup-SW1',   1, 300, 200, 1),
(29, 'Backup-SW2',   1, 600, 200, 1),

-- Isolated node (intentionally disconnected for testing)
(30, 'Isolated-Node', 2, 900, 500, 0);

SET IDENTITY_INSERT Nodes OFF;

-- 4. INSERT 58 LINKS (connected graph with alternative paths)
-- Cost = distance in meters (1-1000)

SET IDENTITY_INSERT Links ON;

INSERT INTO Links (Id, SourceNodeId, DestinationNodeId, Cost, IsActive) VALUES
-- === CORE BACKBONE (low cost, high speed links) ===
(1,  1,  2,  80,  1),  -- Core-R1 <-> Core-R2
(2,  2,  1,  80,  1),
(3,  1,  3,  120, 1),  -- Core-R1 <-> Core-R3
(4,  3,  1,  120, 1),
(5,  2,  3,  100, 1),  -- Core-R2 <-> Core-R3
(6,  3,  2,  100, 1),

-- === EDGE ROUTERS TO CORE ===
(7,  26, 1,  200, 1),  -- Edge-R1 -> Core-R1
(8,  1,  26, 200, 1),
(9,  27, 2,  180, 1),  -- Edge-R2 -> Core-R2
(10, 2,  27, 180, 1),

-- === DISTRIBUTION LAYER ===
(11, 26, 4,  150, 1),  -- Edge-R1 -> Dist-SW1
(12, 4,  26, 150, 1),
(13, 1,  5,  100, 1),  -- Core-R1 -> Dist-SW2
(14, 5,  1,  100, 1),
(15, 2,  6,  110, 1),  -- Core-R2 -> Dist-SW3
(16, 6,  2,  110, 1),
(17, 27, 7,  160, 1),  -- Edge-R2 -> Dist-SW4
(18, 7,  27, 160, 1),

-- === ACCESS LAYER ===
(19, 4,  8,  60,  1),  -- Dist-SW1 -> Access-SW1
(20, 8,  4,  60,  1),
(21, 4,  9,  70,  1),  -- Dist-SW1 -> Access-SW2
(22, 9,  4,  70,  1),
(23, 5,  9,  50,  1),  -- Dist-SW2 -> Access-SW2
(24, 9,  5,  50,  1),
(25, 5,  10, 80,  1),  -- Dist-SW2 -> Access-SW3
(26, 10, 5,  80,  1),
(27, 3,  10, 90,  1),  -- Core-R3 -> Access-SW3
(28, 10, 3,  90,  1),
(29, 3,  11, 85,  1),  -- Core-R3 -> Access-SW4
(30, 11, 3,  85,  1),
(31, 6,  12, 75,  1),  -- Dist-SW3 -> Access-SW5
(32, 12, 6,  75,  1),
(33, 7,  13, 65,  1),  -- Dist-SW4 -> Access-SW6
(34, 13, 7,  65,  1),
(35, 6,  11, 95,  1),  -- Dist-SW3 -> Access-SW4
(36, 11, 6,  95,  1),

-- === CUSTOMER ENDPOINTS (left cluster) ===
(37, 8,  14, 30,  1),  -- Access-SW1 -> Office-A
(38, 8,  15, 25,  1),  -- Access-SW1 -> Office-B
(39, 9,  16, 35,  1),  -- Access-SW2 -> Lab-1
(40, 9,  17, 40,  1),  -- Access-SW2 -> Lab-2

-- === CUSTOMER ENDPOINTS (center cluster) ===
(41, 10, 18, 20,  1),  -- Access-SW3 -> Server-Room
(42, 10, 19, 45,  1),  -- Access-SW3 -> Data-Center
(43, 11, 20, 30,  1),  -- Access-SW4 -> Dev-Floor
(44, 11, 21, 55,  1),  -- Access-SW4 -> QA-Floor

-- === CUSTOMER ENDPOINTS (right cluster) ===
(45, 12, 22, 35,  1),  -- Access-SW5 -> Sales-Dept
(46, 12, 23, 40,  1),  -- Access-SW5 -> HR-Dept
(47, 13, 24, 25,  1),  -- Access-SW6 -> Finance
(48, 13, 25, 50,  1),  -- Access-SW6 -> Exec-Suite

-- === BACKUP / REDUNDANT PATHS (alternative routes) ===
(49, 28, 5,  130, 1),  -- Backup-SW1 -> Dist-SW2
(50, 5,  28, 130, 1),
(51, 28, 10, 110, 1),  -- Backup-SW1 -> Access-SW3
(52, 10, 28, 110, 1),
(53, 29, 6,  140, 1),  -- Backup-SW2 -> Dist-SW3
(54, 6,  29, 140, 1),
(55, 29, 12, 100, 1),  -- Backup-SW2 -> Access-SW5
(56, 12, 29, 100, 1),

-- === CROSS-LINKS (mesh resilience) ===
(57, 28, 29, 300, 1),  -- Backup-SW1 <-> Backup-SW2 (long path)
(58, 29, 28, 300, 1);

SET IDENTITY_INSERT Links OFF;

-- 5. VERIFY
SELECT 'Nodes:' AS [Table], COUNT(*) AS [Count] FROM Nodes
UNION ALL
SELECT 'Links:', COUNT(*) FROM Links
UNION ALL
SELECT 'Simulations:', COUNT(*) FROM Simulations;

PRINT 'Seed data inserted successfully!';
