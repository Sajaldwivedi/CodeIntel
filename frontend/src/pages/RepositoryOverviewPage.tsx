import { useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  FileCode2,
  FolderGit2,
  GitFork,
  MessagesSquare,
  Star,
  Workflow,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { FileTree } from "@/components/common/FileTree";
import { PageHeader } from "@/components/common/PageHeader";
import { RepoStatusBadge } from "@/components/common/RepoStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockFileTree, mockLanguages } from "@/data/mock";
import { useSimulatedLoading } from "@/hooks/useSimulatedLoading";
import { useRepoStore } from "@/store/repoStore";
import { formatCompact } from "@/utils/format";
import { staggerContainer } from "@/utils/motion";

export function RepositoryOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedId = useRepoStore((s) => s.selectedRepoId);
  const repo = useRepoStore(
    (s) => s.repositories.find((r) => r.id === (id ?? selectedId)) ?? null,
  );
  const { state, retry, isLoading } = useSimulatedLoading({ delay: 900 });
  const [selectedFile, setSelectedFile] = useState<string>();

  if (!repo) {
    return (
      <EmptyState
        icon={<FolderGit2 />}
        title="Repository not found"
        description="This repository may have been removed or the link is invalid."
        action={<Button variant="secondary" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={repo.name}
        description={`${repo.owner}/${repo.name}`}
        icon={<FolderGit2 />}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/architecture")}>
              <Workflow />
              Architecture
            </Button>
            <Button variant="gradient" onClick={() => navigate("/chat")}>
              <MessagesSquare />
              Ask questions
            </Button>
          </>
        }
      />

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3">
        <RepoStatusBadge status={repo.status} />
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Star className="h-4 w-4" /> {formatCompact(repo.stars)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <GitFork className="h-4 w-4" /> {formatCompact(repo.forks)}
        </span>
        <span className="text-sm text-muted-foreground">Updated {repo.updatedAt}</span>
      </div>

      <p className="max-w-2xl text-muted-foreground">{repo.description}</p>

      {/* Quick stats */}
      <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Files", value: formatCompact(repo.files), icon: FileCode2 },
          { label: "Chunks", value: formatCompact(repo.chunks), icon: Database },
          { label: "Stars", value: formatCompact(repo.stars), icon: Star },
          { label: "Forks", value: formatCompact(repo.forks), icon: GitFork },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className="h-4 w-4 text-muted-foreground" />
            <div className="mt-3 text-xl font-semibold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="files">
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">File explorer</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-full" style={{ width: `${90 - i * 6}%` }} />
                  ))}
                </div>
              ) : state === "error" ? (
                <ErrorState description="We couldn't load the file tree for this repository." onRetry={retry} />
              ) : (
                <FileTree nodes={mockFileTree} selectedId={selectedFile} onSelect={(n) => setSelectedFile(n.id)} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Language breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2.5 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex h-3 overflow-hidden rounded-full">
                    {mockLanguages.map((l) => (
                      <div key={l.language} style={{ width: `${l.percentage}%`, backgroundColor: l.color }} />
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {mockLanguages.map((l) => (
                      <div key={l.language} className="flex items-center gap-2 text-sm">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
                        <span>{l.language}</span>
                        <span className="ml-auto text-muted-foreground">{l.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
