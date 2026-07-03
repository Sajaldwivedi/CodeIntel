import type { GraphView, VisEdge, VisNode } from "@/api/diagrams";
import type { Edge, Node } from "@xyflow/react";
import {
  CANVAS_H,
  CANVAS_W,
  filterEdgesForNodes,
  layoutDependencyGraph,
  layoutSystemGraph,
} from "@/components/diagrams/layoutGraph";

const KIND_COLORS: Record<string, string> = {
  frontend: "#22d3ee",
  backend: "#a78bfa",
  service: "#e879f9",
  database: "#34d399",
  util: "#10b981",
  core: "#8b5cf6",
  file: "#8b5cf6",
  api: "#22d3ee",
  external: "#f59e0b",
};

const GROUP_COLORS: Record<string, string> = {
  frontend: "#22d3ee",
  presentation: "#a78bfa",
  business: "#e879f9",
  data: "#34d399",
  infrastructure: "#10b981",
  api: "#22d3ee",
  service: "#e879f9",
  util: "#10b981",
  core: "#8b5cf6",
  external: "#f59e0b",
};

export function visToFlowNodes(nodes: VisNode[], mode: "system" | "dependency"): Node[] {
  return nodes.map((n) => {
    const color =
      mode === "dependency"
        ? GROUP_COLORS[n.group] ?? KIND_COLORS[n.kind] ?? "#8b5cf6"
        : KIND_COLORS[n.kind] ?? GROUP_COLORS[n.group] ?? "#8b5cf6";
    return {
      id: n.id,
      position: {
        x: n.x * CANVAS_W,
        y: n.y * CANVAS_H,
      },
      data: {
        label: n.label,
        description: n.description,
        filePath: n.file_path,
        color,
        kind: n.kind,
      },
      type: "diagram",
    };
  });
}

export function visToFlowEdges(edges: VisEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: e.kind === "flow" || e.kind === "cross_layer",
    style: { stroke: e.kind === "import" ? "rgba(255,255,255,0.25)" : "#a78bfa" },
  }));
}

export function graphViewToFlow(view: GraphView, mode: "system" | "dependency") {
  let nodes = view.nodes;
  let edges = view.edges;
  let truncated = false;

  if (mode === "system") {
    nodes = layoutSystemGraph(nodes);
  } else {
    const laid = layoutDependencyGraph(nodes, edges);
    nodes = laid.nodes;
    truncated = laid.truncated;
    const ids = new Set(nodes.map((n) => n.id));
    edges = filterEdgesForNodes(edges, ids);
  }

  return {
    nodes: visToFlowNodes(nodes, mode),
    edges: visToFlowEdges(edges),
    truncated,
  };
}

export function downloadText(content: string, filename: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportElementPng(element: HTMLElement, filename: string) {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: "#09090b",
    cacheBust: true,
  });
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

export async function exportElementSvg(element: HTMLElement, filename: string) {
  const { toSvg } = await import("html-to-image");
  const dataUrl = await toSvg(element, {
    backgroundColor: "#09090b",
    cacheBust: true,
  });
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

export async function renderMermaidSvg(source: string, id: string): Promise<string> {
  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
  });
  const { svg } = await mermaid.render(id, source);
  return svg;
}

export function downloadSvgMarkup(svg: string, filename: string) {
  downloadText(svg, filename, "image/svg+xml");
}
