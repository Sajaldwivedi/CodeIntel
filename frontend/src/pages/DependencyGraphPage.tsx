import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Network } from "lucide-react";

import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { dependencyEdges, dependencyNodes } from "@/data/mock";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { cn } from "@/utils/cn";
import type { DependencyNode } from "@/types";

const GROUP_COLOR: Record<DependencyNode["group"], string> = {
  core: "rgb(139 92 246)",
  api: "rgb(34 211 238)",
  service: "rgb(217 70 239)",
  util: "rgb(16 185 129)",
  external: "rgb(245 158 11)",
};

const GROUP_LABEL: Record<DependencyNode["group"], string> = {
  core: "Core",
  api: "API",
  service: "Service",
  util: "Utility",
  external: "External",
};

export function DependencyGraphPage() {
  const { state, retry, isLoading } = useSimulatedLoading({ delay: 1000 });
  const [hovered, setHovered] = useState<string | null>(null);

  // Static circular layout so positions are stable across renders.
  const positioned = useMemo(() => {
    const cx = 50;
    const cy = 50;
    const radius = 36;
    return dependencyNodes.map((node, i) => {
      const angle = (i / dependencyNodes.length) * Math.PI * 2 - Math.PI / 2;
      return { ...node, x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });
  }, []);

  const posById = (id: string) => positioned.find((n) => n.id === id)!;

  const neighbors = new Set<string>();
  if (hovered) {
    neighbors.add(hovered);
    dependencyEdges.forEach((e) => {
      if (e.source === hovered) neighbors.add(e.target);
      if (e.target === hovered) neighbors.add(e.source);
    });
  }

  const degree = (id: string) =>
    dependencyEdges.filter((e) => e.source === id || e.target === id).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dependency Graph"
        description="Module coupling and import relationships across the codebase."
        icon={<Network />}
        actions={
          <div className="flex flex-wrap gap-2">
            {Object.entries(GROUP_LABEL).map(([group, label]) => (
              <Badge key={group} variant="secondary" className="gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GROUP_COLOR[group as DependencyNode["group"]] }} />
                {label}
              </Badge>
            ))}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {isLoading ? (
            <Skeleton className="h-[560px] w-full rounded-xl" />
          ) : state === "error" ? (
            <ErrorState description="The dependency graph could not be computed." onRetry={retry} />
          ) : (
            <Card className="relative aspect-square w-full overflow-hidden lg:aspect-auto lg:h-[560px]">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {dependencyEdges.map((e, i) => {
                  const s = posById(e.source);
                  const t = posById(e.target);
                  const active = hovered ? neighbors.has(e.source) && neighbors.has(e.target) : false;
                  return (
                    <motion.line
                      key={i}
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={active ? GROUP_COLOR[posById(hovered!).group] : "rgba(255,255,255,0.1)"}
                      strokeWidth={active ? 1.6 : 0.8}
                      vectorEffect="non-scaling-stroke"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.6 }}
                    />
                  );
                })}
              </svg>

              {positioned.map((node, i) => {
                const dim = hovered != null && !neighbors.has(node.id);
                const color = GROUP_COLOR[node.group];
                return (
                  <motion.button
                    key={node.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: dim ? 0.3 : 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 300, damping: 20 }}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                  >
                    <span
                      className="flex items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-transform hover:scale-110"
                      style={{
                        width: node.size + 18,
                        height: node.size + 18,
                        borderColor: color,
                        backgroundColor: `${color}22`,
                        boxShadow: hovered === node.id ? `0 0 24px ${color}` : undefined,
                      }}
                    />
                    <span className="whitespace-nowrap text-[11px] font-medium text-muted-foreground">
                      {node.label}
                    </span>
                  </motion.button>
                );
              })}
            </Card>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Most connected</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
              ) : (
                [...dependencyNodes]
                  .sort((a, b) => degree(b.id) - degree(a.id))
                  .slice(0, 5)
                  .map((node) => (
                    <button
                      key={node.id}
                      onMouseEnter={() => setHovered(node.id)}
                      onMouseLeave={() => setHovered(null)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-white/5",
                        hovered === node.id && "bg-white/5",
                      )}
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: GROUP_COLOR[node.group] }} />
                      <span className="font-mono">{node.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{degree(node.id)} links</span>
                    </button>
                  ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-xs text-muted-foreground">
              Hover any node to trace its direct dependencies. Node size reflects its number of
              connections.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
