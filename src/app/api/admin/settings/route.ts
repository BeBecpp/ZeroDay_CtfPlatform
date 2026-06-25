import { NextRequest } from "next/server";
import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { eventSettingsSchema } from "@/lib/validators";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) throw error;

    return jsonSuccess({ settings: data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const body = await request.json();
    const parsed = eventSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("event_settings")
      .update({
        event_name: parsed.data.event_name,
        start_time: parsed.data.start_time || null,
        end_time: parsed.data.end_time || null,
        scoreboard_frozen: parsed.data.scoreboard_frozen,
      })
      .eq("id", 1)
      .select("*")
      .single();

    if (error) throw error;

    return jsonSuccess({ settings: data });
  } catch (error) {
    return handleApiError(error);
  }
}
