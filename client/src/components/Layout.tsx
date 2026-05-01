import { Link, useLocation } from "wouter";
import { Heart, LayoutDashboard, ClipboardCheck, BookOpen, MessageCircle, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser, clearUser } from "@/lib/userContext";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checkin", label: "Check-In", icon: ClipboardCheck },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/chat", label: "Support Chat", icon: MessageCircle },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const user = getUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    clearUser();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transform transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-label="MindBridge logo">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" fill="currentColor" className="text-primary"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm text-sidebar-foreground leading-none">MindBridge</div>
            <div className="text-xs text-muted-foreground mt-0.5">Student Wellness</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location === href
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
              data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User profile */}
        {user && (
          <div className="px-3 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.university}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
              data-testid="button-logout"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Heart size={13} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">MindBridge</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
