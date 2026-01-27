import type { CSSProperties, ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  maxWidth?: number;
  style?: CSSProperties;
};

function getDirection() {
  if (typeof document === "undefined") return "ltr";
  return document.documentElement.getAttribute("dir") || "ltr";
}

export default function PageShell({ children, maxWidth = 1100, style }: PageShellProps) {
  return (
    <div
      dir={getDirection()}
      style={{
        width: "100%",
        padding: "24px 16px",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth,
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
