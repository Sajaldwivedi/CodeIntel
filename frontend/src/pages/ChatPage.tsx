import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, FileCode, Loader2, Send, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { useRepoStore } from "@/store/repoStore";
import { cn } from "@/utils/cn";
import type { ChatMessage, Citation } from "@/types";

const SUGGESTIONS = [
  "How does authentication work?",
  "Where is the database connection configured?",
  "Explain the request lifecycle",
  "What are the main API endpoints?",
];

const CANNED_CITATIONS: Citation[] = [
  {
    path: "backend/app/middleware/error_handler.py",
    startLine: 60,
    endLine: 78,
    snippet: "def register_error_handlers(app: FastAPI) -> None:\n    @app.exception_handler(AppError)\n    async def _handle_app_error(request, exc):",
  },
  {
    path: "backend/app/main.py",
    startLine: 24,
    endLine: 40,
    snippet: "def create_app(settings=None) -> FastAPI:\n    app = FastAPI(title=settings.app_name)\n    register_middleware(app, settings)",
  },
];

export function ChatPage() {
  const repositories = useRepoStore((s) => s.repositories);
  const selectedId = useRepoStore((s) => s.selectedRepoId);
  const activeRepo = repositories.find((r) => r.id === selectedId) ?? repositories[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text: string) => {
    const content = text.trim();
    if (!content || thinking) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const assistant: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Based on the indexed code, this behaviour is implemented via the application factory and a middleware layer. The relevant handlers are registered during startup, and errors are translated into a consistent JSON envelope. See the cited sources below for the exact implementation.",
        citations: CANNED_CITATIONS,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m, assistant]);
      setThinking(false);
    }, 1600);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Code Chat</h1>
            <p className="text-xs text-muted-foreground">
              Chatting with <span className="text-foreground">{activeRepo?.owner}/{activeRepo?.name}</span>
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Hybrid retrieval
        </Badge>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto py-6">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/20 text-primary"
            >
              <Sparkles className="h-7 w-7" />
            </motion.div>
            <h2 className="mt-5 text-xl font-semibold">Ask anything about this codebase</h2>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              Answers are grounded in the actual source and come with citations to exact files and lines.
            </p>
            <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/5"
                >
                  <span className="text-muted-foreground transition-colors group-hover:text-foreground">{s}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {thinking && <TypingIndicator />}
          </AnimatePresence>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-white/10 pt-4">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about functions, files, architecture…"
            className="min-h-[56px] pr-14"
          />
          <Button
            size="icon"
            variant="gradient"
            className="absolute bottom-2.5 right-2.5 h-9 w-9"
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
          >
            {thinking ? <Loader2 className="animate-spin" /> : <ArrowUp />}
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          <Send className="mr-1 inline h-3 w-3" />
          Press Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <AvatarFallback>SJ</AvatarFallback>
        ) : (
          <AvatarFallback className="from-violet-500 to-cyan-400">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={cn("max-w-2xl space-y-3", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-white/10 bg-white/[0.03]",
          )}
        >
          {message.content}
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="w-full space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Sources</p>
            {message.citations.map((c, i) => (
              <Card key={i} className="group overflow-hidden transition-colors hover:border-white/20">
                <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                  <FileCode className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate font-mono text-xs">{c.path}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    L{c.startLine}-{c.endLine}
                  </Badge>
                </div>
                <pre className="overflow-x-auto px-3 py-2 font-mono text-xs text-muted-foreground">
                  {c.snippet}
                </pre>
              </Card>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="from-violet-500 to-cyan-400">
          <Sparkles className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
