import { NextRequest } from "next/server";
import { getTeamSessionFromRequest, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const session = await getTeamSessionFromRequest(request);
    if (!session) {
      return jsonError("Not authenticated", 401);
    }
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }
    return jsonSuccess({
      team: {
        id: session.teamId,
        name: session.teamName,
        code: session.teamCode,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
