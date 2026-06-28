import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  ArrowRight,
  Brain,
  FileText,
  GitBranch,
  Github,
  Layers,
  MessageSquare,
  Network,
  Sparkles,
  Star,
  Upload,
  Zap,
  Check,
} from 'lucide-react';
import { ScrollingCodeBackground } from '@/components/landing/ScrollingCodeBackground';
import { UploadAnimation } from '@/components/landing/UploadAnimation';
import {
  LandingNavbar,
  LandingFooter,
  HeroGradient,
  SectionLabel,
  FadeIn,
} from '@/components/landing/LandingChrome';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const SUBTITLE_ITEMS = [
  'Upload any GitHub repository.',
  'Understand 10,000+ files.',
  'Ask architecture questions.',
  'Generate documentation.',
  'Visualize dependency graphs.',
];

const FEATURES = [
  {
    icon: Github,
    title: 'One-click indexing',
    description: 'Paste a GitHub URL. We clone, parse with Tree-Sitter, embed, and graph — automatically.',
    gradient: 'from-white/10 to-white/5',
    iconColor: 'text-ink',
  },
  {
    icon: Brain,
    title: 'Deep code understanding',
    description: 'AST-aware parsing extracts functions, classes, imports, and call relationships across 12+ languages.',
    gradient: 'from-accent-violet/20 to-accent-violet/5',
    iconColor: 'text-accent-violet',
  },
  {
    icon: MessageSquare,
    title: 'Architecture Q&A',
    description: 'LangGraph agents research your codebase and answer with precise file citations — not hallucinations.',
    gradient: 'from-accent-blue/20 to-accent-blue/5',
    iconColor: 'text-accent-blue',
  },
  {
    icon: FileText,
    title: 'Auto documentation',
    description: 'Generate module overviews, API docs, and Mermaid diagrams from live code structure.',
    gradient: 'from-accent-cyan/20 to-accent-cyan/5',
    iconColor: 'text-accent-cyan',
  },
  {
    icon: GitBranch,
    title: 'Dependency graphs',
    description: 'Interactive Neo4j-powered visualization of imports, calls, and inheritance hierarchies.',
    gradient: 'from-accent-emerald/20 to-accent-emerald/5',
    iconColor: 'text-accent-emerald',
  },
  {
    icon: Zap,
    title: 'Semantic search',
    description: 'ChromaDB vector search finds relevant code by meaning — "where is auth handled?" just works.',
    gradient: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-400',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Onboarded to a 200k-line monorepo in an afternoon. CodeMind answered questions our senior engineers would have taken days to research.',
    author: 'Sarah Chen',
    role: 'Staff Engineer',
    company: 'Vercel',
    avatar: 'SC',
  },
  {
    quote:
      'The dependency graph alone is worth it. We found three circular imports that had been causing subtle bugs for months.',
    author: 'Marcus Webb',
    role: 'Engineering Lead',
    company: 'Linear',
    avatar: 'MW',
  },
  {
    quote:
      'Finally, an AI tool that cites actual source files. Our architecture reviews are 10x faster and actually trustworthy.',
    author: 'Priya Sharma',
    role: 'Principal Architect',
    company: 'Stripe',
    avatar: 'PS',
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'For individual developers exploring codebases.',
    features: ['1 repository', '5K symbols', 'Basic chat', 'Community support'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'For teams shipping production software.',
    features: [
      'Unlimited repositories',
      '100K+ symbols',
      'Architecture analysis',
      'Dependency graphs',
      'LangSmith tracing',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations with security requirements.',
    features: [
      'Self-hosted deployment',
      'SSO & audit logs',
      'Private model routing',
      'SLA & dedicated support',
      'Custom integrations',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-4, 4]);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <FadeIn delay={index * 0.08}>
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        whileHover={{ scale: 1.02 }}
        className="group relative h-full"
      >
        <div
          className={cn(
            'absolute -inset-px rounded-2xl bg-gradient-to-br opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100',
            feature.gradient,
          )}
        />
        <div className="relative flex h-full flex-col rounded-2xl border border-white/[0.06] bg-[#0a0a0c]/80 p-7 backdrop-blur-sm transition-colors group-hover:border-white/[0.12]">
          <div
            className={cn(
              'mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-white/[0.08]',
              feature.gradient,
            )}
          >
            <feature.icon className={cn('h-5 w-5', feature.iconColor)} />
          </div>
          <h3 className="text-[17px] font-semibold tracking-tight text-ink">{feature.title}</h3>
          <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-muted">
            {feature.description}
          </p>
          <div className="mt-5 flex items-center gap-1 text-[13px] font-medium text-ink-faint opacity-0 transition-opacity group-hover:text-accent-violet group-hover:opacity-100">
            Learn more <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </motion.div>
    </FadeIn>
  );
}

export function LandingPage() {
  const [subtitleIndex, setSubtitleIndex] = useState(0);

  return (
    <div className="relative min-h-screen bg-[#030303] text-ink">
      <LandingNavbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden pt-16">
        <ScrollingCodeBackground />
        <HeroGradient />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-24 pb-20 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-[13px] text-ink-secondary backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-violet" />
            Powered by LangGraph · Neo4j · Tree-Sitter
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl text-center text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink"
          >
            Your AI Software{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #ffffff 0%, #a78bfa 40%, #60a5fa 70%, #22d3ee 100%)',
              }}
            >
              Engineer
            </span>
          </motion.h1>

          <div className="mt-8 h-8 overflow-hidden">
            <motion.div
              key={subtitleIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onAnimationComplete={() => {
                setTimeout(() => setSubtitleIndex((i) => (i + 1) % SUBTITLE_ITEMS.length), 2800);
              }}
              className="text-center text-lg text-ink-muted sm:text-xl"
            >
              {SUBTITLE_ITEMS[subtitleIndex]}
            </motion.div>
          </div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2"
          >
            {SUBTITLE_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[13px] text-ink-faint">
                <span className="h-1 w-1 rounded-full bg-white/20" />
                {item}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link to="/upload">
              <Button size="lg" className="min-w-[200px] rounded-full">
                <Upload className="h-4 w-4" />
                Upload repository
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="min-w-[200px] rounded-full">
                View demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-20 w-full lg:mt-24"
          >
            <UploadAnimation />
          </motion.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#030303] to-transparent" />
      </section>

      {/* ── LOGOS / TRUST ──────────────────────────────── */}
      <section className="relative border-y border-white/[0.04] bg-[#030303] py-12">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-ink-faint">
            Trusted by engineering teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
            {['Vercel', 'Linear', 'Stripe', 'GitHub', 'OpenAI'].map((name) => (
              <span key={name} className="text-lg font-semibold tracking-tight text-ink">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section id="features" className="relative py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-violet/[0.02] to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Features</SectionLabel>
            <FadeIn>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
                Everything you need to{' '}
                <span className="gradient-text">understand code</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-4 text-lg text-ink-muted">
                From indexing to analysis — a complete AI engineering platform, not a chatbot.
              </p>
            </FadeIn>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>

          <FadeIn delay={0.3} className="mt-20">
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0c]">
              <div className="grid lg:grid-cols-2">
                <div className="flex flex-col justify-center p-10 lg:p-14">
                  <Layers className="mb-4 h-8 w-8 text-accent-violet" />
                  <h3 className="text-2xl font-semibold tracking-tight text-ink">
                    See the full picture
                  </h3>
                  <p className="mt-3 text-ink-muted leading-relaxed">
                    Combine semantic search with graph traversal. Ask "what breaks if I change
                    AuthMiddleware?" and get impact analysis across your entire codebase.
                  </p>
                  <Link to="/architecture" className="mt-6 inline-flex">
                    <Button variant="outline" size="sm" className="rounded-full">
                      Explore architecture
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="relative min-h-[280px] border-t border-white/[0.06] lg:border-l lg:border-t-0">
                  <div className="absolute inset-0 grid-pattern opacity-30" />
                  <div className="relative flex h-full items-center justify-center p-8">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                      className="absolute h-48 w-48 rounded-full border border-dashed border-white/[0.08]"
                    />
                    <motion.div
                      animate={{ rotate: [360, 0] }}
                      transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                      className="absolute h-32 w-32 rounded-full border border-white/[0.06]"
                    />
                    <Network className="relative h-16 w-16 text-accent-cyan/60" />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────── */}
      <section id="testimonials" className="relative border-t border-white/[0.04] py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Testimonials</SectionLabel>
            <FadeIn>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Loved by engineers
              </h2>
            </FadeIn>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.author} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="flex h-full flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 backdrop-blur-sm"
                >
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="flex-1 text-[15px] leading-relaxed text-ink-secondary">
                    "{t.quote}"
                  </blockquote>
                  <div className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-violet/30 to-accent-blue/30 text-xs font-semibold text-ink">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{t.author}</p>
                      <p className="text-xs text-ink-muted">
                        {t.role} · {t.company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────── */}
      <section id="pricing" className="relative py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/[0.03] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Pricing</SectionLabel>
            <FadeIn>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Simple, transparent pricing
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-4 text-ink-muted">Start free. Scale when your team grows.</p>
            </FadeIn>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: plan.highlighted ? -6 : -4 }}
                  className={cn(
                    'relative flex h-full flex-col rounded-2xl p-8',
                    plan.highlighted
                      ? 'border border-white/[0.15] bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-glow'
                      : 'border border-white/[0.06] bg-white/[0.02]',
                  )}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-violet to-accent-blue px-3 py-0.5 text-[11px] font-semibold text-white">
                      Most popular
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-ink-muted">{plan.name}</p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-ink">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-sm text-ink-muted">{plan.period}</span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-ink-muted">{plan.description}</p>
                  </div>

                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-ink-secondary">
                        <Check className="h-4 w-4 shrink-0 text-accent-emerald" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link to="/upload" className="mt-8 block">
                    <Button
                      variant={plan.highlighted ? 'primary' : 'secondary'}
                      className="w-full rounded-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="relative py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0a0c] px-8 py-16 sm:px-16">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 via-transparent to-accent-cyan/10" />
              <div className="relative">
                <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl text-balance">
                  Ready to understand your codebase?
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-ink-muted">
                  Upload your first repository in seconds. No credit card required.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link to="/upload">
                    <Button size="lg" className="rounded-full min-w-[200px]">
                      Get started free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
