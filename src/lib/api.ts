import { NextResponse } from "next/server";
import type { ChallengePublic } from "./types";
import { buildDownloadApiPath } from "./storage";

export function toPublicChallenge(
  challenge: Record<string, unknown>,
  solved = false,
  locked = false
): ChallengePublic & { locked?: boolean } {
  const filePath = challenge.file_path as string | null | undefined;
  const result: ChallengePublic & { locked?: boolean } = {
    id: challenge.id as string,
    slug: challenge.slug as string,
    title: challenge.title as string,
    category: challenge.category as string,
    points: challenge.points as number,
    difficulty: challenge.difficulty as string,
    description: challenge.description as string,
    url: (challenge.url as string | null) ?? null,
    file_url: (challenge.file_url as string | null) ?? null,
    visible: challenge.visible as boolean,
    solved,
    locked,
  };

  if (filePath) {
    result.downloadUrl = buildDownloadApiPath(filePath);
  }

  return result;
}

export function toAdminChallenge(challenge: Record<string, unknown>) {
  const rest = { ...challenge };
  delete rest.flag_hash;
  return rest;
}

export function toAdminTeam(team: Record<string, unknown>) {
  const rest = { ...team };
  delete rest.password_hash;
  return rest;
}

export function stripChallenge<T extends Record<string, unknown>>(challenge: T) {
  return toAdminChallenge(challenge);
}

export function stripTeam<T extends Record<string, unknown>>(team: T) {
  return toAdminTeam(team);
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  if (error instanceof Error) {
    if (error.message.includes("Supabase")) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }
    if (
      error.message.includes("SESSION_SECRET") ||
      error.message.includes("FLAG_PEPPER")
    ) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
