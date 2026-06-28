import { useQuery } from '@tanstack/react-query';
import { repositoryService } from '@/services/repository.service';
import type { IndexStatus, Repository } from '@/types/repository.types';

const TERMINAL: IndexStatus[] = ['ready', 'failed'];

export function useRepositoryPoll(repoId: string | null) {
  return useQuery({
    queryKey: ['repository', repoId],
    queryFn: () => repositoryService.get(repoId!),
    enabled: !!repoId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL.includes(status)) return false;
      return 800;
    },
  });
}

export function isProcessing(repo: Repository | undefined): boolean {
  if (!repo) return true;
  return !TERMINAL.includes(repo.status);
}

export const STAGE_LABELS: Record<IndexStatus, string> = {
  pending: 'Queued',
  validating: 'Validating',
  cloning: 'Cloning',
  extracting: 'Extracting',
  scanning: 'Scanning',
  ready: 'Ready',
  failed: 'Failed',
};
