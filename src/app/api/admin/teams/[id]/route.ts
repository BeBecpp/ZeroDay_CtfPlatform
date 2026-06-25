import { NextRequest } from "next/server";
import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError, stripTeam } from "@/lib/api";
import { hashPassword } from "@/lib/hash";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { teamUpdateSchema } from "@/lib/validators";

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
    const parsed = teamUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { password, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (password) {
      updateData.password_hash = await hashPassword(password);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("teams")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    if (!data) return jsonError("Team not found", 404);

    return jsonSuccess({ team: stripTeam(data) });
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

    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) throw error;

    return jsonSuccess({ message: "Team deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
