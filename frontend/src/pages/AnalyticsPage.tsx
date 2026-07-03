import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Copy,
  FileCode2,
  FunctionSquare,
  GitBranch,
  Layers,
  Skull,
  UploadCloud,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { fetchRepositoryAnalytics } from "@/api/analytics";
import { AnalyticsDependencyGraph } from "@/components/analytics/AnalyticsDependencyGraph";
import { ComplexityHeatmap } from "@/components/analytics/ComplexityHeatmap";
import { ComplexityChart, LanguageChart } from "@/components/analytics/MetricCharts";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepoStore } from "@/store/repoStore";
import { encodeRepoId } from "@/utils/repoId";
import { formatCompact } from "@/utils/format";
import { staggerContainer } from "@/utils/motion";
import { toApiErrorMessage } from "@/api/client";
import type { RepositoryAnalytics, SymbolRef } from "@/types/analytics";

export function AnalyticsPage() {
  const navigate = useNavigate();
  const repositories = useRepoStore((s) => s.repositories);
  const selectedId = useRepoStore((s) => s.selectedRepoId);
  const activeRepo = repositories.find((r) => r.id === selectedId) ?? repositories[0];

  const [data, setData] = useState<RepositoryAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeRepo || activeRepo.status !== "indexed") {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const repoSlug = `${activeRepo.owner}/${activeRepo.name}`;
    fetchRepositoryAnalytics(encodeRepoId(repoSlug))
      .then((analytics) => {
        if (!cancelled) setData(analytics);
      })
      .catch((err) => {
        if (!cancelled) setError(toApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeRepo?.id, activeRepo?.owner, activeRepo?.name, activeRepo?.status]);

  const openFile = (path: string) => {
    if (!activeRepo) return;
    navigate(`/repository/${activeRepo.id}?file=${encodeURIComponent(path)}`);
  };

  if (!activeRepo) {
    return (
      <EmptyState
        icon={<BarChart3 />}
        title="No repository selected"
        description="Upload and index a repository to unlock code analytics."
        action={
          <Button variant="gradient" onClick={() => navigate("/upload")}>
            <UploadCloud />
            Upload repository
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description={`Code insights for ${activeRepo.owner}/${activeRepo.name} — complexity, dependencies, and health signals.`}
        actions={
          <Badge variant="secondary" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            Insights
          </Badge>
        }
      />

      {activeRepo.status !== "indexed" && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 py-4 text-sm text-amber-200/90">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Repository indexing must complete before analytics are available.
          </CardContent>
        </Card>
      )}

      {error && <ErrorState title="Analytics unavailable" description={error} onRetry={() => window.location.reload()} />}

      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[116px] rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
      )}

      {!loading && data && (
        <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="show" className="space-y-8">
          <motion.div variants={staggerContainer(0.04)} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Files" value={formatCompact(data.file_count)} icon={<FileCode2 />} accent="text-cyan-400" />
            <StatCard
              label="Functions"
              value={formatCompact(data.function_count)}
              icon={<FunctionSquare />}
              accent="text-violet-400"
            />
            <StatCard label="Classes" value={formatCompact(data.class_count)} icon={<Boxes />} accent="text-fuchsia-400" />
            <StatCard
              label="Dependency depth"
              value={`${data.dependency_depth}`}
              icon={<Layers />}
              accent="text-emerald-400"
            />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            <LanguageChart data={data.language_distribution} />
            <ComplexityChart data={data.complexity_distribution} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <HighlightCard
              title="Most complex file"
              icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
              symbol={data.most_complex_file}
              onOpen={openFile}
            />
            <HighlightCard
              title="Largest function"
              icon={<FunctionSquare className="h-4 w-4 text-violet-400" />}
              symbol={data.largest_function}
              onOpen={openFile}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <InsightPanel
              title="Duplicate code estimate"
              icon={<Copy className="h-4 w-4 text-cyan-400" />}
              metric={data.duplicate_estimate}
              metricLabel="similar symbols"
              emptyText="No duplicate clusters detected."
            >
              {data.duplicate_clusters.map((cluster) => (
                <div key={cluster.fingerprint} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{cluster.count} matches</span>
                    <Badge variant="secondary">{(cluster.similarity * 100).toFixed(0)}% similar</Badge>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {cluster.symbols.map((symbol) => (
                      <li key={`${symbol.file_path}-${symbol.name}`} className="truncate font-mono">
                        {symbol.name} · {symbol.file_path}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </InsightPanel>

            <InsightPanel
              title="Dead code estimation"
              icon={<Skull className="h-4 w-4 text-red-400" />}
              metric={data.dead_code_estimate}
              metricLabel="uncalled symbols"
              emptyText="No likely dead code detected."
            >
              {data.dead_code_symbols.map((symbol) => (
                <button
                  key={`${symbol.file_path}-${symbol.name}`}
                  type="button"
                  onClick={() => openFile(symbol.file_path)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-xs transition-colors hover:border-white/20"
                >
                  <span className="truncate font-mono text-foreground">{symbol.name}</span>
                  <span className="ml-2 shrink-0 text-muted-foreground">
                    {symbol.file_path} · {symbol.lines}L
                  </span>
                </button>
              ))}
            </InsightPanel>
          </div>

          <Card className="border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
            <CardHeader>
              <CardTitle className="text-base">Complexity heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplexityHeatmap cells={data.heatmap} onSelect={openFile} />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
            <CardHeader>
              <CardTitle className="text-base">Import dependency graph</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsDependencyGraph graph={data.dependency_graph} graphKey={data.job_id} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function HighlightCard({
  title,
  icon,
  symbol,
  onOpen,
}: {
  title: string;
  icon: React.ReactNode;
  symbol: SymbolRef | null;
  onOpen: (path: string) => void;
}) {
  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        {icon}
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {symbol ? (
          <button
            type="button"
            onClick={() => onOpen(symbol.file_path)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition-colors hover:border-primary/30"
          >
            <p className="font-mono text-sm text-foreground">{symbol.file_path}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{symbol.kind}</Badge>
              <Badge variant="secondary">{symbol.lines} lines</Badge>
              {symbol.complexity_score > 0 && (
                <Badge variant="secondary">score {symbol.complexity_score}</Badge>
              )}
            </div>
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">Not enough data.</p>
        )}
      </CardContent>
    </Card>
  );
}

function InsightPanel({
  title,
  icon,
  metric,
  metricLabel,
  emptyText,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  metric: number;
  metricLabel: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{metric}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{metricLabel}</p>
        </div>
      </CardHeader>
      <CardContent className="max-h-72 space-y-2 overflow-y-auto">
        {metric === 0 ? <p className="text-sm text-muted-foreground">{emptyText}</p> : children}
      </CardContent>
    </Card>
  );
}
