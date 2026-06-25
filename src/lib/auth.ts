import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { AdminSession, TeamSession } from "./types";

export const TEAM_COOKIE = "zda_team_session";
export const ADMIN_COOKIE = "zda_admin_session";

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET must be set and at least 16 characters");
  }
  return new TextEncoder().encode(secret);
}

async function signTeamToken(session: TeamSession): Promise<string> {
  return new SignJWT({ ...session, type: "team" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin", type: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyTeamToken(
  token: string
): Promise<TeamSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "team") return null;
    return {
      teamId: payload.teamId as string,
      teamName: payload.teamName as string,
      teamCode: payload.teamCode as string,
    };
  } catch {
    return null;
  }
}

export async function verifyAdminToken(
  token: string
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.type !== "admin" || payload.role !== "admin") return null;
    return { role: "admin" };
  } catch {
    return null;
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export async function createTeamSession(
  session: TeamSession
): Promise<string> {
  return signTeamToken(session);
}

export async function getTeamSession(): Promise<TeamSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEAM_COOKIE)?.value;
  if (!token) return null;
  return verifyTeamToken(token);
}

export function clearTeamSession(response: NextResponse) {
  response.cookies.set(TEAM_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

export async function createAdminSession(): Promise<string> {
  return signAdminToken();
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

export function setTeamCookie(response: NextResponse, token: string) {
  response.cookies.set(TEAM_COOKIE, token, {
    ...cookieOptions(),
    maxAge: 60 * 60 * 24,
  });
}

export function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_COOKIE, token, {
    ...cookieOptions(),
    maxAge: 60 * 60 * 8,
  });
}

export const clearTeamCookie = clearTeamSession;
export const clearAdminCookie = clearAdminSession;

export async function getTeamSessionFromRequest(
  request: NextRequest
): Promise<TeamSession | null> {
  const token = request.cookies.get(TEAM_COOKIE)?.value;
  if (!token) return null;
  return verifyTeamToken(token);
}

export async function getAdminSessionFromRequest(
  request: NextRequest
): Promise<AdminSession | null> {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function jsonError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

// Legacy aliases
export const createTeamToken = createTeamSession;
export const createAdminToken = createAdminSession;
