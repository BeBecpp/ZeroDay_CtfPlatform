"use client";

import { ReactNode } from "react";
import { MatrixRain } from "./MatrixRain";

type Density = "low" | "medium" | "high";
type Speed = "slow" | "normal" | "fast";

interface MatrixBackdropProps {
  children: ReactNode;
  density?: Density;
  opacity?: number;
  speed?: Speed;
  overlay?: boolean;
  className?: string;
}

export function MatrixBackdrop({
  children,
  density = "medium",
  opacity = 0.35,
  speed = "normal",
  overlay = true,
  className = "",
}: MatrixBackdropProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      <MatrixRain density={density} opacity={opacity} speed={speed} />
      {overlay && <div className="matrix-overlay" aria-hidden="true" />}
      <div className="scanline-overlay" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
