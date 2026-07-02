import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Database,
  GitBranch,
  Loader2,
  ScanSearch,
  Sparkles,
  XCircle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import type { IngestionJob, IngestionStage } from "@/types/ingestion";
import { cn } from "@/utils/cn";

const PIPELINE_STEPS: {
  stage: IngestionStage;
  label: string;
  icon: typeof GitBranch;
}[] = [
  { stage: "validating", label: "Validate", icon: GitBranch },
  { stage: "cloning", label: "Clone", icon: GitBranch },
  { stage: "parsing", label: "Parse", icon: ScanSearch },
  { stage: "indexing", label: "Index", icon: Database },
  { stage: "embedding", label: "Embed", icon: Sparkles },
];

const STAGE_ORDER: IngestionStage[] = [
  "queued",
  "validating",
  "cloning",
  "parsing",
  "indexing",
  "embedding",
  "completed",
];

function stageIndex(stage: IngestionStage): number {
  const idx = STAGE_ORDER.indexOf(stage);
  return idx === -1 ? 0 : idx;
}

function StepIcon({
  done,
  active,
  failed,
}: {
  done: boolean;
  active: boolean;
  failed: boolean;
}) {
  if (failed) return <XCircle className="h-4 w-4 text-red-400" />;
  if (done) return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  if (active) return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  return <Circle className="h-4 w-4 text-muted-foreground/40" />;
}

interface IngestionProgressProps {
  job: IngestionJob;
  className?: string;
}

export function IngestionProgress({ job, className }: IngestionProgressProps) {
  const currentIdx = stageIndex(job.stage);
  const failed = job.stage === "failed";

  return (
    <Card className={cn("overflow-hidden p-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">
            {failed ? "Ingestion failed" : job.stage === "completed" ? "Ingestion complete" : "Ingesting repository…"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{job.message}</p>
        </div>
        <span className="text-sm font-semibold tabular-nums text-primary">{job.progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={cn(
            "h-full rounded-full",
            failed
              ? "bg-red-500"
              : "bg-gradient-to-r from-violet-500 to-cyan-400",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${job.progress}%` }}
          transition={{ ease: "easeOut", duration: 0.4 }}
        />
      </div>

      {/* Step tracker */}
      <ol className="mt-6 grid gap-2 sm:grid-cols-5">
        {PIPELINE_STEPS.map((step) => {
          const stepIdx = stageIndex(step.stage);
          const done = !failed && (job.stage === "completed" || currentIdx > stepIdx);
          const active = !failed && job.stage === step.stage;
          const stepFailed = failed && job.stage !== "completed" && currentIdx >= stepIdx && currentIdx <= stepIdx + 1;

          return (
            <li
              key={step.stage}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                active && "border-primary/40 bg-primary/5",
                done && "border-emerald-500/20 bg-emerald-500/5",
                stepFailed && "border-red-500/30 bg-red-500/5",
                !active && !done && !stepFailed && "border-white/5 bg-white/[0.02]",
              )}
            >
              <step.icon className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground sm:block" />
              <StepIcon done={done} active={active} failed={!!stepFailed} />
              <span className={cn("font-medium", active && "text-primary")}>{step.label}</span>
            </li>
          );
        })}
      </ol>

      {failed && job.error && (
        <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
          {job.error}
        </p>
      )}
    </Card>
  );
}
