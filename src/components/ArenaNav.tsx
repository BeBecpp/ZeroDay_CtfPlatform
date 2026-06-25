"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CyberButton } from "./CyberButton";

interface ArenaNavProps {
  teamName?: string;
}

export function ArenaNav({ teamName }: ArenaNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <nav className="border-b border-arena-neon/20 bg-arena-panel/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/arena" className="font-bold text-arena-neon neon-glow text-sm tracking-wider">
            ZERO DAY ARENA
          </Link>
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
            <Link href="/arena" className="text-arena-muted hover:text-arena-neon transition-colors">
              Arena
            </Link>
            <Link href="/scoreboard" className="text-arena-muted hover:text-arena-cyan transition-colors">
              Scoreboard
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {teamName && (
            <span className="text-arena-cyan text-xs font-mono hidden sm:block">
              {teamName}
            </span>
          )}
          <CyberButton size="sm" variant="secondary" onClick={handleLogout}>
            Logout
          </CyberButton>
        </div>
      </div>
    </nav>
  );
}
