import { NextRequest } from "next/server";
import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { CHALLENGE_FILES_BUCKET, isValidStoragePath } from "@/lib/storage";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { fileDeleteSchema } from "@/lib/validators";

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const body = await request.json();
    const parsed = fileDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { filePath } = parsed.data;

    if (!isValidStoragePath(filePath)) {
      return jsonError("Invalid file path");
    }

    const supabase = getSupabaseAdmin();

    const { error: storageError } = await supabase.storage
      .from(CHALLENGE_FILES_BUCKET)
      .remove([filePath]);

    if (storageError) throw storageError;

    await supabase
      .from("challenges")
      .update({ file_path: null, updated_at: new Date().toISOString() })
      .eq("file_path", filePath);

    return jsonSuccess({ message: "File deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
