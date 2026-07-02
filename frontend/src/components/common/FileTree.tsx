import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, File, FileCode, Folder, FolderOpen } from "lucide-react";

import { cn } from "@/utils/cn";
import type { FileNode } from "@/types";

interface FileTreeProps {
  nodes: FileNode[];
  onSelect?: (node: FileNode) => void;
  selectedId?: string;
}

export function FileTree({ nodes, onSelect, selectedId }: FileTreeProps) {
  return (
    <div className="text-sm">
      {nodes.map((node) => (
        <TreeRow key={node.id} node={node} depth={0} onSelect={onSelect} selectedId={selectedId} />
      ))}
    </div>
  );
}

function TreeRow({
  node,
  depth,
  onSelect,
  selectedId,
}: {
  node: FileNode;
  depth: number;
  onSelect?: (node: FileNode) => void;
  selectedId?: string;
}) {
  const [open, setOpen] = useState(depth < 1);
  const isDir = node.type === "dir";
  const isSelected = node.id === selectedId;

  return (
    <div>
      <button
        onClick={() => (isDir ? setOpen((o) => !o) : onSelect?.(node))}
        className={cn(
          "group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/5",
          isSelected && "bg-white/10 text-foreground",
        )}
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        {isDir ? (
          <>
            <ChevronRight
              className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
            />
            {open ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-cyan-400" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-cyan-400" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            {node.language ? (
              <FileCode className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <File className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </>
        )}
        <span className="truncate">{node.name}</span>
        {node.lines != null && (
          <span className="ml-auto text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {node.lines} L
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isDir && open && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <TreeRow key={child.id} node={child} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
