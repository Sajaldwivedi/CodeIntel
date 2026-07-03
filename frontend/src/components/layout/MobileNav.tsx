import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { navItems } from "@/components/layout/navigation";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/utils/cn";

/** Mobile slide-over navigation for small screens. */
export function MobileNav() {
  const open = useAppStore((s) => s.mobileNavOpen);
  const setOpen = useAppStore((s) => s.setMobileNavOpen);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
          />
          <aside
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="absolute left-0 top-0 flex h-full w-[min(88vw,20rem)] flex-col border-r border-white/10 bg-background/95 backdrop-blur-xl"
          >
            <div className="flex h-16 items-center border-b border-white/10 px-4">
              <Logo to="/" />
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Primary">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-[18px] w-[18px]" aria-hidden />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
