import { useState } from "react";
import { motion } from "framer-motion";
import { Boxes, Cloud, Database, Layers, Server, Workflow } from "lucide-react";

import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { architectureEdges, architectureNodes } from "@/data/mock";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { cn } from "@/utils/cn";
import type { ArchitectureNode } from "@/types";

const KIND_STYLE: Record<
  ArchitectureNode["kind"],
  { ring: string; icon: typeof Server; label: string; dot: string }
> = {
  frontend: { ring: "border-cyan-400/40 hover:border-cyan-400", icon: Layers, label: "Frontend", dot: "bg-cyan-400" },
  backend: { ring: "border-violet-400/40 hover:border-violet-400", icon: Server, label: "Backend", dot: "bg-violet-400" },
  service: { ring: "border-fuchsia-400/40 hover:border-fuchsia-400", icon: Boxes, label: "Service", dot: "bg-fuchsia-400" },
  database: { ring: "border-emerald-400/40 hover:border-emerald-400", icon: Database, label: "Database", dot: "bg-emerald-400" },
  external: { ring: "border-amber-400/40 hover:border-amber-400", icon: Cloud, label: "External", dot: "bg-amber-400" },
};

export function ArchitecturePage() {
  const { state, retry, isLoading } = useSimulatedLoading({ delay: 1000 });
  const [hovered, setHovered] = useState<string | null>(null);

  const connected = new Set<string>();
  if (hovered) {
    connected.add(hovered);
    architectureEdges.forEach((e) => {
      if (e.from === hovered) connected.add(e.to);
      if (e.to === hovered) connected.add(e.from);
    });
  }

  const nodeById = (id: string) => architectureNodes.find((n) => n.id === id)!;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Architecture"
        description="Auto-generated system map derived from the knowledge graph."
        icon={<Workflow />}
        actions={
          <div className="flex flex-wrap gap-2">
            {Object.values(KIND_STYLE).map((k) => (
              <Badge key={k.label} variant="secondary" className="gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", k.dot)} />
                {k.label}
              </Badge>
            ))}
          </div>
        }
      />

      {isLoading ? (
        <Skeleton className="h-[560px] w-full rounded-xl" />
      ) : state === "error" ? (
        <ErrorState description="The architecture graph could not be generated." onRetry={retry} />
      ) : (
        <Card className="relative h-[560px] w-full overflow-hidden bg-grid-pattern bg-[size:32px_32px]">
          {/* Edges */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgb(139 92 246)" />
                <stop offset="100%" stopColor="rgb(34 211 238)" />
              </linearGradient>
            </defs>
            {architectureEdges.map((e, i) => {
              const from = nodeById(e.from);
              const to = nodeById(e.to);
              const active = hovered ? connected.has(e.from) && connected.has(e.to) : false;
              return (
                <motion.line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={active ? "url(#edge)" : "rgba(255,255,255,0.12)"}
                  strokeWidth={active ? 2 : 1}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.6 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {architectureNodes.map((node, i) => {
            const style = KIND_STYLE[node.kind];
            const dim = hovered != null && !connected.has(node.id);
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: dim ? 0.35 : 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className={cn(
                    "flex w-40 cursor-pointer flex-col gap-1 rounded-xl border bg-[hsl(240_10%_7%)]/90 p-3 shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-105",
                    style.ring,
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("flex h-6 w-6 items-center justify-center rounded-md bg-white/5 [&_svg]:size-3.5")}>
                      <style.icon />
                    </span>
                    <span className="truncate text-sm font-medium">{node.label}</span>
                  </div>
                  <p className="text-[11px] leading-tight text-muted-foreground">{node.description}</p>
                </div>
              </motion.div>
            );
          })}
        </Card>
      )}

      {!isLoading && state !== "error" && (
        <p className="text-center text-xs text-muted-foreground">
          Hover a node to highlight its connections · {architectureNodes.length} components,{" "}
          {architectureEdges.length} links
        </p>
      )}
    </div>
  );
}
