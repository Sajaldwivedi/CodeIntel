import { apiDelete, apiGet, apiPost, apiPostForm } from './api-client';
import type {
  GitHubUploadPayload,
  Repository,
  UploadAccepted,
} from '@/types/repository.types';

export const repositoryService = {
  list(): Promise<{ items: Repository[]; total: number }> {
    return apiGet('/repositories');
  },

  get(id: string): Promise<Repository> {
    return apiGet(`/repositories/${id}`);
  },

  uploadGitHub(
    payload: GitHubUploadPayload,
    token?: string,
  ): Promise<UploadAccepted> {
    const headers: Record<string, string> = {};
    if (token) headers['X-GitHub-Token'] = token;
    return apiPost('/repositories/github', payload, headers);
  },

  uploadZip(file: File, name?: string): Promise<UploadAccepted> {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);
    return apiPostForm('/repositories/upload/zip', form);
  },

  uploadFolder(files: FileList, name?: string): Promise<UploadAccepted> {
    const form = new FormData();
    Array.from(files).forEach((file) => {
      form.append('files', file);
      form.append('paths', file.webkitRelativePath || file.name);
    });
    if (name) form.append('name', name);
    return apiPostForm('/repositories/upload/folder', form);
  },

  delete(id: string): Promise<void> {
    return apiDelete(`/repositories/${id}`);
  },
};
