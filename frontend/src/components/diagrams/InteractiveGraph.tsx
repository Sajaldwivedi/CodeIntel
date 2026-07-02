import { useEffect, useRef } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DiagramNode } from "@/components/diagrams/DiagramNode";

const nodeTypes: NodeTypes = {
  diagram: DiagramNode,
};

interface InteractiveGraphProps {
  nodes: Node[];
  edges: Edge[];
  exportRef?: React.RefObject<HTMLDivElement | null>;
  emptyMessage?: string;
}

export function InteractiveGraph({
  nodes,
  edges,
  exportRef,
  emptyMessage = "No graph data available for this repository.",
}: InteractiveGraphProps) {
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (exportRef && innerRef.current) {
      (exportRef as React.MutableRefObject<HTMLDivElement | null>).current = innerRef.current;
    }
  }, [exportRef, nodes.length]);

  if (nodes.length === 0) {
    return (
      <div className="flex h-[560px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div ref={innerRef} className="h-[560px] w-full overflow-hidden rounded-xl border border-white/10">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="rgba(255,255,255,0.04)" />
        <Controls className="!border-white/10 !bg-[hsl(240_10%_7%)]" />
        <MiniMap
          nodeColor={(n) => (n.data as { color?: string }).color ?? "#8b5cf6"}
          maskColor="rgba(0,0,0,0.6)"
          className="!border-white/10 !bg-[hsl(240_10%_7%)]"
        />
      </ReactFlow>
    </div>
  );
}
