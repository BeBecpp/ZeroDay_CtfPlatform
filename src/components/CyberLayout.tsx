import { ReactNode } from "react";

interface CyberLayoutProps {
  children: ReactNode;
  matrix?: boolean;
  className?: string;
}

export function CyberLayout({
  children,
  matrix = false,
  className = "",
}: CyberLayoutProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {matrix && (
        <div className="pointer-events-none fixed inset-0 z-0 opacity-30">
          {/* Matrix rain is rendered by page when enabled */}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
