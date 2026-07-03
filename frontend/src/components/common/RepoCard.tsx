import { useState } from "react";
import { motion } from "framer-motion";
import { Check, GitFork, MoreHorizontal, Star, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { toApiErrorMessage } from "@/api/client";
import { Card } from "@/components/ui/card";
import { RepoStatusBadge } from "@/components/common/RepoStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRepoStore } from "@/store/repoStore";
import type { Repository } from "@/types";
import { formatCompact } from "@/utils/format";
import { fadeInUp } from "@/utils/motion";
import { removeRepositoriesFromBackend } from "@/utils/repositoryCleanup";
import { cn } from "@/utils/cn";

const LANGUAGE_COLOR: Record<string, string> = {
  TypeScript: "bg-sky-400",
  Python: "bg-amber-400",
  Rust: "bg-orange-400",
  Go: "bg-cyan-400",
};

interface RepoCardProps {
  repo: Repository;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function RepoCard({
  repo,
  selectionMode = false,
  selected = false,
  onToggleSelect,
}: RepoCardProps) {
  const navigate = useNavigate();
  const selectRepo = useRepoStore((s) => s.selectRepo);
  const removeRepository = useRepoStore((s) => s.removeRepository);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const open = () => {
    selectRepo(repo.id);
    navigate(`/repository/${repo.id}`);
  };

  const handleCardClick = () => {
    if (selectionMode) {
      onToggleSelect?.(repo.id);
      return;
    }
    open();
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const { removed, failed } = await removeRepositoriesFromBackend([repo]);
      if (removed.length) {
        removeRepository(repo.id);
        setConfirmOpen(false);
        toast.success("Repository removed", {
          description: `${repo.owner}/${repo.name} was deleted from your workspace.`,
        });
      }
      if (failed.length) {
        toast.error("Failed to remove repository", { description: failed[0].error });
      }
    } catch (error) {
      toast.error("Failed to remove repository", {
        description: toApiErrorMessage(error),
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <motion.div variants={fadeInUp}>
        <Card
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
          className={cn(
            "group relative flex h-full cursor-pointer flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-glow",
            selectionMode && selected && "border-primary/50 ring-1 ring-primary/40",
          )}
        >
          {selectionMode && (
            <button
              type="button"
              aria-label={selected ? "Deselect repository" : "Select repository"}
              className={cn(
                "absolute left-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded border transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/20 bg-black/40 text-transparent hover:border-white/40",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.(repo.id);
              }}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}

          <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className={cn("flex items-start justify-between gap-3", selectionMode && "pl-7")}>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">{repo.owner}/</p>
              <h3 className="truncate text-base font-semibold group-hover:text-primary">{repo.name}</h3>
            </div>
            <div className="flex items-center gap-1">
              <RepoStatusBadge status={repo.status} />
              {!selectionMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 opacity-60 transition-opacity hover:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      aria-label={`Actions for ${repo.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        open();
                      }}
                    >
                      Open repository
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-400 focus:text-red-300"
                      onSelect={(e) => {
                        e.preventDefault();
                        setConfirmOpen(true);
                      }}
                    >
                      <Trash2 />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{repo.description}</p>

          {repo.status === "indexing" && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Indexing…</span>
                <span>{repo.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${repo.progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-full ${LANGUAGE_COLOR[repo.language] ?? "bg-white/40"}`} />
              {repo.language}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              {formatCompact(repo.stars)}
            </span>
            <span className="inline-flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" />
              {formatCompact(repo.forks)}
            </span>
            <span className="ml-auto">{repo.updatedAt}</span>
          </div>
        </Card>
      </motion.div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent showClose={false} onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Remove repository?</DialogTitle>
            <DialogDescription>
              This permanently deletes <strong>{repo.owner}/{repo.name}</strong> from your
              workspace, including parse data, embeddings, and graph indexes. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={removing}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleRemove} disabled={removing}>
              <Trash2 />
              {removing ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
