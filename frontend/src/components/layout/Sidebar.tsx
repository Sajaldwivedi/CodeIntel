import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeft, PanelLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { navItems } from "@/components/layout/navigation";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/utils/cn";

/** Collapsible primary sidebar with active-route highlighting. */
export function Sidebar() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 256 }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className="sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-white/10 bg-white/[0.02] backdrop-blur-xl md:flex"
    >
      <div className={cn("flex h-16 items-center border-b border-white/10 px-4", collapsed && "justify-center px-0")}>
        {collapsed ? <Logo showWordmark={false} to="/" /> : <Logo to="/" />}
      </div>

      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Primary">
          {navItems.map((item) => (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      isActive
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-400 to-cyan-400"
                        />
                      )}
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      <AnimatePresence initial={false}>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            className="truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>

      <div className="border-t border-white/10 p-3">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={toggleSidebar}
          className={cn("w-full", collapsed && "w-auto")}
        >
          {collapsed ? <PanelLeft /> : <ChevronsLeft />}
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
