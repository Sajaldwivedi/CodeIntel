import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Bell,
  Palette,
  Database,
  Brain,
  Shield,
  ExternalLink,
  Save,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'llm', label: 'LLM Provider', icon: Brain },
  { id: 'database', label: 'Databases', icon: Database },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('api');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure API keys, LLM providers, and application preferences."
        action={
          <Button onClick={handleSave} variant={saved ? 'secondary' : 'primary'}>
            <Save className="h-4 w-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <GlassCard padding="sm" className="lg:col-span-1 h-fit" hover={false}>
          <nav className="space-y-1 p-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  activeSection === section.id
                    ? 'bg-white/[0.08] text-ink'
                    : 'text-ink-muted hover:bg-white/[0.04] hover:text-ink-secondary',
                )}
              >
                <section.icon
                  className={cn(
                    'h-4 w-4',
                    activeSection === section.id ? 'text-accent-violet' : '',
                  )}
                />
                {section.label}
              </button>
            ))}
          </nav>
        </GlassCard>

        <div className="lg:col-span-3 space-y-6">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeSection === 'api' && (
              <GlassCard padding="lg">
                <h3 className="mb-6 text-lg font-semibold text-ink">API Keys</h3>
                <div className="space-y-5">
                  <Input
                    label="GitHub Token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    hint="Required for private repositories and higher rate limits."
                  />
                  <Input
                    label="Google AI (Gemini)"
                    type="password"
                    placeholder="AIza..."
                  />
                  <Input
                    label="OpenAI API Key"
                    type="password"
                    placeholder="sk-..."
                    hint="Optional fallback for OpenAI-compatible providers."
                  />
                  <Input
                    label="LangSmith API Key"
                    type="password"
                    placeholder="ls__..."
                    hint="Enable tracing and monitoring for LangGraph agents."
                  />
                </div>
              </GlassCard>
            )}

            {activeSection === 'llm' && (
              <GlassCard padding="lg">
                <h3 className="mb-6 text-lg font-semibold text-ink">LLM Provider</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { name: 'Gemini', model: 'gemini-2.0-flash', active: true },
                    { name: 'OpenAI', model: 'gpt-4o', active: false },
                  ].map((provider) => (
                    <div
                      key={provider.name}
                      className={cn(
                        'cursor-pointer rounded-xl border p-5 transition-all',
                        provider.active
                          ? 'border-accent-violet/40 bg-accent-violet/5 ring-1 ring-accent-violet/20'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1]',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-ink">{provider.name}</p>
                        {provider.active && <Badge variant="success">Active</Badge>}
                      </div>
                      <p className="mt-1 font-mono text-xs text-ink-muted">{provider.model}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Input label="Embedding Model" defaultValue="text-embedding-004" />
                </div>
              </GlassCard>
            )}

            {activeSection === 'database' && (
              <GlassCard padding="lg">
                <h3 className="mb-6 text-lg font-semibold text-ink">Database Connections</h3>
                <div className="space-y-5">
                  <Input label="Neo4j URI" defaultValue="bolt://localhost:7687" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Neo4j User" defaultValue="neo4j" />
                    <Input label="Neo4j Password" type="password" defaultValue="••••••••" />
                  </div>
                  <Input label="ChromaDB Host" defaultValue="localhost:8001" />
                  <Input label="Redis URL" defaultValue="redis://localhost:6379/0" />
                </div>
              </GlassCard>
            )}

            {activeSection === 'notifications' && (
              <GlassCard padding="lg">
                <h3 className="mb-6 text-lg font-semibold text-ink">Notifications</h3>
                <div className="space-y-4">
                  {[
                    'Indexing completed',
                    'Indexing failed',
                    'Weekly usage summary',
                  ].map((item) => (
                    <label
                      key={item}
                      className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 cursor-pointer hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="text-sm text-ink-secondary">{item}</span>
                      <div className="relative h-6 w-11 rounded-full bg-accent-violet/80">
                        <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm" />
                      </div>
                    </label>
                  ))}
                </div>
              </GlassCard>
            )}

            {activeSection === 'appearance' && (
              <GlassCard padding="lg">
                <h3 className="mb-6 text-lg font-semibold text-ink">Appearance</h3>
                <p className="text-sm text-ink-muted mb-4">
                  Dark mode is enabled by default for optimal code viewing.
                </p>
                <div className="flex gap-4">
                  <div className="flex-1 rounded-xl border-2 border-accent-violet/50 bg-surface p-4 text-center">
                    <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-surface-raised ring-1 ring-white/10" />
                    <p className="text-sm font-medium text-ink">Dark</p>
                    <Badge variant="success" className="mt-2">Active</Badge>
                  </div>
                  <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center opacity-50">
                    <div className="mx-auto mb-2 h-8 w-8 rounded-lg bg-gray-100" />
                    <p className="text-sm font-medium text-ink-muted">Light</p>
                    <p className="mt-2 text-[10px] text-ink-faint">Coming soon</p>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeSection === 'security' && (
              <GlassCard padding="lg">
                <h3 className="mb-6 text-lg font-semibold text-ink">Security</h3>
                <div className="space-y-4">
                  <div className="rounded-xl border border-accent-emerald/20 bg-accent-emerald/5 p-4">
                    <div className="flex items-center gap-2 text-accent-emerald">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">All connections encrypted</span>
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">
                      API keys are stored locally and never sent to third parties.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                    View Security Documentation
                  </Button>
                </div>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
