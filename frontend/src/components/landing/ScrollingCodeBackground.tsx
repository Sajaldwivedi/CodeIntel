const CODE_SNIPPETS = [
  `@app.middleware("http")
async def auth_middleware(request, call_next):
    token = request.headers.get("Authorization")
    user = await TokenValidator.validate(token)
    request.state.user = user
    return await call_next(request)`,

  `class RepositoryService:
    async def register(self, url: str) -> Repository:
        repo = await self.github.clone(url)
        await self.queue.enqueue("index", repo.id)
        return repo`,

  `export function useChat(repoId: string) {
  return useMutation({
    mutationFn: (msg) => chatService.stream(repoId, msg),
    onSuccess: (stream) => appendMessages(stream),
  });
}`,

  `MATCH (f:Function)-[:CALLS]->(g:Function)
WHERE f.name = $symbol
RETURN g.name, g.file_path
ORDER BY g.file_path`,

  `const graph = new StateGraph(AgentState)
  .addNode("retrieve", retrieveNode)
  .addNode("synthesize", synthesizeNode)
  .addEdge("retrieve", "synthesize");`,

  `async def embed_chunks(chunks: list[CodeChunk]):
    vectors = await generator.embed([c.text for c in chunks])
    await chroma.upsert(chunks, vectors)`,

  `interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layout: 'dagre' | 'elk';
}`,

  `def parse_file(path: Path) -> ParsedFile:
    tree = parser.parse(path.read_bytes())
    symbols = SymbolExtractor().visit(tree.root_node)
    return ParsedFile(path, symbols)`,

  `CREATE (r:Repository {id: $id, url: $url})
CREATE (f:File {path: $path})-[:CONTAINS]->(r)
CREATE (fn:Function {name: $name})-[:CONTAINS]->(f)`,

  `const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/dashboard", element: <Dashboard /> },
]);`,

  `class IndexingPipeline:
    stages = ["clone", "parse", "embed", "graph"]
    async def run(self, repo_id: str):
        for stage in self.stages:
            await getattr(self, stage)(repo_id)`,

  `export const useAppStore = create<AppState>((set) => ({
  selectedRepoId: null,
  setSelectedRepo: (id) => set({ selectedRepoId: id }),
}));`,
];

const COLORS = [
  'text-accent-violet/70',
  'text-accent-blue/70',
  'text-accent-cyan/70',
  'text-accent-emerald/60',
  'text-ink-muted/80',
];

interface ColumnProps {
  snippets: string[];
  duration: number;
  reverse?: boolean;
  className?: string;
}

function CodeColumn({ snippets, duration, reverse, className }: ColumnProps) {
  const doubled = [...snippets, ...snippets];

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <div
        className={`flex flex-col gap-4 ${reverse ? 'animate-scroll-up' : 'animate-scroll-down'}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((snippet, i) => (
          <div
            key={i}
            className="shrink-0 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 backdrop-blur-sm"
          >
            <pre
              className={`font-mono text-[11px] leading-relaxed whitespace-pre-wrap ${COLORS[i % COLORS.length]}`}
            >
              {snippet}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScrollingCodeBackground() {
  const col1 = CODE_SNIPPETS.slice(0, 4);
  const col2 = CODE_SNIPPETS.slice(4, 8);
  const col3 = CODE_SNIPPETS.slice(8, 12);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-[#030303]/95 to-[#030303]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)',
        }}
      >
        <div className="grid h-[120%] grid-cols-3 gap-4 px-4 -translate-y-[5%]">
          <CodeColumn snippets={col1} duration={45} className="opacity-40" />
          <CodeColumn snippets={col2} duration={55} reverse className="opacity-30 hidden sm:block" />
          <CodeColumn snippets={col3} duration={40} className="opacity-25 hidden lg:block" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-[#030303]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/80 via-transparent to-[#030303]" />
    </div>
  );
}
