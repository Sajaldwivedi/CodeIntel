import { useEffect, useRef } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
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
  graphKey: string;
  nodes: Node[];
  edges: Edge[];
  exportRef?: React.RefObject<HTMLDivElement | null>;
  emptyMessage?: string;
  heightClass?: string;
}

export function InteractiveGraph({
  graphKey,
  nodes: initialNodes,
  edges: initialEdges,
  exportRef,
  emptyMessage = "No graph data available for this repository.",
  heightClass = "h-[560px]",
}: InteractiveGraphProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [graphKey, initialNodes, initialEdges, setNodes, setEdges]);

  useEffect(() => {
    if (exportRef && innerRef.current) {
      (exportRef as React.MutableRefObject<HTMLDivElement | null>).current = innerRef.current;
    }
  }, [exportRef, graphKey, nodes.length]);

  if (initialNodes.length === 0) {
    return (
      <div
        className={`flex ${heightClass} items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-sm text-muted-foreground`}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={innerRef}
      className={`${heightClass} w-full overflow-hidden rounded-xl border border-white/10`}
    >
      <ReactFlow
        key={graphKey}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable
        nodesConnectable={false}
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1.2 }}
        minZoom={0.05}
        maxZoom={2}
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
