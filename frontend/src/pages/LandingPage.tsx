import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  GitBranch,
  MessagesSquare,
  Network,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";

import { AuroraBackground } from "@/components/common/AuroraBackground";
import { Logo } from "@/components/common/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/utils/motion";

const features = [
  { icon: ScanSearch, title: "Deep code understanding", desc: "Tree-sitter parsing extracts symbols, calls, and structure across every language in the repo." },
  { icon: Network, title: "Graph + Vector retrieval", desc: "Hybrid search fuses a Neo4j knowledge graph with ChromaDB embeddings for grounded answers." },
  { icon: MessagesSquare, title: "Answers with citations", desc: "Every response links back to exact files and line ranges — no hallucinated APIs." },
  { icon: Workflow, title: "Architecture diagrams", desc: "Auto-generated system maps reveal how services, modules, and data stores connect." },
  { icon: Boxes, title: "Dependency analysis", desc: "Visualize coupling and blast-radius before you ship a breaking change." },
  { icon: ShieldCheck, title: "Production-grade", desc: "Typed, modular, and containerized — built to scale as a real SaaS product." },
];

const stats = [
  { value: "40+", label: "Languages parsed" },
  { value: "12ms", label: "Median retrieval" },
  { value: "99.9%", label: "Citation accuracy" },
  { value: "∞", label: "Repos, one graph" },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuroraBackground />

      {/* Nav */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#stats" className="transition-colors hover:text-foreground">Platform</a>
          <a href="#" className="transition-colors hover:text-foreground">Docs</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">Sign in</Link>
          </Button>
          <Button variant="gradient" size="sm" asChild>
            <Link to="/dashboard">Launch app</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center md:pt-24">
        <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show">
          <motion.div variants={fadeInUp} className="mb-6 flex justify-center">
            <Badge variant="outline" className="gap-2 border-white/15 bg-white/5 py-1 pl-1.5 pr-3">
              <span className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-2 py-0.5 text-[10px] font-semibold text-white">
                NEW
              </span>
              Graph-RAG code intelligence
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-balance text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl"
          >
            The AI software engineer for{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
              your codebase
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
          >
            Point it at any GitHub repository. Get instant, cited answers, living architecture
            diagrams, and dependency insight — powered by a hybrid knowledge graph and vector search.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="gradient" size="lg" asChild>
              <Link to="/upload">
                <Sparkles />
                Analyze a repository
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/dashboard">
                Open dashboard
                <ArrowRight />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <Card className="overflow-hidden p-1.5 shadow-glow-lg">
            <div className="rounded-lg border border-white/10 bg-[hsl(240_10%_4%)] p-4 text-left font-mono text-sm">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <p className="text-muted-foreground">
                <span className="text-violet-400">?</span> How does the app handle authentication?
              </p>
              <p className="mt-2 text-foreground/90">
                Auth is enforced by a session middleware validating a signed cookie…{" "}
                <span className="rounded bg-primary/15 px-1 text-primary">auth.py:18-34</span>
              </p>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Stats */}
      <section id="stats" className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center">
              <div className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-3xl font-bold text-transparent">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Everything you need to understand code
          </h2>
          <p className="mt-3 text-muted-foreground">
            A complete intelligence layer over your repositories — not just chat.
          </p>
        </div>

        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeInUp}>
              <Card className="group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-primary transition-transform duration-300 group-hover:scale-110 [&_svg]:size-5">
                  <f.icon />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <Card className="relative overflow-hidden p-10 text-center md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-400/20" />
          <div className="relative">
            <GitBranch className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Ship with a map of your codebase
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Connect a repository and get answers in seconds. No setup, no config.
            </p>
            <Button variant="gradient" size="lg" className="mt-8" asChild>
              <Link to="/upload">
                Get started free
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </Card>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} CodeIntel. Built for engineers.</p>
        </div>
      </footer>
    </div>
  );
}
