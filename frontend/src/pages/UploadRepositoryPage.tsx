import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Github, Loader2, Lock, ScanSearch, UploadCloud, Zap } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRepoStore } from "@/store/repoStore";
import { cn } from "@/utils/cn";
import { fadeInUp, staggerContainer } from "@/utils/motion";

const GITHUB_URL = /^(?:https?:\/\/github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i;

const steps = [
  { icon: Github, title: "Clone & scan", desc: "We securely fetch the repo and detect languages." },
  { icon: ScanSearch, title: "Parse with Tree-sitter", desc: "Symbols, calls, and structure are extracted." },
  { icon: Zap, title: "Index graph + vectors", desc: "Neo4j graph and ChromaDB embeddings are built." },
];

export function UploadRepositoryPage() {
  const navigate = useNavigate();
  const addRepository = useRepoStore((s) => s.addRepository);

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const submit = () => {
    const match = value.trim().match(GITHUB_URL);
    if (!match) {
      setError("Enter a valid GitHub URL, e.g. github.com/owner/repo");
      return;
    }
    setError(null);
    setSubmitting(true);

    // Simulate the network round-trip before the store kicks off indexing.
    setTimeout(() => {
      const [, owner, name] = match;
      const repo = addRepository({ owner, name });
      setSubmitting(false);
      toast.success("Repository added", {
        description: `${owner}/${name} is now indexing.`,
      });
      navigate(`/repository/${repo.id}`);
    }, 1100);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        title="Add a repository"
        description="Connect a public GitHub repository to index it for code intelligence."
        icon={<UploadCloud />}
      />

      <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-6">
              <label htmlFor="repo-url" className="text-sm font-medium">
                Repository URL
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Github className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="repo-url"
                    placeholder="github.com/owner/repository"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    className={cn("pl-9", error && "border-red-500/50 focus-visible:ring-red-500/40")}
                    aria-invalid={!!error}
                    disabled={submitting}
                  />
                </div>
                <Button variant="gradient" onClick={submit} disabled={submitting} className="sm:w-36">
                  {submitting ? (
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
              {error ? (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Only public repositories are supported in this demo.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Dropzone */}
        <motion.div variants={fadeInUp}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              toast.info("Drop detected", { description: "Archive uploads arrive in a later phase." });
            }}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center transition-colors",
              dragActive ? "border-primary/60 bg-primary/5" : "border-white/10 bg-white/[0.02]",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-medium">Or drop a repository archive</p>
            <p className="mt-1 text-xs text-muted-foreground">.zip or .tar.gz — up to 200 MB</p>
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
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> No code stored after indexing
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
