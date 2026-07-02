import { Link } from "react-router-dom";

import { AuroraBackground } from "@/components/common/AuroraBackground";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <AuroraBackground />
      <p className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-7xl font-bold text-transparent">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button variant="gradient" className="mt-8" asChild>
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
