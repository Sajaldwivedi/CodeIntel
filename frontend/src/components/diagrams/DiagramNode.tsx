import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

interface DiagramNodeData {
  label: string;
  description?: string;
  filePath?: string;
  color: string;
  kind?: string;
}

function DiagramNodeComponent({ data, selected }: NodeProps) {
  const d = data as unknown as DiagramNodeData;
  return (
    <div
      className="min-w-[140px] max-w-[220px] rounded-xl border bg-[hsl(240_10%_7%)]/95 px-3 py-2 shadow-xl backdrop-blur-md transition-shadow"
      style={{
        borderColor: selected ? d.color : `${d.color}66`,
        boxShadow: selected ? `0 0 24px ${d.color}44` : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} className="!bg-white/30" />
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
        <span className="truncate text-sm font-medium">{d.label}</span>
      </div>
      {d.description && (
        <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-muted-foreground">{d.description}</p>
      )}
      {d.filePath && (
        <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground/80">{d.filePath}</p>
      )}
      <Handle type="source" position={Position.Right} className="!bg-white/30" />
    </div>
  );
}

export const DiagramNode = memo(DiagramNodeComponent);
