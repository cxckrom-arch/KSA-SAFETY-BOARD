"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Moon,
  Printer,
  Search,
  ScanEye,
  Settings,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import { getSidebarRoutes, routeRegistry, type RouteRegistryEntry } from "@/lib/route-registry";
import { useLocale } from "@/components/providers/locale-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const icons = { "layout-dashboard": LayoutDashboard, "scan-eye": ScanEye, bell: Bell, settings: Settings, printer: Printer };

export function AdminShell({ children, userEmail }: { children: React.ReactNode; userEmail?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, copy, toggleLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const currentRoute = routeRegistry.find((route) => route.path === pathname) ?? routeRegistry[0];
  const navItems = getSidebarRoutes();

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="admin-shell">
      <aside className={cn("sidebar", drawerOpen && "sidebar-open")} aria-label="التنقل الرئيسي">
        <div className="sidebar-brand">
          <Link href="/admin" className="brand-lockup" onClick={() => setDrawerOpen(false)}>
            <span className="board-mark">KSA</span>
            <span><strong>KSA SAFETY</strong><small>BOARD</small></span>
          </Link>
          <button className="icon-button mobile-only" onClick={() => setDrawerOpen(false)} aria-label={copy.closeMenu}><X size={19} /></button>
        </div>

        <div className="sidebar-context">
          <span className="context-dot" />
          <span>{locale === "ar" ? "مساحة تشغيلية" : "Operational space"}</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">{locale === "ar" ? "المساحة" : "Workspace"}</div>
          {navItems.map((item) => {
            const Icon = icons[item.iconName];
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path as never}
                className={cn("nav-item", active && "nav-item-active")}
                aria-current={active ? "page" : undefined}
                onClick={() => setDrawerOpen(false)}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{locale === "ar" ? item.title : item.eyebrow.replace("COMMAND CENTER", "Command center").replace("NOTIFICATIONS", "Notifications").replace("SETTINGS", "Settings")}</span>
                {active ? <span className="nav-active-line" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-note">
            <ShieldCheck size={18} />
            <span>{locale === "ar" ? "سجل تدقيق مفعّل" : "Audit-ready foundation"}</span>
          </div>
          <button className="signout-button" onClick={handleSignOut}>{copy.signOut}</button>
        </div>
      </aside>

      {drawerOpen ? <button className="drawer-backdrop mobile-only" aria-label={copy.closeMenu} onClick={() => setDrawerOpen(false)} /> : null}

      <div className="admin-main">
        <header className="topbar">
          <div className="topbar-leading">
            <button className="icon-button mobile-only" onClick={() => setDrawerOpen(true)} aria-label={copy.openMenu}><Menu size={20} /></button>
            <div className="breadcrumb"><span>KSA</span><ChevronLeft size={14} /><strong>{locale === "ar" ? currentRoute.title : currentRoute.eyebrow}</strong></div>
          </div>
          <div className="topbar-actions">
            {userEmail ? <span className="user-email desktop-only">{userEmail}</span> : null}
            <button className="topbar-action search-trigger" onClick={() => setSearchOpen(true)} aria-label={copy.search}>
              <Search size={17} /><span className="desktop-only">{copy.search}</span><kbd className="desktop-only">⌘ K</kbd>
            </button>
            <Link href="/admin/notifications" className="topbar-action notification-trigger" aria-label={copy.notifications}><Bell size={17} /><span className="notification-dot" /></Link>
            <button className="icon-button" onClick={toggleLocale} aria-label={copy.switchLanguage}><span className="language-code">{locale === "ar" ? "EN" : "ع"}</span></button>
            <button className="icon-button" onClick={toggleTheme} aria-label={copy.switchTheme}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>

      {searchOpen ? <SearchOverlay onClose={() => setSearchOpen(false)} /> : null}
    </div>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { locale, copy } = useLocale();
  const [query, setQuery] = useState("");
  const router = useRouter();
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return routeRegistry;
    return routeRegistry.filter((item) => `${item.title} ${item.eyebrow} ${item.resource}`.toLowerCase().includes(normalized));
  }, [query]);

  const go = (path: RouteRegistryEntry["path"]) => {
    onClose();
    router.push(path as never);
  };

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label={copy.search} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="search-dialog">
        <div className="search-dialog-head"><span className="eyebrow">{copy.search}</span><button className="icon-button" onClick={onClose} aria-label={copy.closeMenu}><X size={18} /></button></div>
        <div className="search-input-wrap"><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} /></div>
        <div className="search-results">
          {results.length ? results.map((item) => <button key={item.path} className="search-result" onClick={() => go(item.path)}><span><strong>{locale === "ar" ? item.title : item.eyebrow}</strong><small>{item.path}</small></span><ChevronRight size={17} /></button>) : <p className="search-no-results">{copy.empty}</p>}
        </div>
      </div>
    </div>
  );
}
