import { NextRequest, NextResponse } from "next/server";
import { getTeamSessionFromRequest, jsonError } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { isEventStarted } from "@/lib/event";
import {
  CHALLENGE_FILES_BUCKET,
  isValidStoragePath,
} from "@/lib/storage";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import type { EventSettings } from "@/lib/types";

const SIGNED_URL_TTL = 60 * 5; // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const session = await getTeamSessionFromRequest(request);
    if (!session) {
      return jsonError("Not authenticated", 401);
    }

    const { path: pathSegments } = await params;
    const filePath = pathSegments.map(decodeURIComponent).join("/");

    if (!isValidStoragePath(filePath)) {
      return jsonError("Invalid file path", 400);
    }

    const supabase = getSupabaseAdmin();

    const { data: challenge, error } = await supabase
      .from("challenges")
      .select("id, slug, visible, file_path")
      .eq("file_path", filePath)
      .eq("visible", true)
      .maybeSingle();

    if (error) throw error;
    if (!challenge) {
      return jsonError("File not found or not accessible", 404);
    }

    const { data: settings } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .single();

    const eventSettings = settings as EventSettings | null;
    if (!isEventStarted(eventSettings)) {
      return jsonError("Event has not started", 403);
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(CHALLENGE_FILES_BUCKET)
      .createSignedUrl(filePath, SIGNED_URL_TTL);

    if (signError || !signed?.signedUrl) {
      return jsonError("Failed to generate download URL", 500);
    }

    const format = request.nextUrl.searchParams.get("format");
    if (format === "json") {
      return NextResponse.json({ url: signed.signedUrl });
    }

    return NextResponse.redirect(signed.signedUrl);
  } catch (error) {
    return handleApiError(error);
  }
}
