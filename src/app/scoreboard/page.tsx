"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MatrixBackdrop } from "@/components/MatrixBackdrop";
import { ScoreCard } from "@/components/ScoreCard";
import { SolveFeed } from "@/components/SolveFeed";
import { CountdownTimer } from "@/components/CountdownTimer";
import { GlitchText } from "@/components/GlitchText";
import { ArenaNav } from "@/components/ArenaNav";
import type { ScoreboardTeam, SolveFeedItem } from "@/lib/types";

export default function ScoreboardPage() {
  const [teams, setTeams] = useState<ScoreboardTeam[]>([]);
  const [solveFeed, setSolveFeed] = useState<SolveFeedItem[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [frozen, setFrozen] = useState(false);
  const [event, setEvent] = useState<{
    name: string;
    start_time: string | null;
    end_time: string | null;
    state: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchScoreboard = () => {
    fetch("/api/scoreboard")
      .then((res) => res.json())
      .then((data) => {
        setTeams(data.teams || []);
        setSolveFeed(data.solveFeed || []);
        setTotalPoints(data.totalPoints || 0);
        setFrozen(data.frozen || false);
        setEvent(data.event);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScoreboard();
    const interval = setInterval(fetchScoreboard, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MatrixBackdrop density="medium" opacity={0.38} speed="normal">
      <main className="relative min-h-screen">
        <ArenaNav />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-2 terminal-panel inline-block w-full py-6">
            <GlitchText text="BATTLE CONTROL" className="text-3xl font-bold" />
            {event && (
              <p className="text-arena-muted text-sm font-mono">{event.name}</p>
            )}
            {event && (
              <div className="flex justify-center mt-4">
                <CountdownTimer
                  endTime={event.end_time}
                  startTime={event.start_time}
                />
              </div>
            )}
          </div>

          {loading ? (
            <p className="text-arena-muted font-mono text-center animate-pulse">
              Syncing battle data...
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((team, i) => (
                  <ScoreCard
                    key={team.id}
                    team={team}
                    totalPoints={totalPoints}
                    rank={i + 1}
                    highlight={i === 0 && team.score > 0}
                  />
                ))}
                {teams.length === 0 && (
                  <p className="text-arena-muted font-mono col-span-2 text-center py-8">
                    No teams registered yet
                  </p>
                )}
              </div>

              <SolveFeed items={solveFeed} frozen={frozen} />
            </>
          )}

          <div className="text-center">
            <Link
              href="/arena"
              className="text-arena-muted text-xs font-mono hover:text-arena-neon"
            >
              &larr; Return to Arena
            </Link>
          </div>
        </div>
      </main>
    </MatrixBackdrop>
  );
}
