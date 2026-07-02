import { motion } from "framer-motion";
import { GitFork, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { RepoStatusBadge } from "@/components/common/RepoStatusBadge";
import { useRepoStore } from "@/store/repoStore";
import type { Repository } from "@/types";
import { formatCompact } from "@/utils/format";
import { fadeInUp } from "@/utils/motion";

const LANGUAGE_COLOR: Record<string, string> = {
  TypeScript: "bg-sky-400",
  Python: "bg-amber-400",
  Rust: "bg-orange-400",
  Go: "bg-cyan-400",
};

export function RepoCard({ repo }: { repo: Repository }) {
  const navigate = useNavigate();
  const selectRepo = useRepoStore((s) => s.selectRepo);

  const open = () => {
    selectRepo(repo.id);
    navigate(`/repository/${repo.id}`);
  };

  return (
    <motion.div variants={fadeInUp}>
      <Card
        onClick={open}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && open()}
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-glow"
      >
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">{repo.owner}/</p>
            <h3 className="truncate text-base font-semibold group-hover:text-primary">{repo.name}</h3>
          </div>
          <RepoStatusBadge status={repo.status} />
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
  );
}
