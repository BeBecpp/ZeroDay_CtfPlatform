"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MatrixRain } from "@/components/MatrixRain";
import { ArenaNav } from "@/components/ArenaNav";
import { ChallengeCard } from "@/components/ChallengeCard";
import { CountdownTimer } from "@/components/CountdownTimer";
import { StatusChip } from "@/components/StatusChip";
import { getEventLockMessage } from "@/lib/event";
import type { ChallengePublic, EventState } from "@/lib/types";

const CATEGORIES = ["ALL", "WEB", "CRYPTO", "REV", "TRACE", "SHELL", "CHAOS"];

type ArenaEvent = {
  event_name: string;
  start_time: string | null;
  end_time: string | null;
  scoreboard_frozen: boolean;
  state: EventState;
  submissionsEnabled: boolean;
};

export default function ArenaPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengePublic[]>([]);
  const [team, setTeam] = useState<{
    name: string;
    code: string;
    score: number;
  } | null>(null);
  const [event, setEvent] = useState<ArenaEvent | null>(null);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/challenges")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load arena");
          return;
        }
        setChallenges(data.challenges);
        setTeam(data.team);
        setEvent(data.event);
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered =
    filter === "ALL"
      ? challenges
      : challenges.filter((c) => c.category === filter);

  const lockMessage = event
    ? getEventLockMessage({
        id: 1,
        event_name: event.event_name,
        start_time: event.start_time,
        end_time: event.end_time,
        scoreboard_frozen: event.scoreboard_frozen,
      })
    : null;

  const isLocked = event?.state !== "live";

  if (loading) {
    return (
      <main className="min-h-screen">
        <ArenaNav />
        <div className="flex items-center justify-center py-32">
          <p className="text-arena-muted font-mono animate-pulse">
            Loading mission grid...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <ArenaNav />
        <div className="flex items-center justify-center py-32">
          <p className="text-arena-danger font-mono">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <MatrixRain density="low" opacity={0.15} speed="slow" />
      <div className="matrix-overlay opacity-60" aria-hidden="true" />
      <ArenaNav teamName={team?.name} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-arena-neon font-bold text-lg neon-glow">
              MISSION CONTROL
            </h1>
            {team && (
              <p className="text-arena-muted text-sm font-mono mt-1">
                {team.name} &mdash;{" "}
                <span className="text-arena-cyan">{team.score} pts</span>
              </p>
            )}
          </div>
          {event && (
            <CountdownTimer
              endTime={event.end_time}
              startTime={event.start_time}
            />
          )}
        </div>

        {lockMessage && (
          <div className="pixel-border border-arena-amber/50 bg-arena-amber/10 px-4 py-3 text-center">
            <p className="text-arena-amber font-mono text-sm">{lockMessage}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <StatusChip
              key={cat}
              label={cat}
              active={filter === cat}
              onClick={() => setFilter(cat)}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-arena-muted font-mono text-center py-16 uppercase tracking-wider">
            NO MISSIONS LOADED
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                locked={isLocked}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
