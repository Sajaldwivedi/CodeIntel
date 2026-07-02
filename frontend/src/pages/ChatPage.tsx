import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, FileCode, Loader2, Send, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { chatWithAgent } from "@/api/agent";
import { useRepoStore } from "@/store/repoStore";
import { cn } from "@/utils/cn";
import type { ChatMessage } from "@/types";

const SUGGESTIONS = [
  "How does authentication work?",
  "Where is the database connection configured?",
  "Explain the request lifecycle",
  "What are the main API endpoints?",
];

export function ChatPage() {
  const repositories = useRepoStore((s) => s.repositories);
  const selectedId = useRepoStore((s) => s.selectedRepoId);
  const activeRepo = repositories.find((r) => r.id === selectedId) ?? repositories[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(undefined);
    setMessages([]);
  }, [activeRepo?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || thinking) return;
    if (!activeRepo) {
      setError("Select or ingest a repository before asking questions.");
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setError(null);

    try {
      const repoId = `${activeRepo.owner}/${activeRepo.name}`;
      const response = await chatWithAgent({
        repo_id: repoId,
        question: content,
        session_id: sessionId,
      });
      setSessionId(response.session_id);
      const assistant: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        citations: response.citations.map((c) => ({
          path: c.file_path,
          startLine: c.start_line,
          endLine: c.end_line,
          snippet: c.snippet,
          functionName: c.function_name,
          source: c.source,
          score: c.score,
        })),
        confidence: response.confidence,
        reasoningSummary: response.reasoning_steps.at(-1),
        reasoningSteps: response.reasoning_steps,
        plan: response.plan,
        toolsUsed: response.tools_used,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m, assistant]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Query failed.";
      setError(message);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: message,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setThinking(false);
    }
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
              AI Software Engineer ·{" "}
              <span className="text-foreground">{activeRepo?.owner}/{activeRepo?.name}</span>
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          LangGraph agent
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
        {error && (
          <p className="mb-2 text-center text-xs text-red-400">{error}</p>
        )}
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

        {!isUser && message.confidence !== undefined && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">Confidence {(message.confidence * 100).toFixed(0)}%</Badge>
            {message.toolsUsed?.map((tool) => (
              <Badge key={tool} variant="secondary">{tool}</Badge>
            ))}
          </div>
        )}

        {message.reasoningSteps && message.reasoningSteps.length > 0 && !isUser && (
          <details className="w-full text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium">Reasoning ({message.reasoningSteps.length} steps)</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              {message.reasoningSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </details>
        )}

        {message.plan && message.plan.length > 0 && !isUser && (
          <p className="text-xs text-muted-foreground">
            Plan: {message.plan.join(" → ")}
          </p>
        )}

        {message.reasoningSummary && !isUser && !message.reasoningSteps?.length && (
          <p className="text-xs text-muted-foreground">{message.reasoningSummary}</p>
        )}

        {message.citations && message.citations.length > 0 && (
          <div className="w-full space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Sources</p>
            {message.citations.map((c, i) => (
              <Card key={i} className="group overflow-hidden transition-colors hover:border-white/20">
                <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                  <FileCode className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate font-mono text-xs">{c.path}</span>
                  {c.functionName && (
                    <Badge variant="secondary" className="text-[10px]">{c.functionName}</Badge>
                  )}
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
