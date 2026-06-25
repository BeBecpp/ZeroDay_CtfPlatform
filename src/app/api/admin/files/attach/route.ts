import { NextRequest } from "next/server";
import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError, toAdminChallenge } from "@/lib/api";
import { isValidStoragePath } from "@/lib/storage";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { fileAttachSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const body = await request.json();
    const parsed = fileAttachSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { challengeId, filePath } = parsed.data;

    if (!isValidStoragePath(filePath)) {
      return jsonError("Invalid file path");
    }

    const supabase = getSupabaseAdmin();

    const { data: challenge, error: fetchError } = await supabase
      .from("challenges")
      .select("slug")
      .eq("id", challengeId)
      .single();

    if (fetchError || !challenge) {
      return jsonError("Challenge not found", 404);
    }

    const expectedPrefix = `challenges/${challenge.slug}/`;
    if (!filePath.startsWith(expectedPrefix)) {
      return jsonError("File path does not match challenge slug");
    }

    const { data, error } = await supabase
      .from("challenges")
      .update({ file_path: filePath, updated_at: new Date().toISOString() })
      .eq("id", challengeId)
      .select("*")
      .single();

    if (error) throw error;

    return jsonSuccess({ challenge: toAdminChallenge(data) });
  } catch (error) {
    return handleApiError(error);
  }
}
