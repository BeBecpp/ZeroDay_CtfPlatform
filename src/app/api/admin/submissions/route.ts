import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";

function relationField<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("submissions")
      .select(
        `
        id,
        submitted_flag,
        correct,
        created_at,
        teams (name, code),
        challenges (title, slug)
      `
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    const submissions = (data || []).map((s) => {
      const team = relationField(s.teams as { name: string; code: string } | { name: string; code: string }[] | null);
      const challenge = relationField(
        s.challenges as { title: string; slug: string } | { title: string; slug: string }[] | null
      );

      return {
        id: s.id,
        submitted_flag: s.submitted_flag,
        correct: s.correct,
        created_at: s.created_at,
        team_name: team?.name || "Unknown",
        team_code: team?.code || "???",
        challenge_title: challenge?.title || "Unknown",
        challenge_slug: challenge?.slug || "",
      };
    });

    return jsonSuccess({ submissions });
  } catch (error) {
    return handleApiError(error);
  }
}
