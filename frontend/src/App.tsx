import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ArchitecturePage } from "@/pages/ArchitecturePage";
import { ChatPage } from "@/pages/ChatPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DependencyGraphPage } from "@/pages/DependencyGraphPage";
import { DiagramsPage } from "@/pages/DiagramsPage";
import { LandingPage } from "@/pages/LandingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { RepositoryOverviewPage } from "@/pages/RepositoryOverviewPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { UploadRepositoryPage } from "@/pages/UploadRepositoryPage";

/** Root application component and route table. */
export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated app shell */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadRepositoryPage />} />
            <Route path="/repository" element={<RepositoryOverviewPage />} />
            <Route path="/repository/:id" element={<RepositoryOverviewPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/dependencies" element={<DependencyGraphPage />} />
            <Route path="/diagrams" element={<DiagramsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}
