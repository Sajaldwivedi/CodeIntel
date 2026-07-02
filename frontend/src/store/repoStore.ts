import { create } from "zustand";

import { mockRepositories } from "@/data/mock";
import type { Repository } from "@/types";

interface RepoState {
  repositories: Repository[];
  selectedRepoId: string | null;
  selectRepo: (id: string) => void;
  /** Adds a repo in an "indexing" state and simulates progress to completion. */
  addRepository: (input: { owner: string; name: string; description?: string }) => Repository;
  removeRepository: (id: string) => void;
}

let progressTimers: Record<string, ReturnType<typeof setInterval>> = {};

export const useRepoStore = create<RepoState>((set, get) => ({
  repositories: mockRepositories,
  selectedRepoId: mockRepositories[0]?.id ?? null,

  selectRepo: (id) => set({ selectedRepoId: id }),

  addRepository: ({ owner, name, description }) => {
    const repo: Repository = {
      id: `repo-${crypto.randomUUID().slice(0, 8)}`,
      name,
      owner,
      description: description || "Imported from GitHub. Indexing in progress…",
      language: "TypeScript",
      stars: 0,
      forks: 0,
      files: 0,
      chunks: 0,
      status: "indexing",
      progress: 4,
      updatedAt: "just now",
    };

    set((s) => ({ repositories: [repo, ...s.repositories], selectedRepoId: repo.id }));

    // Simulate an indexing pipeline so loading states are demonstrable.
    progressTimers[repo.id] = setInterval(() => {
      const current = get().repositories.find((r) => r.id === repo.id);
      if (!current) {
        clearInterval(progressTimers[repo.id]);
        return;
      }
      const next = Math.min(100, current.progress + Math.random() * 16 + 6);
      set((s) => ({
        repositories: s.repositories.map((r) =>
          r.id === repo.id
            ? {
                ...r,
                progress: Math.round(next),
                files: Math.round((next / 100) * 420),
                chunks: Math.round((next / 100) * 2600),
                status: next >= 100 ? "indexed" : "indexing",
              }
            : r,
        ),
      }));
      if (next >= 100) clearInterval(progressTimers[repo.id]);
    }, 900);

    return repo;
  },

  removeRepository: (id) => {
    clearInterval(progressTimers[id]);
    set((s) => {
      const repositories = s.repositories.filter((r) => r.id !== id);
      const selectedRepoId =
        s.selectedRepoId === id ? (repositories[0]?.id ?? null) : s.selectedRepoId;
      return { repositories, selectedRepoId };
    });
  },
}));
