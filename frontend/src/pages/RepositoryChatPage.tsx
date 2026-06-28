import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, FileCode, Copy, Check } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GradientBorder } from '@/components/ui/GradientBorder';
import { Button } from '@/components/ui/Button';
import { chatMessages } from '@/data/mock';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d0d0f]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
        <span className="font-mono text-[10px] text-ink-faint">python</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-ink-muted hover:text-ink transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-accent-emerald" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-ink-secondary">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderMessageContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
      return <CodeBlock key={i} code={code.trim()} />;
    }
    return (
      <span key={i} className="whitespace-pre-wrap">
        {part.split(/(`[^`]+`)/g).map((segment, j) =>
          segment.startsWith('`') && segment.endsWith('`') ? (
            <code
              key={j}
              className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-accent-cyan"
            >
              {segment.slice(1, -1)}
            </code>
          ) : (
            segment
          ),
        )}
      </span>
    );
  });
}

export function RepositoryChatPage() {
  const [messages, setMessages] = useState<Message[]>(chatMessages);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  const handleSend = () => {
    if (!input.trim() || streaming) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'Based on my analysis of the codebase, this component follows the established patterns in the services layer. The dependency flow ensures clean separation between the API and persistence layers.',
          citations: ['backend/services/auth.py:42'],
        },
      ]);
      setStreaming(false);
    }, 2000);
  };

  const suggestions = [
    'Explain the indexing pipeline',
    'What are the main modules?',
    'Show me the auth flow',
    'Find circular dependencies',
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <PageHeader
        title="Repository Chat"
        description="Ask architectural questions about your indexed codebase."
      />

      <GradientBorder className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-surface-raised/50">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-4', msg.role === 'user' ? 'flex-row-reverse' : '')}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      msg.role === 'user'
                        ? 'bg-white/[0.08]'
                        : 'bg-gradient-to-br from-accent-violet to-accent-blue shadow-glow-sm',
                    )}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-4 w-4 text-ink-secondary" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>

                  <div className={cn('max-w-[80%] space-y-2', msg.role === 'user' ? 'text-right' : '')}>
                    <div
                      className={cn(
                        'inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-accent-violet/15 text-ink ring-1 ring-accent-violet/20'
                          : 'bg-white/[0.04] text-ink-secondary ring-1 ring-white/[0.06]',
                      )}
                    >
                      {renderMessageContent(msg.content)}
                    </div>

                    {msg.citations && (
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cite) => (
                          <button
                            key={cite}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-2.5 py-1 text-[11px] font-mono text-accent-cyan ring-1 ring-white/[0.06] hover:bg-white/[0.08] transition-colors"
                          >
                            <FileCode className="h-3 w-3" />
                            {cite}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {streaming && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-violet to-accent-blue">
                  <Sparkles className="h-4 w-4 animate-pulse text-white" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-white/[0.04] px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="h-2 w-2 rounded-full bg-accent-violet"
                    />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 2 && (
            <div className="border-t border-white/[0.04] px-6 py-4">
              <p className="mb-3 text-xs text-ink-faint">Suggested questions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-ink-muted hover:border-accent-violet/30 hover:text-ink-secondary transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/[0.06] p-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about architecture, dependencies, patterns..."
                  rows={1}
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 pr-12 text-sm text-ink placeholder:text-ink-faint focus:border-accent-violet/40 focus:outline-none focus:ring-2 focus:ring-accent-violet/20"
                />
              </div>
              <Button onClick={handleSend} disabled={!input.trim() || streaming}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-ink-faint">
              AI responses include citations to source files · Powered by LangGraph
            </p>
          </div>
        </div>
      </GradientBorder>
    </div>
  );
}
