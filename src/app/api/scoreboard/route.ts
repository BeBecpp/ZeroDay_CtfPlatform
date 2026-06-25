import { jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { getEventState } from "@/lib/time";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import type { EventSettings, ScoreboardTeam, SolveFeedItem } from "@/lib/types";

function relationField<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const supabase = getSupabaseAdmin();

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, code")
      .order("name");

    if (teamsError) throw teamsError;

    const { data: allSolves, error: solvesError } = await supabase
      .from("solves")
      .select("team_id, points, challenge_id");

    if (solvesError) throw solvesError;

    const { data: settings, error: settingsError } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (settingsError) throw settingsError;

    const { data: challenges } = await supabase
      .from("challenges")
      .select("id, points")
      .eq("visible", true);

    const totalPoints =
      challenges?.reduce((sum, c) => sum + c.points, 0) || 0;

    const scoreboardTeams: ScoreboardTeam[] = (teams || []).map((team) => {
      const teamSolves =
        allSolves?.filter((s) => s.team_id === team.id) || [];
      const score = teamSolves.reduce((sum, s) => sum + s.points, 0);
      return {
        id: team.id,
        name: team.name,
        code: team.code,
        score,
        solveCount: teamSolves.length,
      };
    });

    scoreboardTeams.sort((a, b) => b.score - a.score);

    const eventSettings = settings as EventSettings;
    const frozen = eventSettings.scoreboard_frozen;

    let solveFeed: SolveFeedItem[] = [];

    if (!frozen) {
      const { data: feedData } = await supabase
        .from("solves")
        .select(
          `
          id,
          points,
          solved_at,
          teams (name),
          challenges (title)
        `
        )
        .order("solved_at", { ascending: false })
        .limit(50);

      solveFeed = (feedData || []).map((item) => {
        const team = relationField(
          item.teams as { name: string } | { name: string }[] | null
        );
        const challenge = relationField(
          item.challenges as { title: string } | { title: string }[] | null
        );

        return {
          id: item.id,
          team_name: team?.name || "Unknown",
          challenge_title: challenge?.title || "Unknown",
          points: item.points,
          solved_at: item.solved_at,
        };
      });
    }

    return jsonSuccess({
      teams: scoreboardTeams,
      totalPoints,
      solveFeed,
      frozen,
      event: {
        name: eventSettings.event_name,
        start_time: eventSettings.start_time,
        end_time: eventSettings.end_time,
        state: getEventState(eventSettings),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
