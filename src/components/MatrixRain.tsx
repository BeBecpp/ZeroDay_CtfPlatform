"use client";

import { useEffect, useRef, useCallback } from "react";

type Density = "low" | "medium" | "high";
type Speed = "slow" | "normal" | "fast";

interface MatrixRainProps {
  density?: Density;
  opacity?: number;
  speed?: Speed;
  className?: string;
}

const DENSITY_CONFIG: Record<Density, { fontSize: number; skip: number }> = {
  low: { fontSize: 16, skip: 2 },
  medium: { fontSize: 14, skip: 1 },
  high: { fontSize: 12, skip: 1 },
};

const SPEED_CONFIG: Record<Speed, number> = {
  slow: 0.4,
  normal: 0.7,
  fast: 1,
};

export function MatrixRain({
  density = "medium",
  opacity = 0.35,
  speed = "normal",
  className = "",
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    drops: [] as number[],
    speeds: [] as number[],
    columns: 0,
    frame: 0,
    visible: true,
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const { fontSize, skip } = DENSITY_CONFIG[density];
    const speedMul = SPEED_CONFIG[speed];
    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01アイウエオ";

    let animationId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const columns = Math.ceil(window.innerWidth / (fontSize * skip));
      stateRef.current.columns = columns;
      stateRef.current.drops = Array(columns).fill(0).map(() => Math.random() * -50);
      stateRef.current.speeds = Array(columns)
        .fill(0)
        .map(() => 0.5 + Math.random() * speedMul);
    };

    const render = () => {
      if (!stateRef.current.visible) {
        animationId = requestAnimationFrame(render);
        return;
      }

      stateRef.current.frame += 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.fillStyle = "rgba(3, 7, 5, 0.08)";
      ctx.fillRect(0, 0, w, h);

      const { drops, speeds, columns } = stateRef.current;

      for (let i = 0; i < columns; i++) {
        if (stateRef.current.frame % skip !== i % skip) continue;

        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize * skip;
        const y = drops[i] * fontSize;

        const isCyan = Math.random() > 0.85;
        const alpha = 0.15 + Math.random() * 0.45;
        ctx.fillStyle = isCyan
          ? `rgba(61, 232, 255, ${alpha * opacity * 2})`
          : `rgba(57, 255, 138, ${alpha * opacity * 2})`;
        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
        ctx.fillText(char, x, y);

        if (y > h && Math.random() > 0.975) {
          drops[i] = 0;
          speeds[i] = 0.5 + Math.random() * speedMul;
        }
        drops[i] += speeds[i];
      }

      animationId = requestAnimationFrame(render);
    };

    resize();
    render();

    const onResize = () => resize();
    const onVisibility = () => {
      stateRef.current.visible = document.visibilityState === "visible";
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(animationId);
    };
  }, [density, opacity, speed]);

  useEffect(() => {
    const cleanup = draw();
    return () => cleanup?.();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`matrix-canvas ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}
