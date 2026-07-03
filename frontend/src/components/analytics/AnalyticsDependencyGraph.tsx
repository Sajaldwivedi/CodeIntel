import { useMemo } from "react";
import type { Edge, Node } from "@xyflow/react";

import { InteractiveGraph } from "@/components/diagrams/InteractiveGraph";
import type { DependencyGraph } from "@/types/analytics";

const GROUP_COLORS: Record<string, string> = {
  internal: "from-violet-500/30 to-cyan-400/20",
  external: "from-amber-500/30 to-orange-400/20",
};

function layoutNodes(nodes: DependencyGraph["nodes"]): Node[] {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  return nodes.map((node, index) => ({
    id: node.id,
    type: "diagram",
    position: { x: (index % cols) * 220, y: Math.floor(index / cols) * 120 },
    data: {
      label: node.label,
      kind: node.group,
      group: node.group,
      description: node.path,
      file_path: node.path,
    },
    style: {
      width: 180,
    },
  }));
}

export function AnalyticsDependencyGraph({ graph, graphKey }: { graph: DependencyGraph; graphKey: string }) {
  const nodes = useMemo(() => layoutNodes(graph.nodes), [graph.nodes]);
  const edges = useMemo<Edge[]>(
    () =>
      graph.edges.map((edge, index) => ({
        id: `e-${index}`,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        animated: true,
        style: { stroke: "rgba(139,92,246,0.45)" },
      })),
    [graph.edges],
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-white/10 px-2.5 py-1">
          Max import depth: <strong className="text-foreground">{graph.max_depth}</strong>
        </span>
        <span className="rounded-full border border-white/10 px-2.5 py-1">
          Nodes: <strong className="text-foreground">{graph.nodes.length}</strong>
        </span>
        {Object.entries(GROUP_COLORS).map(([group]) => (
          <span key={group} className="rounded-full border border-white/10 px-2.5 py-1 capitalize">
            {group}
          </span>
        ))}
      </div>
      <InteractiveGraph
        graphKey={graphKey}
        nodes={nodes}
        edges={edges}
        heightClass="h-[420px]"
        emptyMessage="No import dependencies detected in parse data."
      />
    </div>
  );
}
