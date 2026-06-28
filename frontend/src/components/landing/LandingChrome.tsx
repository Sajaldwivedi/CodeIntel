import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.85]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.06]);
  const backgroundColor = useTransform(bgOpacity, (v) => `rgba(3, 3, 3, ${v})`);
  const borderBottomColor = useTransform(borderOpacity, (v) => `rgba(255,255,255,${v})`);

  return (
    <>
      <motion.header
        style={{ backgroundColor, borderBottomColor }}
        className="fixed inset-x-0 top-0 z-50 border-b border-transparent backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-ink">CodeMind</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/dashboard"
              className="text-[13px] text-ink-muted transition-colors hover:text-ink"
            >
              Sign in
            </Link>
            <Link to="/upload">
              <Button size="sm" className="rounded-full px-5">
                Get started
              </Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-x-0 top-16 z-40 border-b border-white/[0.06] bg-[#030303]/95 p-6 backdrop-blur-xl md:hidden"
        >
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-ink-secondary"
              >
                {link.label}
              </a>
            ))}
            <Link to="/upload" onClick={() => setMobileOpen(false)}>
              <Button className="w-full">Get started</Button>
            </Link>
          </nav>
        </motion.div>
      )}
    </>
  );
}

export function LandingFooter() {
  const columns = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Changelog', 'Documentation'],
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Contact'],
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Security'],
    },
  ];

  return (
    <footer className="relative border-t border-white/[0.06] bg-[#030303]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-ink">CodeMind</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
              Your AI Software Engineer. Understand any GitHub repository, ask architecture
              questions, and visualize dependency graphs.
            </p>
            <div className="mt-6 flex gap-4">
              {['GitHub', 'Twitter', 'Discord'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-xs text-ink-faint transition-colors hover:text-ink-muted"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-ink-muted transition-colors hover:text-ink-secondary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} CodeMind. All rights reserved.
          </p>
          <p className="text-xs text-ink-faint">
            Built with FastAPI · LangGraph · Neo4j · ChromaDB
          </p>
        </div>
      </div>
    </footer>
  );
}

export function HeroGradient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, rgba(139,92,246,0.12) 30%, rgba(59,130,246,0.08) 50%, transparent 70%)',
        }}
      />
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-32 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-accent-violet/10 blur-[100px]"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute right-1/4 top-48 h-[300px] w-[400px] rounded-full bg-accent-blue/8 blur-[80px]"
      />
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="inline-block rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-muted"
    >
      {children}
    </motion.span>
  );
}

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
