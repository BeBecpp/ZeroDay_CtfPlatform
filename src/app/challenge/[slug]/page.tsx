"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArenaNav } from "@/components/ArenaNav";
import { PixelPanel } from "@/components/PixelPanel";
import { FlagSubmitBox } from "@/components/FlagSubmitBox";
import { CyberButton } from "@/components/CyberButton";
import { getEventLockMessage } from "@/lib/event";
import type { ChallengePublic, EventState } from "@/lib/types";

type ChallengeEvent = {
  state: EventState;
  submissionsEnabled: boolean;
  start_time?: string | null;
  end_time?: string | null;
};

export default function ChallengePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [challenge, setChallenge] = useState<ChallengePublic | null>(null);
  const [eventInfo, setEventInfo] = useState<ChallengeEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    fetch(`/api/challenges/${slug}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Challenge not found");
          return;
        }
        setChallenge(data.challenge);
        setSolved(data.challenge.solved);
        if (data.event) {
          setEventInfo(data.event);
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const lockMessage = eventInfo
    ? getEventLockMessage({
        id: 1,
        event_name: "",
        start_time: eventInfo.start_time ?? null,
        end_time: eventInfo.end_time ?? null,
        scoreboard_frozen: false,
      })
    : null;

  const submissionsEnabled = eventInfo?.submissionsEnabled ?? true;

  if (loading) {
    return (
      <main className="min-h-screen">
        <ArenaNav />
        <div className="flex items-center justify-center py-32">
          <p className="text-arena-muted font-mono animate-pulse">
            Loading mission briefing...
          </p>
        </div>
      </main>
    );
  }

  if (error || !challenge) {
    return (
      <main className="min-h-screen">
        <ArenaNav />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-arena-danger font-mono">{error || "Not found"}</p>
          <Link href="/arena">
            <CyberButton variant="secondary">Back to Arena</CyberButton>
          </Link>
        </div>
      </main>
    );
  }

  const hasUrl = challenge.url && challenge.url.trim().length > 0;
  const hasFile = challenge.file_url && challenge.file_url.trim().length > 0;

  return (
    <main className="min-h-screen">
      <ArenaNav />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Link
          href="/arena"
          className="text-arena-muted text-xs font-mono hover:text-arena-neon"
        >
          &larr; Back to Arena
        </Link>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-white">{challenge.title}</h1>
            {solved && (
              <span className="text-arena-neon font-mono text-sm border border-arena-neon px-3 py-1 neon-glow">
                BREACHED
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm font-mono">
            <span className="text-arena-cyan">{challenge.category}</span>
            <span className="text-arena-muted">|</span>
            <span className="text-arena-neon font-bold">
              {challenge.points} pts
            </span>
            <span className="text-arena-muted">|</span>
            <span className="text-arena-muted">{challenge.difficulty}</span>
          </div>
        </div>

        {lockMessage && !solved && (
          <div className="pixel-border border-arena-amber/50 bg-arena-amber/10 px-4 py-3 text-center">
            <p className="text-arena-amber font-mono text-sm">{lockMessage}</p>
          </div>
        )}

        <PixelPanel>
          <div className="text-arena-muted text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {challenge.description}
          </div>

          {(hasUrl || hasFile) && (
            <div className="flex flex-wrap gap-3 mt-6">
              {hasUrl && (
                <a
                  href={challenge.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CyberButton variant="secondary" size="sm">
                    Open Challenge URL
                  </CyberButton>
                </a>
              )}
              {hasFile && (
                <a
                  href={challenge.file_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <CyberButton variant="secondary" size="sm">
                    Download File
                  </CyberButton>
                </a>
              )}
            </div>
          )}
        </PixelPanel>

        <PixelPanel variant="cyan">
          <FlagSubmitBox
            challengeSlug={slug}
            solved={solved}
            disabled={!submissionsEnabled}
            disabledMessage={lockMessage || undefined}
            onResult={(result) => {
              if (result.correct) setSolved(true);
            }}
          />
        </PixelPanel>

        {solved && (
          <div className="text-center">
            <Link href="/arena">
              <CyberButton>Return to Arena</CyberButton>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
