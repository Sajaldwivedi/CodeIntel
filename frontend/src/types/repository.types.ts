export type IndexStatus =
  | 'pending'
  | 'validating'
  | 'cloning'
  | 'extracting'
  | 'scanning'
  | 'ready'
  | 'failed';

export type UploadSource = 'github' | 'zip' | 'folder';

export interface LanguageStat {
  language: string;
  percentage: number;
  bytes: number;
  files: number;
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  source: UploadSource;
  url: string | null;
  branch: string | null;
  commit_hash: string | null;
  status: IndexStatus;
  progress: number;
  current_stage: string | null;
  file_count: number;
  total_size_bytes: number;
  primary_language: string | null;
  languages: LanguageStat[];
  description: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  ready_at: string | null;
}

export interface UploadAccepted {
  id: string;
  status: IndexStatus;
  message: string;
}

export interface GitHubUploadPayload {
  url: string;
  branch?: string;
  github_token?: string;
}

export type UploadMethod = 'github-public' | 'github-private' | 'zip' | 'folder';
