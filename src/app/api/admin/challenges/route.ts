import { NextRequest } from "next/server";
import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError, toAdminChallenge } from "@/lib/api";
import { hashFlag } from "@/lib/hash";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { challengeCreateSchema } from "@/lib/validators";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return jsonSuccess({
      challenges: (data || []).map(toAdminChallenge),
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
    const parsed = challengeCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { flag, url, file_url, ...rest } = parsed.data;

    if (!flag) {
      return jsonError("Flag is required when creating a challenge");
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("challenges")
      .insert({
        ...rest,
        url: url || null,
        file_url: file_url || null,
        flag_hash: hashFlag(flag),
      })
      .select("*")
      .single();

    if (error) throw error;

    return jsonSuccess({ challenge: toAdminChallenge(data) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
