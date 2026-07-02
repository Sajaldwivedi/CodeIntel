import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layers, Loader2, Network, Workflow } from "lucide-react";

import { fetchDiagrams, type DiagramBundle } from "@/api/diagrams";
import { ErrorState } from "@/components/common/ErrorState";
import { PageHeader } from "@/components/common/PageHeader";
import { ExportToolbar } from "@/components/diagrams/ExportToolbar";
import { graphViewToFlow } from "@/components/diagrams/diagramUtils";
import { InteractiveGraph } from "@/components/diagrams/InteractiveGraph";
import { MermaidPanel } from "@/components/diagrams/MermaidPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRepoStore } from "@/store/repoStore";
import { encodeRepoId, repoIdFromSelection } from "@/utils/repoId";
import { toApiErrorMessage } from "@/api/client";

export type DiagramTab = "system" | "dependency" | "mermaid";

interface DiagramsPageProps {
  initialTab?: DiagramTab;
}

export function DiagramsPage({ initialTab = "system" }: DiagramsPageProps) {
  const repositories = useRepoStore((s) => s.repositories);
  const selectedId = useRepoStore((s) => s.selectedRepoId);
  const activeRepo = repositories.find((r) => r.id === selectedId) ?? repositories[0];

  const [tab, setTab] = useState<DiagramTab>(initialTab);
  const [bundle, setBundle] = useState<DiagramBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!activeRepo) {
      setError("Select or ingest a repository first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const repoId = repoIdFromSelection(activeRepo.owner, activeRepo.name);
      const data = await fetchDiagrams(encodeRepoId(repoId));
      setBundle(data);
    } catch (err) {
      setError(toApiErrorMessage(err));
      setBundle(null);
    } finally {
      setLoading(false);
    }
  }, [activeRepo]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const systemFlow = useMemo(
    () => (bundle ? graphViewToFlow(bundle.system_architecture, "system") : { nodes: [], edges: [] }),
    [bundle],
  );
  const depFlow = useMemo(
    () => (bundle ? graphViewToFlow(bundle.dependency_graph, "dependency") : { nodes: [], edges: [] }),
    [bundle],
  );

  const headerIcon = tab === "dependency" ? Network : Workflow;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Architecture Diagrams"
        description={
          activeRepo
            ? `Generated from graph data for ${activeRepo.owner}/${activeRepo.name}`
            : "Select a repository to generate diagrams"
        }
        icon={headerIcon === Network ? <Network /> : <Workflow />}
        actions={
          bundle ? (
            <ExportToolbar bundle={bundle} viewportRef={viewportRef} activeTab={tab} />
          ) : loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : null
        }
      />

      {bundle && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Frontend → API → Services → DB</Badge>
          {Object.entries(bundle.stats)
            .slice(0, 5)
            .map(([k, v]) => (
              <Badge key={k} variant="secondary">
                {k}: {v}
              </Badge>
            ))}
        </div>
      )}

      {loading ? (
        <Skeleton className="h-[620px] w-full rounded-xl" />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : bundle ? (
        <Tabs value={tab} onValueChange={(v) => setTab(v as DiagramTab)}>
          <TabsList>
            <TabsTrigger value="system" className="gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              System
            </TabsTrigger>
            <TabsTrigger value="dependency" className="gap-1.5">
              <Network className="h-3.5 w-3.5" />
              Dependencies
            </TabsTrigger>
            <TabsTrigger value="mermaid" className="gap-1.5">
              <Workflow className="h-3.5 w-3.5" />
              Mermaid
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="mt-4">
            <InteractiveGraph
              nodes={systemFlow.nodes}
              edges={systemFlow.edges}
              exportRef={viewportRef}
              emptyMessage="No system architecture graph indexed for this repository."
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Pan, zoom, and drag nodes · {systemFlow.nodes.length} components, {systemFlow.edges.length} links
            </p>
          </TabsContent>

          <TabsContent value="dependency" className="mt-4">
            <InteractiveGraph
              nodes={depFlow.nodes}
              edges={depFlow.edges}
              exportRef={viewportRef}
              emptyMessage="No import/dependency edges indexed for this repository."
            />
            <p className="mt-2 text-center text-xs text-muted-foreground">
              File import graph · {depFlow.nodes.length} modules, {depFlow.edges.length} imports
            </p>
          </TabsContent>

          <TabsContent value="mermaid" className="mt-4">
            <div ref={viewportRef} className="grid gap-4 lg:grid-cols-2">
              <MermaidPanel title="Flowchart" source={bundle.mermaid.flowchart} />
              <MermaidPanel title="Sequence diagram" source={bundle.mermaid.sequence} />
              <Card className="lg:col-span-2">
                <CardContent className="p-4">
                  <MermaidPanel title="Class diagram" source={bundle.mermaid.class_diagram} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
