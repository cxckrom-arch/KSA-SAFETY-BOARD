import Link from "next/link";
import { ArrowUpLeft, ShieldCheck } from "lucide-react";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-shell">
      <header className="public-header">
        <Link href="/" className="brand-lockup">
          <span className="board-mark">KSA</span>
          <span><strong>KSA SAFETY</strong><small>BOARD</small></span>
        </Link>
        <Link href="/admin/login" className="public-login-link">تسجيل الدخول <ArrowUpLeft size={15} /></Link>
      </header>
      {children}
      <footer className="public-footer"><ShieldCheck size={16} /> KSA SAFETY BOARD · Operational safety foundation</footer>
    </div>
  );
}
