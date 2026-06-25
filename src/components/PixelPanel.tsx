import { ReactNode } from "react";

interface PixelPanelProps {
  children: ReactNode;
  className?: string;
  variant?: "green" | "cyan";
}

export function PixelPanel({
  children,
  className = "",
  variant = "green",
}: PixelPanelProps) {
  return (
    <div
      className={`pixel-border ${
        variant === "cyan" ? "pixel-border-cyan" : ""
      } bg-arena-panel/90 backdrop-blur-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}
