import { NextRequest } from "next/server";
import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError, toAdminChallenge } from "@/lib/api";
import { hashFlag } from "@/lib/hash";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { challengeUpdateSchema } from "@/lib/validators";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const { id } = await params;
    const body = await request.json();
    const parsed = challengeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { flag, url, file_url, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = {
      ...rest,
      updated_at: new Date().toISOString(),
    };

    if (url !== undefined) updateData.url = url || null;
    if (file_url !== undefined) updateData.file_url = file_url || null;
    if (flag) updateData.flag_hash = hashFlag(flag);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("challenges")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    if (!data) return jsonError("Challenge not found", 404);

    return jsonSuccess({ challenge: toAdminChallenge(data) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("challenges").delete().eq("id", id);
    if (error) throw error;

    return jsonSuccess({ message: "Challenge deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
