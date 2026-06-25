import { NextRequest } from "next/server";
import {
  createTeamSession,
  jsonError,
  jsonSuccess,
  setTeamCookie,
} from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { verifyPassword } from "@/lib/hash";
import {
  checkRateLimit,
  getClientKey,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rateLimit";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const rateKey = getClientKey(request, "login");
    const { allowed } = checkRateLimit(rateKey, 10, 15 * 60 * 1000);
    if (!allowed) {
      return jsonError(RATE_LIMIT_MESSAGE, 429);
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { identifier, password } = parsed.data;
    const supabase = getSupabaseAdmin();

    const { data: teams, error } = await supabase
      .from("teams")
      .select("id, name, code, password_hash");

    if (error) throw error;

    const team = (teams || []).find(
      (t) =>
        t.code.toLowerCase() === identifier.toLowerCase() ||
        t.name.toLowerCase() === identifier.toLowerCase()
    );

    if (!team) {
      return jsonError("Invalid credentials", 401);
    }

    const valid = await verifyPassword(password, team.password_hash);
    if (!valid) {
      return jsonError("Invalid credentials", 401);
    }

    const token = await createTeamSession({
      teamId: team.id,
      teamName: team.name,
      teamCode: team.code,
    });

    const response = jsonSuccess({
      team: { id: team.id, name: team.name, code: team.code },
    });
    setTeamCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
