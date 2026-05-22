import { useEffect, useRef, useState, useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { Node } from '../../types/Node';
import type { Link } from '../../types/Link';

interface NetworkGraphProps {
  nodes: Node[];
  links: Link[];
}

interface Point {
  x: number;
  y: number;
}

interface HoverInfo {
  node: Node | null;
  x: number;
  y: number;
}

const COLORS = {
  bg: '#1e293b',
  text: '#cbd5e1',
  router: '#3b82f6',
  switch: '#8b5cf6',
  customer: '#f59e0b',
  inactiveBorder: '#475569',
  inactiveFill: 'rgba(71, 85, 105, 0.2)',
  edgeActive: '#475569',
  edgeInactive: 'rgba(71, 85, 105, 0.3)',
  edgeHighlight: '#38bdf8',
  nodeLabel: '#ffffff',
  costBg: '#0f172a',
  costText: '#94a3b8',
};

const NODE_RADIUS = 22;

export default function NetworkGraph({ nodes, links }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoverInfo, setHoverInfo] = useState<HoverInfo>({ node: null, x: 0, y: 0 });
  
  // Transform state: offset and scale for pan/zoom
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const nodesById = useMemo(() => {
    const map = new Map<number, Node>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Calculate node positions to fit within a bounded area
  const nodePositions = useMemo(() => {
    const posMap = new Map<number, Point>();
    if (nodes.length === 0) return posMap;

    // Check if all nodes are at (0,0)
    const allZero = nodes.every(n => n.x === 0 && n.y === 0);
    
    if (allZero) {
      // Circular layout
      const radius = Math.max(200, nodes.length * 15);
      
      nodes.forEach((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2;
        posMap.set(node.id, {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        });
      });
    } else {
      nodes.forEach(n => {
        posMap.set(n.id, { x: n.x, y: n.y });
      });
    }
    return posMap;
  }, [nodes]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    
    // Apply pan/zoom transform
    const t = transformRef.current;
    ctx.translate(t.x, t.y);
    ctx.scale(t.scale, t.scale);

    const hoveredNodeId = hoverInfo.node?.id;

    // Draw Links
    links.forEach(link => {
      const src = nodePositions.get(link.sourceNodeId);
      const dst = nodePositions.get(link.destinationNodeId);
      if (!src || !dst) return;

      const srcNode = nodesById.get(link.sourceNodeId);
      const dstNode = nodesById.get(link.destinationNodeId);
      const nodesActive = srcNode?.isActive && dstNode?.isActive;
      const isLinkActive = link.isActive && nodesActive;
      
      const isHighlighted = hoveredNodeId && (link.sourceNodeId === hoveredNodeId || link.destinationNodeId === hoveredNodeId);

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(dst.x, dst.y);

      ctx.lineWidth = isHighlighted ? 3 : 2;
      
      if (isHighlighted) {
        ctx.strokeStyle = COLORS.edgeHighlight;
        ctx.setLineDash([]);
      } else if (isLinkActive) {
        ctx.strokeStyle = COLORS.edgeActive;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = COLORS.edgeInactive;
        ctx.setLineDash([5, 5]);
      }
      
      ctx.stroke();

      // Draw cost label
      const midX = (src.x + dst.x) / 2;
      const midY = (src.y + dst.y) / 2;
      const costText = `${link.cost}m`;
      
      ctx.font = '10px sans-serif';
      const textMetrics = ctx.measureText(costText);
      const paddingX = 4;
      const paddingY = 2;
      const textW = textMetrics.width;
      const textH = 10;
      
      ctx.fillStyle = COLORS.costBg;
      ctx.fillRect(midX - textW/2 - paddingX, midY - textH/2 - paddingY, textW + paddingX*2, textH + paddingY*2);
      
      ctx.fillStyle = isHighlighted ? '#ffffff' : COLORS.costText;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(costText, midX, midY);
    });

    // Draw Nodes
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos) return;

      const isHovered = node.id === hoveredNodeId;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, 2 * Math.PI);
      
      let fillColor = COLORS.customer;
      if (node.type === 0) fillColor = COLORS.router;
      else if (node.type === 1) fillColor = COLORS.switch;

      if (node.isActive) {
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = isHovered ? 3 : 1;
        ctx.setLineDash([]);
      } else {
        ctx.fillStyle = COLORS.inactiveFill;
        ctx.strokeStyle = COLORS.inactiveBorder;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
      }

      // Add a subtle glow if hovered
      if (isHovered && node.isActive) {
        ctx.shadowColor = fillColor;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw Node ID/Label inside or below
      ctx.fillStyle = node.isActive ? COLORS.nodeLabel : '#94a3b8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, pos.x, pos.y + NODE_RADIUS + 12);
      
      // Node type indicator
      ctx.font = '10px sans-serif';
      const typeStr = node.type === 0 ? 'R' : node.type === 1 ? 'SW' : 'C';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(typeStr, pos.x, pos.y);
    });

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Resize observer to keep canvas full size
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Support HiDPI
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
        
        // Initial center on first load
        if (transformRef.current.scale === 1 && transformRef.current.x === 0 && transformRef.current.y === 0 && nodes.length > 0) {
          // calculate bounds to center
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          nodePositions.forEach(p => {
             if(p.x < minX) minX = p.x;
             if(p.x > maxX) maxX = p.x;
             if(p.y < minY) minY = p.y;
             if(p.y > maxY) maxY = p.y;
          });
          
          const padding = 100;
          const contentW = Math.max(maxX - minX, 1);
          const contentH = Math.max(maxY - minY, 1);
          
          // Calculate scale to fit content within canvas with padding
          const scaleX = (width - padding * 2) / contentW;
          const scaleY = (height - padding * 2) / contentH;
          // Use the smaller scale to ensure it fits both horizontally and vertically. 
          // Cap it at a reasonable maximum so very small graphs don't become gigantic.
          const fitScale = Math.min(scaleX, scaleY, 2.5);
          
          const centerX = minX + contentW/2;
          const centerY = minY + contentH/2;
          
          transformRef.current = {
            x: width / 2 - centerX * fitScale,
            y: height / 2 - centerY * fitScale,
            scale: fitScale
          };
        }
        
        requestAnimationFrame(draw);
      }
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [nodes, nodePositions]); // Need to re-trigger if nodes load

  // Redraw when hover changes
  useEffect(() => {
    requestAnimationFrame(draw);
  }, [hoverInfo]);

  // Event Handlers for Canvas
  const getMousePos = (e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Convert screen coordinates to world coordinates
  const screenToWorld = (screenX: number, screenY: number) => {
    const t = transformRef.current;
    return {
      x: (screenX - t.x) / t.scale,
      y: (screenY - t.y) / t.scale
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = getMousePos(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    
    if (isDraggingRef.current) {
      // Panning
      const dx = pos.x - lastMouseRef.current.x;
      const dy = pos.y - lastMouseRef.current.y;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      lastMouseRef.current = pos;
      requestAnimationFrame(draw);
    } else {
      // Hover detection
      const worldPos = screenToWorld(pos.x, pos.y);
      let foundNode: Node | null = null;
      
      // Check hit (reverse order to hit top nodes first if overlapping, though rare)
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i];
        const nPos = nodePositions.get(node.id);
        if (!nPos) continue;
        
        const dist = Math.sqrt(Math.pow(worldPos.x - nPos.x, 2) + Math.pow(worldPos.y - nPos.y, 2));
        if (dist <= NODE_RADIUS) {
          foundNode = node;
          break;
        }
      }

      if (foundNode?.id !== hoverInfo.node?.id) {
        setHoverInfo({ node: foundNode, x: e.clientX, y: e.clientY });
      } else if (foundNode) {
        // Update tooltip position if moving inside the node
        setHoverInfo({ node: foundNode, x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setHoverInfo({ node: null, x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); // Prevent page scroll
    const pos = getMousePos(e);
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    let newScale = transformRef.current.scale * Math.exp(delta);
    
    // Clamp scale
    newScale = Math.max(0.1, Math.min(newScale, 5));

    // Calculate new translation to zoom towards mouse cursor
    const scaleRatio = newScale / transformRef.current.scale;
    const newX = pos.x - (pos.x - transformRef.current.x) * scaleRatio;
    const newY = pos.y - (pos.y - transformRef.current.y) * scaleRatio;

    transformRef.current = { x: newX, y: newY, scale: newScale };
    requestAnimationFrame(draw);
  };

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{ cursor: isDraggingRef.current ? 'grabbing' : hoverInfo.node ? 'pointer' : 'grab', touchAction: 'none' }}
      />

      {/* Legend */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          p: 2,
          bgcolor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #334155',
          borderRadius: 2,
          pointerEvents: 'none',
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>Legend</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.router }} />
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Router</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.switch }} />
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Switch</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.customer }} />
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Customer</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', border: `1px dashed ${COLORS.inactiveBorder}`, bgcolor: COLORS.inactiveFill }} />
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>Inactive</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tooltip */}
      {hoverInfo.node && (
        <Paper
          elevation={4}
          sx={{
            position: 'fixed',
            left: hoverInfo.x + 15,
            top: hoverInfo.y + 15,
            p: 1.5,
            bgcolor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 1,
            pointerEvents: 'none',
            zIndex: 1000,
            minWidth: 150,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
            {hoverInfo.node.name}
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              ID: {hoverInfo.node.id}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Type: {hoverInfo.node.type === 0 ? 'Router' : hoverInfo.node.type === 1 ? 'Switch' : 'Customer'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Coords: ({hoverInfo.node.x.toFixed(1)}, {hoverInfo.node.y.toFixed(1)})
            </Typography>
            <Typography variant="caption" sx={{ color: hoverInfo.node.isActive ? '#4ade80' : '#f87171' }}>
              Status: {hoverInfo.node.isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
