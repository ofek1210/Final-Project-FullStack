import type { ReactNode } from "react";

export default function AuthShell({   // ⭐ export default
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
      <div className="container h-100 d-flex align-items-center">
        <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
            <div className="mb-3 text-center">
              <span className="brand-pill">
                <i className="bi bi-shield-lock" />
                <span className="fw-semibold">Auth</span>
                <span className="text-white-50">• Glass UI</span>
              </span>
            </div>

            <div className="glass-card p-4 p-md-5">
              <h1 className="h3 mb-1">{title}</h1>
              {subtitle && <p className="muted-link text-center mb-4">{subtitle}</p>}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
