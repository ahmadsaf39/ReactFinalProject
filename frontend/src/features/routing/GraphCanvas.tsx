import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import type { Node } from '../../types/Node';
import type { RoutingResult } from '../../types/RoutingResult';

interface Props {
  nodes: Node[];
  result: RoutingResult;
  nodesById: Record<number, Node>;
}

const NODE_RADIUS = 22;
const WIDTH = 700;
const HEIGHT = 340;
const PADDING = 60;

/**
 * Lays out nodes in a circle if they have no real coordinates (all x=0, y=0),
 * otherwise uses the stored x/y values scaled to canvas bounds.
 */
function layoutNodes(
  nodes: Node[],
  pathNodeIds: number[],
  width: number,
  height: number,
): Map<number, { cx: number; cy: number }> {
  const positions = new Map<number, { cx: number; cy: number }>();

  // Use only path nodes for visualization
  const pathNodes = pathNodeIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is Node => n != null);

  const allZero = pathNodes.every((n) => n.x === 0 && n.y === 0);

  if (allZero) {
    // Circular layout
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) / 2 - PADDING;
    pathNodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / pathNodes.length - Math.PI / 2;
      positions.set(node.id, {
        cx: cx + r * Math.cos(angle),
        cy: cy + r * Math.sin(angle),
      });
    });
  } else {
    // Scale existing coordinates to fit canvas
    const xs = pathNodes.map((n) => n.x);
    const ys = pathNodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs) || 1;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys) || 1;
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    pathNodes.forEach((node) => {
      positions.set(node.id, {
        cx: PADDING + ((node.x - minX) / rangeX) * (width - 2 * PADDING),
        cy: PADDING + ((node.y - minY) / rangeY) * (height - 2 * PADDING),
      });
    });
  }

  return positions;
}

export function GraphCanvas({ nodes, result, nodesById }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina/HiDPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const { pathNodeIds } = result;
    if (pathNodeIds.length === 0) return;

    const positions = layoutNodes(nodes, pathNodeIds, WIDTH, HEIGHT);

    // const pathSet = new Set(pathNodeIds);
    const edgesOnPath = new Set<string>();
    for (let i = 0; i < pathNodeIds.length - 1; i++) {
      edgesOnPath.add(`${pathNodeIds[i]}-${pathNodeIds[i + 1]}`);
    }

    // Draw path edges
    ctx.lineWidth = 3;
    for (let i = 0; i < pathNodeIds.length - 1; i++) {
      const fromPos = positions.get(pathNodeIds[i]);
      const toPos = positions.get(pathNodeIds[i + 1]);
      if (!fromPos || !toPos) continue;

      // Glowing path line
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(fromPos.cx, fromPos.cy);
      ctx.lineTo(toPos.cx, toPos.cy);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw arrow head
      const angle = Math.atan2(toPos.cy - fromPos.cy, toPos.cx - fromPos.cx);
      const arrowX = toPos.cx - Math.cos(angle) * NODE_RADIUS;
      const arrowY = toPos.cy - Math.sin(angle) * NODE_RADIUS;
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - 12 * Math.cos(angle - Math.PI / 6),
        arrowY - 12 * Math.sin(angle - Math.PI / 6),
      );
      ctx.lineTo(
        arrowX - 12 * Math.cos(angle + Math.PI / 6),
        arrowY - 12 * Math.sin(angle + Math.PI / 6),
      );
      ctx.closePath();
      ctx.fill();
    }

    // Draw nodes
    pathNodeIds.forEach((nodeId, index) => {
      const pos = positions.get(nodeId);
      if (!pos) return;

      const isSource = index === 0;
      const isDestination = index === pathNodeIds.length - 1;
      const color = isSource ? '#10b981' : isDestination ? '#f59e0b' : '#3b82f6';

      // Node shadow glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;

      // Node circle fill
      ctx.beginPath();
      ctx.arc(pos.cx, pos.cy, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Node circle border
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Node label
      const name = nodesById[nodeId]?.name ?? `#${nodeId}`;
      ctx.fillStyle = 'white';
      ctx.font = `bold 10px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Truncate long names
      const displayName = name.length > 8 ? name.slice(0, 7) + '…' : name;
      ctx.fillText(displayName, pos.cx, pos.cy);

      // Source / Destination badge
      if (isSource || isDestination) {
        const badge = isSource ? 'SRC' : 'DST';
        ctx.fillStyle = color;
        ctx.font = `bold 8px system-ui, sans-serif`;
        ctx.fillText(badge, pos.cx, pos.cy + NODE_RADIUS + 12);
      }
    });
  }, [nodes, result, nodesById]);

  return (
    <Box
      sx={{
        bgcolor: '#0a1628',
        borderRadius: 2,
        border: '1px solid #1e293b',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="caption" sx={{ color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Path Visualization
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
          {[
            { color: '#10b981', label: 'Source' },
            { color: '#f59e0b', label: 'Destination' },
            { color: '#3b82f6', label: 'Intermediate' },
          ].map(({ color, label }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem' }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <canvas
        ref={canvasRef}
        style={{ width: WIDTH, height: HEIGHT, maxWidth: '100%', display: 'block' }}
      />
    </Box>
  );
}

export default GraphCanvas;
