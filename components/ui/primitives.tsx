import type { ReactNode } from "react";
import { AlertTriangle, Check, CircleHelp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function OperationalHero({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="operational-hero">
      <div className="eyebrow">{eyebrow}</div>
      <div className="hero-row">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {action ? <div className="hero-action">{action}</div> : null}
      </div>
    </section>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("panel", className)}>{children}</section>;
}

export function StatusBadge({ tone = "neutral", children }: { tone?: "neutral" | "warning" | "danger" | "success" | "info"; children: ReactNode }) {
  return <span className={cn("status-badge", `status-${tone}`)}>{children}</span>;
}

export function Button({
  children,
  type = "button",
  variant = "primary",
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button className={cn("button", `button-${variant}`, className)} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton", className)} />;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="state-block empty-state">
      <CircleHelp size={24} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        {action ? <div className="state-action">{action}</div> : null}
      </div>
    </div>
  );
}

export function ErrorState({ title, description, onRetry }: { title: string; description: string; onRetry?: () => void }) {
  return (
    <div className="state-block error-state" role="alert">
      <AlertTriangle size={24} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
        {onRetry ? <Button variant="secondary" onClick={onRetry}><Loader2 size={15} /> إعادة المحاولة</Button> : null}
      </div>
    </div>
  );
}

export function SuccessMark({ children }: { children: ReactNode }) {
  return <span className="success-mark"><Check size={14} aria-hidden="true" />{children}</span>;
}
