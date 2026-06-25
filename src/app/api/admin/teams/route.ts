import { NextRequest } from "next/server";
import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError, stripTeam } from "@/lib/api";
import { hashPassword } from "@/lib/hash";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { teamCreateSchema } from "@/lib/validators";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("name");

    if (error) throw error;

    return jsonSuccess({
      teams: (data || []).map(stripTeam),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const body = await request.json();
    const parsed = teamCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { password, ...rest } = parsed.data;
    if (!password) {
      return jsonError("Password is required when creating a team");
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("teams")
      .insert({
        ...rest,
        password_hash: await hashPassword(password),
      })
      .select("*")
      .single();

    if (error) throw error;

    return jsonSuccess({ team: stripTeam(data) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
