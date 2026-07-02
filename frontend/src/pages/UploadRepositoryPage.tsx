import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  FileArchive,
  Github,
  KeyRound,
  Loader2,
  Lock,
  ScanSearch,
  UploadCloud,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { startGitHubIngestion, startZipIngestion } from "@/api/ingestion";
import { toApiErrorMessage } from "@/api/client";
import { IngestionProgress } from "@/components/common/IngestionProgress";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useIngestionProgress } from "@/hooks/useIngestion";
import { useRepoStore } from "@/store/repoStore";
import { cn } from "@/utils/cn";
import { fadeInUp, staggerContainer } from "@/utils/motion";

const GITHUB_URL = /^(?:https?:\/\/github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i;
const MAX_ZIP_MB = 200;

const steps = [
  { icon: Github, title: "Clone & scan", desc: "We securely fetch the repo and detect languages." },
  { icon: ScanSearch, title: "Parse with Tree-sitter", desc: "Symbols, calls, and structure are extracted." },
  { icon: Zap, title: "Index graph + vectors", desc: "Neo4j graph and ChromaDB embeddings are built." },
];

type InputMode = "github" | "zip";

export function UploadRepositoryPage() {
  const navigate = useNavigate();
  const upsertFromIngestion = useRepoStore((s) => s.upsertFromIngestion);
  const updateFromIngestion = useRepoStore((s) => s.updateFromIngestion);

  const [mode, setMode] = useState<InputMode>("github");
  const [value, setValue] = useState("");
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { job, isComplete, isFailed } = useIngestionProgress(activeJobId);

  useEffect(() => {
    if (job) updateFromIngestion(job);
  }, [job, updateFromIngestion]);

  const startGithub = useCallback(async () => {
    const match = value.trim().match(GITHUB_URL);
    if (!match) {
      setError("Enter a valid GitHub URL, e.g. github.com/owner/repo");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const { job_id } = await startGitHubIngestion({
        url: value.trim(),
        token: token.trim() || undefined,
      });
      const [, owner, name] = match;
      upsertFromIngestion({
        id: job_id,
        source: "github",
        owner,
        name,
        stage: "queued",
        progress: 0,
        message: "Starting ingestion…",
        error: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setActiveJobId(job_id);
      toast.success("Ingestion started", { description: `${owner}/${name} is being indexed.` });
    } catch (err) {
      setError(toApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [value, token, upsertFromIngestion]);

  const startZip = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Only .zip archives are supported.");
      return;
    }
    if (file.size > MAX_ZIP_MB * 1024 * 1024) {
      setError(`Archive must be under ${MAX_ZIP_MB} MB.`);
      return;
    }

    const baseName = file.name.replace(/\.zip$/i, "");
    setError(null);
    setSubmitting(true);

    try {
      const { job_id } = await startZipIngestion(file, baseName);
      upsertFromIngestion({
        id: job_id,
        source: "zip",
        owner: "local",
        name: baseName,
        stage: "queued",
        progress: 0,
        message: "Extracting archive…",
        error: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setActiveJobId(job_id);
      toast.success("Archive uploaded", { description: `${baseName} is being indexed.` });
    } catch (err) {
      setError(toApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }, [upsertFromIngestion]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setMode("zip");
      void startZip(file);
    }
  };

  const onComplete = () => {
    if (job) navigate(`/repository/${job.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Add a repository"
        description="Connect a GitHub repository or upload a ZIP archive to index it for code intelligence."
        icon={<UploadCloud />}
      />

      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="space-y-6">
        {/* Active ingestion progress */}
        <AnimatePresence>
          {job && !isComplete && !isFailed && (
            <motion.div variants={fadeInUp} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <IngestionProgress job={job} />
            </motion.div>
          )}
          {job && isFailed && (
            <motion.div variants={fadeInUp} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <IngestionProgress job={job} />
            </motion.div>
          )}
          {job && isComplete && (
            <motion.div variants={fadeInUp} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <IngestionProgress job={job} />
              <div className="mt-4 flex justify-end">
                <Button variant="gradient" onClick={onComplete}>
                  <CheckCircle2 />
                  View repository
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GitHub URL input */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <label htmlFor="repo-url" className="text-sm font-medium">
                  GitHub repository URL
                </label>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Github className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="repo-url"
                    placeholder="github.com/owner/repository"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      setMode("github");
                      if (error) setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !submitting && startGithub()}
                    className={cn("pl-9", error && mode === "github" && "border-red-500/50 focus-visible:ring-red-500/40")}
                    aria-invalid={!!error && mode === "github"}
                    disabled={submitting || !!activeJobId}
                  />
                </div>
                <Button
                  variant="gradient"
                  onClick={() => void startGithub()}
                  disabled={submitting || !!activeJobId}
                  className="sm:w-36"
                >
                  {submitting && mode === "github" ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Connecting…
                    </>
                  ) : (
                    <>
                      <Zap />
                      Index repo
                    </>
                  )}
                </Button>
              </div>

              {/* GitHub token (private repos) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowToken((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  {showToken ? "Hide" : "Add"} GitHub token for private repos
                </button>
                {showToken && (
                  <div className="relative mt-2">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="ghp_…"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="pl-9"
                      disabled={submitting || !!activeJobId}
                      autoComplete="off"
                    />
                  </div>
                )}
              </div>

              {error && mode === "github" ? (
                <p className="text-sm text-red-400">{error}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Public repos work without a token. Private repos require a personal access token with <code className="text-foreground/70">repo</code> scope.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Dropzone */}
        <motion.div variants={fadeInUp}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void startZip(file);
              e.target.value = "";
            }}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => !submitting && !activeJobId && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center transition-colors",
              dragActive ? "border-primary/60 bg-primary/5" : "border-white/10 bg-white/[0.02]",
              (submitting || activeJobId) && "pointer-events-none opacity-50",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground">
              {submitting && mode === "zip" ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <FileArchive className="h-6 w-6" />
              )}
            </div>
            <p className="mt-4 text-sm font-medium">Or drop a repository archive</p>
            <p className="mt-1 text-xs text-muted-foreground">.zip — up to {MAX_ZIP_MB} MB</p>
            {error && mode === "zip" && (
              <p className="mt-3 text-sm text-red-400">{error}</p>
            )}
          </div>
        </motion.div>

        {/* Pipeline steps */}
        <motion.div variants={fadeInUp} className="grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <Card key={step.title} className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-primary [&_svg]:size-4">
                  <step.icon />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold">{step.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{step.desc}</p>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeInUp} className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Read-only access
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Working tree cleaned after scan
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
