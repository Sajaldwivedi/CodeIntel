import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { graphNodes, graphEdges } from '@/data/mock';
import { cn } from '@/lib/utils';

const nodeColors: Record<string, string> = {
  file: 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue',
  class: 'border-accent-violet/40 bg-accent-violet/10 text-accent-violet',
  function: 'border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald',
  module: 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan',
};

function CustomNode({ data }: { data: { label: string; type: string } }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'rounded-xl border px-4 py-2.5 shadow-lg backdrop-blur-sm min-w-[120px] text-center',
        nodeColors[data.type] ?? nodeColors.file,
      )}
    >
      <p className="text-[10px] uppercase tracking-wider opacity-70">{data.type}</p>
      <p className="font-mono text-xs font-medium">{data.label}</p>
    </motion.div>
  );
}

const nodeTypes = { custom: CustomNode };

export function DependencyGraphPage() {
  const initialNodes: Node[] = useMemo(
    () =>
      graphNodes.map((n) => ({
        id: n.id,
        type: 'custom',
        position: { x: n.x, y: n.y },
        data: { label: n.label, type: n.type },
      })),
    [],
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      graphEdges.map((e, i) => ({
        id: `e-${i}`,
        source: e.from,
        target: e.to,
        label: e.type,
        animated: e.type === 'calls',
        style: {
          stroke: e.type === 'imports' ? '#8b5cf6' : e.type === 'calls' ? '#10b981' : '#3b82f6',
          strokeWidth: 1.5,
        },
        labelStyle: { fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' },
        labelBgStyle: { fill: '#0f0f12', fillOpacity: 0.8 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 16, height: 16 },
      })),
    [],
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback(() => {}, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dependency Graph"
        description="Interactive visualization of imports, calls, and module relationships."
        badge={<Badge variant="info">{graphNodes.length} nodes</Badge>}
      />

      <div className="flex flex-wrap gap-3">
        {Object.entries(nodeColors).map(([type]) => (
          <span key={type} className="flex items-center gap-2 text-xs text-ink-muted">
            <span className={cn('h-2.5 w-2.5 rounded-full border', nodeColors[type])} />
            {type}
          </span>
        ))}
      </div>

      <GlassCard padding="none" className="h-[600px] overflow-hidden" hover={false}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={onInit}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-[#0a0a0c]"
        >
          <Background color="#ffffff" gap={20} size={1} style={{ opacity: 0.03 }} />
          <Controls
            className="!bg-surface-raised/90 !border-white/10 !rounded-xl !shadow-card [&>button]:!bg-transparent [&>button]:!border-white/10 [&>button]:!text-ink-muted [&>button:hover]:!bg-white/5"
          />
          <MiniMap
            nodeColor={(n) => {
              const type = (n.data as { type: string })?.type;
              if (type === 'class') return '#8b5cf6';
              if (type === 'function') return '#10b981';
              if (type === 'module') return '#06b6d4';
              return '#3b82f6';
            }}
            maskColor="rgba(9, 9, 11, 0.85)"
            className="!bg-surface-raised/90 !border-white/10 !rounded-xl"
          />
        </ReactFlow>
      </GlassCard>
    </div>
  );
}
