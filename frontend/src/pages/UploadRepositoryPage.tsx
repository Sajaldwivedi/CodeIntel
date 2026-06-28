import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import {
  Github,
  GitBranch,
  Lock,
  Globe,
  ArrowRight,
  Upload,
  FileArchive,
  FolderOpen,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientBorder } from '@/components/ui/GradientBorder';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UploadProgress } from '@/components/repository/UploadProgress';
import { RepositoryInfoCard } from '@/components/repository/RepositoryInfoCard';
import { repositoryService } from '@/services/repository.service';
import { useRepositoryPoll, isProcessing } from '@/hooks/useRepositoryUpload';
import { useAppStore } from '@/store/useAppStore';
import { ApiError } from '@/services/api-client';
import { cn } from '@/lib/utils';
import type { UploadMethod } from '@/types/repository.types';

const UPLOAD_METHODS: {
  id: UploadMethod;
  label: string;
  description: string;
  icon: typeof Github;
}[] = [
  {
    id: 'github-public',
    label: 'Public GitHub',
    description: 'Clone any public repository',
    icon: Globe,
  },
  {
    id: 'github-private',
    label: 'Private GitHub',
    description: 'Use a Personal Access Token',
    icon: Lock,
  },
  {
    id: 'zip',
    label: 'ZIP upload',
    description: 'Upload a compressed archive',
    icon: FileArchive,
  },
  {
    id: 'folder',
    label: 'Local folder',
    description: 'Select a folder from your machine',
    icon: FolderOpen,
  },
];

export function UploadRepositoryPage() {
  const [method, setMethod] = useState<UploadMethod>('github-public');
  const [url, setUrl] = useState('');
  const [branch, setBranch] = useState('');
  const [token, setToken] = useState('');
  const [repoId, setRepoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const zipRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const setSelectedRepo = useAppStore((s) => s.setSelectedRepo);

  const { data: repository, isLoading: polling } = useRepositoryPoll(repoId);
  const processing = repository ? isProcessing(repository) : !!repoId;

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setError(null);
      if (method === 'github-public' || method === 'github-private') {
        return repositoryService.uploadGitHub(
          {
            url: url.trim(),
            branch: branch.trim() || undefined,
            github_token: method === 'github-private' ? token : undefined,
          },
          method === 'github-private' ? token : undefined,
        );
      }
      if (method === 'zip') {
        const file = zipRef.current?.files?.[0];
        if (!file) throw new Error('Select a ZIP file');
        return repositoryService.uploadZip(file);
      }
      const files = folderRef.current?.files;
      if (!files?.length) throw new Error('Select a folder');
      return repositoryService.uploadFolder(files);
    },
    onSuccess: (result) => {
      setRepoId(result.id);
      setSelectedRepo(result.id);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    },
  });

  const handleSubmit = useCallback(() => {
    uploadMutation.mutate();
  }, [uploadMutation]);

  const showForm = !repoId;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Upload Repository"
        description="Connect a GitHub repo, upload a ZIP, or select a local folder to analyze."
      />

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {UPLOAD_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMethod(m.id);
                    setError(null);
                  }}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-all',
                    method === m.id
                      ? 'border-accent-violet/40 bg-accent-violet/10 ring-1 ring-accent-violet/25'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]',
                  )}
                >
                  <m.icon
                    className={cn(
                      'mb-3 h-5 w-5',
                      method === m.id ? 'text-accent-violet' : 'text-ink-muted',
                    )}
                  />
                  <p className="text-sm font-medium text-ink">{m.label}</p>
                  <p className="mt-1 text-xs text-ink-muted">{m.description}</p>
                </button>
              ))}
            </div>

            <GradientBorder variant={method.includes('github') ? 'active' : 'default'}>
              <div className="space-y-5 p-6 sm:p-8">
                {(method === 'github-public' || method === 'github-private') && (
                  <>
                    <Input
                      label="GitHub Repository URL"
                      placeholder="https://github.com/owner/repository"
                      icon={<Github className="h-4 w-4" />}
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      hint={
                        method === 'github-private'
                          ? 'Private repos require a token with repo scope.'
                          : 'Public repositories — no authentication needed.'
                      }
                    />
                    <Input
                      label="Branch (optional)"
                      placeholder="main"
                      icon={<GitBranch className="h-4 w-4" />}
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                    {method === 'github-private' && (
                      <Input
                        label="GitHub Personal Access Token"
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxx"
                        icon={<Lock className="h-4 w-4" />}
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        hint="Create at github.com/settings/tokens with repo scope."
                      />
                    )}
                  </>
                )}

                {method === 'zip' && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-ink-secondary">ZIP archive</p>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-12 transition-colors hover:border-accent-violet/30 hover:bg-white/[0.04]">
                      <FileArchive className="mb-3 h-10 w-10 text-ink-muted" />
                      <p className="text-sm text-ink-secondary">
                        Click to select a .zip file
                      </p>
                      <p className="mt-1 text-xs text-ink-faint">Max 500 MB</p>
                      <input
                        ref={zipRef}
                        type="file"
                        accept=".zip,application/zip"
                        className="hidden"
                        onChange={() => setError(null)}
                      />
                    </label>
                  </div>
                )}

                {method === 'folder' && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-ink-secondary">Local folder</p>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-12 transition-colors hover:border-accent-violet/30 hover:bg-white/[0.04]">
                      <FolderOpen className="mb-3 h-10 w-10 text-ink-muted" />
                      <p className="text-sm text-ink-secondary">
                        Click to select a project folder
                      </p>
                      <p className="mt-1 text-xs text-ink-faint">
                        Includes all files in the selected directory
                      </p>
                      <input
                        ref={folderRef}
                        type="file"
                        // @ts-expect-error webkitdirectory is non-standard but widely supported
                        webkitdirectory=""
                        directory=""
                        multiple
                        className="hidden"
                        onChange={() => setError(null)}
                      />
                    </label>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-accent-rose/20 bg-accent-rose/5 p-4 text-sm text-accent-rose">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSubmit}
                    loading={uploadMutation.isPending}
                    disabled={
                      uploadMutation.isPending ||
                      ((method === 'github-public' || method === 'github-private') &&
                        !url.trim()) ||
                      (method === 'github-private' && !token.trim())
                    }
                  >
                    <Upload className="h-4 w-4" />
                    Start upload
                  </Button>
                </div>
              </div>
            </GradientBorder>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <GlassCard padding="lg">
              {repository ? (
                <UploadProgress repository={repository} />
              ) : (
                <div className="flex flex-col items-center py-12 text-ink-muted">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-violet" />
                  <p className="mt-4 text-sm">Connecting...</p>
                </div>
              )}
            </GlassCard>

            {repository && (
              <RepositoryInfoCard repository={repository} />
            )}

            {repository?.status === 'ready' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap justify-center gap-3"
              >
                <Link to="/repository">
                  <Button size="lg">
                    Open repository
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    setRepoId(null);
                    setError(null);
                    uploadMutation.reset();
                  }}
                >
                  Upload another
                </Button>
              </motion.div>
            )}

            {repository?.status === 'failed' && (
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setRepoId(null);
                    setError(repository.error_message);
                  }}
                >
                  Try again
                </Button>
              </div>
            )}

            {processing && polling && !repository && (
              <p className="text-center text-xs text-ink-faint">Polling status...</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
