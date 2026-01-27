import type { ReactNode } from "react";
import PageShell from "./layout/PageShell";

export default function AuthShell({   
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-page">
      <PageShell>
        <div className="glass-card p-4 p-md-5">
          <h1 className="h3 mb-1">{title}</h1>
          {subtitle && <p className="muted-link text-center mb-4">{subtitle}</p>}
          {children}
        </div>
      </PageShell>
    </div>
  );
}
