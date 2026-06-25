import { NextRequest } from "next/server";
import { getTeamSessionFromRequest, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError, toPublicChallenge } from "@/lib/api";
import { canSubmitFlags } from "@/lib/event";
import { getEventState } from "@/lib/time";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import type { EventSettings } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const session = await getTeamSessionFromRequest(request);
    if (!session) {
      return jsonError("Not authenticated", 401);
    }

    const { slug } = await params;
    const supabase = getSupabaseAdmin();

    const { data: challenge, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("slug", slug)
      .eq("visible", true)
      .single();

    if (error || !challenge) {
      return jsonError("Challenge not found", 404);
    }

    const { data: solve } = await supabase
      .from("solves")
      .select("id")
      .eq("team_id", session.teamId)
      .eq("challenge_id", challenge.id)
      .maybeSingle();

    const { data: settings } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .single();

    const eventSettings = settings as EventSettings | null;
    const eventState = eventSettings ? getEventState(eventSettings) : "live";
    const locked = eventState !== "live";

    return jsonSuccess({
      challenge: toPublicChallenge(challenge, !!solve, locked),
      event: eventSettings
        ? {
            state: eventState,
            submissionsEnabled: canSubmitFlags(eventSettings),
            start_time: eventSettings.start_time,
            end_time: eventSettings.end_time,
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
