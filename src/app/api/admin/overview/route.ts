import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { getEventState } from "@/lib/time";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await requireAdmin();
    if (!admin) return jsonError("Not authenticated", 401);

    const supabase = getSupabaseAdmin();

    const [
      { count: teamCount },
      { count: challengeCount },
      { count: submissionCount },
      { count: solveCount },
      { data: settings },
    ] = await Promise.all([
      supabase.from("teams").select("*", { count: "exact", head: true }),
      supabase.from("challenges").select("*", { count: "exact", head: true }),
      supabase.from("submissions").select("*", { count: "exact", head: true }),
      supabase.from("solves").select("*", { count: "exact", head: true }),
      supabase.from("event_settings").select("*").eq("id", 1).single(),
    ]);

    return jsonSuccess({
      teams: teamCount || 0,
      challenges: challengeCount || 0,
      submissions: submissionCount || 0,
      solves: solveCount || 0,
      eventState: settings ? getEventState(settings) : "live",
      scoreboardFrozen: settings?.scoreboard_frozen || false,
      eventName: settings?.event_name || "ZeroDay Arena",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
