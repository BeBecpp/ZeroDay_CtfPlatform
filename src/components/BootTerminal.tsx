"use client";

import { useEffect, useState } from "react";

const BOOT_LINES = [
  "INITIALIZING ZERO DAY ARENA...",
  "LOADING DUEL ENVIRONMENT...",
  "SYNCING CHALLENGE GRID...",
  "LINKING SCOREBOARD...",
  "ARENA ONLINE.",
];

interface BootTerminalProps {
  onComplete?: () => void;
}

export function BootTerminal({ onComplete }: BootTerminalProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (lineIndex >= BOOT_LINES.length) {
      setDone(true);
      onComplete?.();
      return;
    }

    const target = BOOT_LINES[lineIndex];

    if (charIndex < target.length) {
      const timer = setTimeout(() => {
        setCurrentLine(target.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, 30 + Math.random() * 20);
      return () => clearTimeout(timer);
    }

    const pauseTimer = setTimeout(() => {
      setLines((prev) => [...prev, target]);
      setCurrentLine("");
      setCharIndex(0);
      setLineIndex((i) => i + 1);
    }, 400);

    return () => clearTimeout(pauseTimer);
  }, [lineIndex, charIndex, onComplete]);

  return (
    <div className="font-mono text-sm text-arena-neon/80 space-y-1 text-left w-full max-w-md">
      {lines.map((line, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-arena-cyan">&gt;</span>
          <span>{line}</span>
        </div>
      ))}
      {!done && (
        <div className="flex gap-2">
          <span className="text-arena-cyan">&gt;</span>
          <span className={currentLine ? "terminal-cursor" : ""}>
            {currentLine}
          </span>
        </div>
      )}
    </div>
  );
}
