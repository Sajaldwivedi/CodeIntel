import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Moon, Palette, Save, Settings as SettingsIcon, Trash2, User } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/appStore";
import { fadeInUp, staggerContainer } from "@/utils/motion";

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeInUp}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary [&_svg]:size-4">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState("sk-••••••••••••••••••••••••");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");

  const saveKeys = () => toast.success("Settings saved", { description: "Your provider configuration was updated." });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title="Settings" description="Manage your account, appearance, and integrations." icon={<SettingsIcon />} />

      <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="show" className="space-y-6">
        {/* Profile */}
        <Section icon={<User />} title="Profile" description="How you appear across the workspace.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium" htmlFor="name">Display name</label>
              <Input id="name" defaultValue="Sajal" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" type="email" defaultValue="sajal@codeintel.dev" className="mt-1.5" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={() => toast.success("Profile updated")}>
              <Save />
              Save profile
            </Button>
          </div>
        </Section>

        {/* Appearance */}
        <Section icon={<Palette />} title="Appearance" description="Customize the look and layout of the app.">
          <Row label="Dark mode" hint="Use the dark, glassmorphic theme.">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </Row>
          <Separator />
          <Row label="Collapse sidebar by default" hint="Start each session with a compact sidebar.">
            <Switch checked={sidebarCollapsed} onCheckedChange={setSidebarCollapsed} />
          </Row>
        </Section>

        {/* Providers */}
        <Section icon={<KeyRound />} title="LLM Provider" description="Connect your model provider for retrieval and generation.">
          <Row label="Provider" hint="Used for embeddings and answer generation.">
            <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
              {(["openai", "gemini"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={
                    "rounded-md px-3 py-1 text-sm capitalize transition-colors " +
                    (provider === p ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </Row>
          <Separator />
          <div className="py-3">
            <label className="text-sm font-medium" htmlFor="key">API key</label>
            <div className="mt-1.5 flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10 font-mono"
                />
                <button
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button variant="gradient" onClick={saveKeys}>
                <Save />
                Save
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">Keys are encrypted at rest and never logged.</p>
          </div>
        </Section>

        {/* Danger zone */}
        <motion.div variants={fadeInUp}>
          <Card className="border-red-500/20 bg-red-500/[0.03]">
            <CardHeader>
              <CardTitle className="text-base text-red-400">Danger zone</CardTitle>
              <CardDescription>Irreversible actions that affect your entire workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Row label="Delete all indexed data" hint="Removes every repository, graph, and vector index.">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete all indexed data?</DialogTitle>
                      <DialogDescription>
                        This permanently removes all repositories and their knowledge graphs and
                        embeddings. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="destructive"
                          onClick={() => toast.error("All data deleted", { description: "Your workspace has been reset." })}
                        >
                          <Trash2 />
                          Yes, delete everything
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Row>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
