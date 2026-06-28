import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UploadRepositoryPage } from '@/pages/UploadRepositoryPage';
import { RepositoryOverviewPage } from '@/pages/RepositoryOverviewPage';
import { ArchitecturePage } from '@/pages/ArchitecturePage';
import { DependencyGraphPage } from '@/pages/DependencyGraphPage';
import { RepositoryChatPage } from '@/pages/RepositoryChatPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/upload', element: <UploadRepositoryPage /> },
      { path: '/repository', element: <RepositoryOverviewPage /> },
      { path: '/architecture', element: <ArchitecturePage /> },
      { path: '/graph', element: <DependencyGraphPage /> },
      { path: '/chat', element: <RepositoryChatPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]);
