import { NextRequest } from "next/server";
import { getTeamSessionFromRequest, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError, toPublicChallenge } from "@/lib/api";
import { canSubmitFlags } from "@/lib/event";
import { getEventState } from "@/lib/time";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import type { EventSettings } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const session = await getTeamSessionFromRequest(request);
    if (!session) {
      return jsonError("Not authenticated", 401);
    }

    const supabase = getSupabaseAdmin();

    const { data: challenges, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    const { data: solves } = await supabase
      .from("solves")
      .select("challenge_id")
      .eq("team_id", session.teamId);

    const solvedIds = new Set(solves?.map((s) => s.challenge_id) || []);

    const { data: settings } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .single();

    const eventSettings = settings as EventSettings | null;
    const eventState = eventSettings ? getEventState(eventSettings) : "live";
    const submissionsEnabled = canSubmitFlags(eventSettings);
    const locked = eventState !== "live";

    const result = (challenges || []).map((c) =>
      toPublicChallenge(c, solvedIds.has(c.id), locked)
    );

    const { data: teamSolves } = await supabase
      .from("solves")
      .select("points")
      .eq("team_id", session.teamId);

    const score = teamSolves?.reduce((sum, s) => sum + s.points, 0) || 0;

    return jsonSuccess({
      challenges: result,
      team: {
        id: session.teamId,
        name: session.teamName,
        code: session.teamCode,
        score,
      },
      event: eventSettings
        ? {
            event_name: eventSettings.event_name,
            start_time: eventSettings.start_time,
            end_time: eventSettings.end_time,
            scoreboard_frozen: eventSettings.scoreboard_frozen,
            state: eventState,
            submissionsEnabled,
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
