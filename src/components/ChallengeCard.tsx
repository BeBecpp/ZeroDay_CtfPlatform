"use client";

import Link from "next/link";
import type { ChallengePublic } from "@/lib/types";

interface ChallengeCardProps {
  challenge: ChallengePublic;
  locked?: boolean;
}

const categoryColors: Record<string, string> = {
  WEB: "text-arena-cyan",
  CRYPTO: "text-arena-amber",
  REV: "text-purple-400",
  TRACE: "text-pink-400",
  SHELL: "text-red-400",
  CHAOS: "text-arena-neon",
};

export function ChallengeCard({ challenge, locked = false }: ChallengeCardProps) {
  const solved = challenge.solved;
  const isLocked = locked || challenge.locked;
  const categoryColor = categoryColors[challenge.category] || "text-arena-muted";

  const statusLabel = solved ? "BREACHED" : isLocked ? "LOCKED" : "OPEN";
  const statusClass = solved
    ? "border-arena-neon text-arena-neon bg-arena-neon/10"
    : isLocked
      ? "border-arena-amber text-arena-amber bg-arena-amber/10"
      : "border-arena-muted/40 text-arena-muted";

  const inner = (
    <article
      className={`
        pixel-border card-hover bg-arena-panel/80 p-5 h-full flex flex-col gap-3
        ${solved ? "border-arena-neon/70 bg-arena-neon/5" : ""}
        ${isLocked && !solved ? "opacity-80" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className={`font-bold text-sm leading-tight ${
            solved ? "neon-glow" : "text-white"
          }`}
        >
          {challenge.title}
        </h3>
        <span
          className={`text-xs font-mono px-2 py-0.5 border shrink-0 ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className={`font-mono uppercase ${categoryColor}`}>
          {challenge.category}
        </span>
        <span className="text-arena-muted">|</span>
        <span className="text-arena-neon font-bold">{challenge.points} pts</span>
        <span className="text-arena-muted">|</span>
        <span className="text-arena-muted">{challenge.difficulty}</span>
      </div>

      <p className="text-arena-muted text-xs leading-relaxed line-clamp-2 flex-1">
        {challenge.description.split("\n")[0]}
      </p>
    </article>
  );

  if (isLocked && !solved) {
    return <div className="cursor-not-allowed">{inner}</div>;
  }

  return <Link href={`/challenge/${challenge.slug}`}>{inner}</Link>;
}
