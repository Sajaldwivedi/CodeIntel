import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  GitBranch,
  MessagesSquare,
  Network,
  ScanSearch,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";

import { AmbientBackground } from "@/components/common/AmbientBackground";
import { BlueprintCorners } from "@/components/common/BlueprintCorners";
import { Logo } from "@/components/common/Logo";
import { Overline } from "@/components/common/Overline";
import { Button } from "@/components/ui/button";
import { Card, SpotlightCard } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { fadeInUp, staggerContainer } from "@/utils/motion";

const features = [
  {
    icon: ScanSearch,
    title: "Deep code understanding",
    desc: "Tree-sitter parsing extracts symbols, calls, and structure across every language in the repository.",
  },
  {
    icon: Network,
    title: "Graph + vector retrieval",
    desc: "Hybrid search fuses a Neo4j knowledge graph with ChromaDB embeddings for grounded answers.",
  },
  {
    icon: MessagesSquare,
    title: "Answers with citations",
    desc: "Every response links back to exact files and line ranges — no hallucinated APIs.",
  },
  {
    icon: Workflow,
    title: "Architecture diagrams",
    desc: "Auto-generated system maps reveal how services, modules, and data stores connect.",
  },
  {
    icon: Boxes,
    title: "Dependency analysis",
    desc: "Visualize coupling and blast radius before you ship a breaking change.",
  },
  {
    icon: ShieldCheck,
    title: "Production-grade",
    desc: "Typed, modular, and containerized — built to scale like a real SaaS product.",
  },
];

const stats = [
  { value: "40+", label: "Languages parsed" },
  { value: "12ms", label: "Median retrieval" },
  { value: "99.9%", label: "Citation accuracy" },
  { value: "6", label: "Pipeline stages" },
];

/* The excavation — a repository being taken apart, layer by layer. */
const EXCAVATION_LINES = [
  { text: "$ strata index github.com/acme/checkout", tone: "cmd" },
  { text: "clone      842 files · 214,708 lines", tone: "dim" },
  { text: "parse      6,214 symbols extracted", tone: "dim" },
  { text: "graph      18,455 relationships mapped", tone: "dim" },
  { text: "embed      12,038 chunks indexed", tone: "dim" },
  { text: "ready — ask anything", tone: "ember" },
] as const;

function ExcavationPanel() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(reduceMotion ? EXCAVATION_LINES.length : 0);
  const [showAnswer, setShowAnswer] = useState(!!reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    if (visible < EXCAVATION_LINES.length) {
      const t = setTimeout(() => setVisible((v) => v + 1), visible === 0 ? 500 : 550);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShowAnswer(true), 600);
    return () => clearTimeout(t);
  }, [visible, reduceMotion]);

  return (
    <Card className="relative overflow-hidden p-0 text-left">
      <BlueprintCorners />
      <div className="flex items-center gap-2 border-b border-edge px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-raised" />
        <span className="h-2.5 w-2.5 rounded-full bg-raised" />
        <span className="h-2.5 w-2.5 rounded-full bg-raised" />
        <span className="ml-2 font-mono text-[11px] text-ink-3">strata — indexing</span>
      </div>
      <div className="min-h-[178px] space-y-1.5 px-5 py-4 font-mono text-[13px] leading-relaxed">
        {EXCAVATION_LINES.slice(0, visible).map((line) => (
          <motion.p
            key={line.text}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              line.tone === "cmd" && "text-ink",
              line.tone === "dim" && "text-ink-3",
              line.tone === "ember" && "text-ember",
            )}
          >
            {line.text}
          </motion.p>
        ))}
        {!showAnswer && visible < EXCAVATION_LINES.length && (
          <span className="inline-block h-4 w-[7px] animate-caret-blink bg-ember align-middle" aria-hidden />
        )}
      </div>
      {showAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-edge bg-raised/50 px-5 py-4"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">Question</p>
          <p className="mt-1 text-sm text-ink">How does the app handle authentication?</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            Auth is enforced by a session middleware that validates a signed cookie on every
            request…{" "}
            <span className="rounded-sm border border-ember/30 bg-ember/10 px-1.5 py-0.5 font-mono text-xs text-ember">
              auth.py:18–34
            </span>
          </p>
        </motion.div>
      )}
    </Card>
  );
}

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bedrock">
      <AmbientBackground />

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo to="/" />
        <nav className="hidden items-center gap-8 text-sm text-ink-2 md:flex">
          <a href="#features" className="transition-colors hover:text-ink">
            Features
          </a>
          <a href="#platform" className="transition-colors hover:text-ink">
            Platform
          </a>
        </nav>
        <Button size="sm" asChild>
          <Link to="/dashboard">Launch app</Link>
        </Button>
      </header>

      {/* Hero — editorial, left-aligned, annotated. */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-28 pt-16 md:pt-24 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show">
          <motion.div variants={fadeInUp}>
            <Overline>AI Software Engineer · For GitHub Repositories</Overline>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mt-5 font-display text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] text-ink sm:text-6xl lg:text-[64px]"
          >
            Understand any codebase,
            <br />
            <span className="text-ember">layer by layer.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="mt-6 max-w-lg text-base leading-[1.65] text-ink-2">
            Point Strata at a repository. It excavates the structure — symbols, call graphs,
            dependencies — and answers your questions with citations to exact files and lines.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button size="lg" asChild>
              <Link to="/upload">
                Analyze a repository
                <ArrowRight />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link to="/dashboard">Open dashboard</Link>
            </Button>
          </motion.div>

          <motion.p variants={fadeInUp} className="mt-8 font-mono text-[11px] tracking-[0.14em] text-ink-3">
            READ-ONLY ACCESS · NO SETUP · CITED ANSWERS
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 26 }}
        >
          <ExcavationPanel />
        </motion.div>
      </section>

      {/* Stats — a single hairline strip, mono numerals. */}
      <section id="platform" className="border-y border-edge">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-edge px-6 sm:grid-cols-4 sm:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="py-8 text-center sm:px-6">
              <div className="tnum font-display text-3xl font-semibold tracking-tight text-ink">
                {s.value}
              </div>
              <div className="overline-label mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-28">
        <div className="max-w-2xl">
          <Overline>Capabilities</Overline>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            A complete intelligence layer over your repositories
          </h2>
          <p className="mt-3 leading-relaxed text-ink-2">
            Not just chat — parsing, graphs, analytics, and living diagrams under one roof.
          </p>
        </div>

        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeInUp} className="h-full">
              <SpotlightCard className="h-full p-6">
                <f.icon className="h-5 w-5 text-ember" />
                <h3 className="mt-4 font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{f.desc}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-28">
        <Card className="relative overflow-hidden p-10 text-center md:p-16">
          <BlueprintCorners />
          <GitBranch className="mx-auto h-8 w-8 text-ember" />
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Ship with a map of your codebase
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-ink-2">
            Connect a repository and get answers in seconds. No setup, no config.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link to="/upload">
              Get started
              <ArrowRight />
            </Link>
          </Button>
        </Card>
      </section>

      <footer className="border-t border-edge py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-ink-3 sm:flex-row">
          <Logo to="/" />
          <p className="font-mono text-[11px] tracking-[0.14em]">
            © {new Date().getFullYear()} STRATA · BUILT FOR ENGINEERS
          </p>
        </div>
      </footer>
    </div>
  );
}
