# Graph Visualization & Canvas Engine

## Purpose
The Network Map is an interactive, full-page topology visualizer built using raw HTML5 `<canvas>` inside React (`NetworkGraph.tsx`). 

## Why Canvas?
Using standard DOM elements (like hundreds of `<div>` tags or SVG `<circle>` nodes) for a graph with many nodes and edges causes massive layout thrashing and poor frame rates. HTML5 Canvas renders pixels directly, allowing seamless 60FPS panning, zooming, and animations.

## Coordinate Mapping and Layout Engine

Nodes in the database contain real `X` and `Y` coordinates. However, these raw coordinates rarely match the exact pixel dimensions of a user's browser window. 

**The Viewport Scaling Bug & Fix:**
Initially, the graph mapped coordinates into a fixed 800x600 virtual box. This caused the graph to cluster tightly in a tiny unreadable area.
We rewrote the engine to dynamically calculate a `fitScale`. 
1. The `ResizeObserver` measures the exact width and height of the Canvas DOM element.
2. It calculates the raw bounding box (`minX, maxX, minY, maxY`) of all nodes in the database.
3. It computes a scale factor `Math.min(scaleX, scaleY)` to perfectly fit the raw bounding box inside the screen window while leaving a 100px padding.
4. It centers the graph via translation offsets.

## Interactive Features

### 1. Pan and Zoom
- **Pan:** Handled by intercepting `onMouseDown` and `onMouseMove`, updating a `transformRef` offset, and re-triggering `requestAnimationFrame`.
- **Zoom:** Intercepts `onWheel`, applies a scale multiplier, and translates the view to zoom *towards* the mouse cursor.

### 2. Hover Detection
Unlike SVG, Canvas has no event listeners for drawn shapes. Hover detection requires math.
On `mousemove`, the screen coordinates are inverse-transformed into "World Coordinates". The engine iterates through the node array and checks the Pythagorean distance:
`distance = Math.sqrt((mouseX - nodeX)^2 + (mouseY - nodeY)^2)`
If `distance <= NODE_RADIUS`, a hover event is triggered, drawing a tooltip and highlighting connected edges.

### 3. HiDPI Retina Support
The canvas physical pixel resolution is multiplied by `window.devicePixelRatio`. The 2D Context is then scaled down via CSS. This prevents text and circles from appearing blurry on modern high-resolution displays or MacBooks.
