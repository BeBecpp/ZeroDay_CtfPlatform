"use client";

import { useState } from "react";
import Link from "next/link";
import { MatrixRain } from "@/components/MatrixRain";
import { GlitchText } from "@/components/GlitchText";
import { BootTerminal } from "@/components/BootTerminal";
import { CyberButton } from "@/components/CyberButton";
import { StatusChip } from "@/components/StatusChip";

const CATEGORIES = ["WEB", "CRYPTO", "REV", "TRACE", "SHELL", "CHAOS"];

export default function LandingPage() {
  const [bootDone, setBootDone] = useState(false);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <MatrixRain />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 py-16 text-center max-w-2xl mx-auto">
        <div className="space-y-2">
          <GlitchText
            text="ZERO DAY ARENA"
            className="text-4xl sm:text-6xl font-bold tracking-widest"
          />
          <p className="text-arena-cyan text-sm font-mono neon-glow-cyan">
            Enter the arena. Break the logic. Capture the flag.
          </p>
        </div>

        <BootTerminal onComplete={() => setBootDone(true)} />

        <div
          className={`transition-all duration-700 ${
            bootDone ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link href="/login">
            <CyberButton size="lg" className="animate-glow-pulse">
              ENTER ARENA
            </CyberButton>
          </Link>
        </div>

        <p
          className={`text-arena-muted text-xs font-mono transition-opacity duration-700 ${
            bootDone ? "opacity-100" : "opacity-0"
          }`}
        >
          Team vs Team CTF Battleground
        </p>

        <div
          className={`flex flex-wrap justify-center gap-2 transition-opacity duration-1000 delay-300 ${
            bootDone ? "opacity-100" : "opacity-0"
          }`}
        >
          {CATEGORIES.map((cat) => (
            <StatusChip key={cat} label={cat} />
          ))}
        </div>
      </div>
    </main>
  );
}
