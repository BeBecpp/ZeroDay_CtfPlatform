import { NextRequest } from "next/server";
import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import {
  buildStoragePath,
  CHALLENGE_FILES_BUCKET,
  isAllowedExtension,
  MAX_FILE_SIZE,
} from "@/lib/storage";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { fileUploadUrlSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const admin = await getAdminSession();
    if (!admin) return jsonError("Not authenticated", 401);

    const body = await request.json();
    const parsed = fileUploadUrlSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { challengeSlug, fileName, contentType, fileSize } = parsed.data;

    if (fileSize > MAX_FILE_SIZE) {
      return jsonError("File exceeds 25MB limit");
    }

    if (!isAllowedExtension(fileName)) {
      return jsonError("File extension not allowed");
    }

    let storagePath: string;
    try {
      storagePath = buildStoragePath(challengeSlug, fileName);
    } catch (err) {
      return jsonError(
        err instanceof Error ? err.message : "Invalid file name"
      );
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(CHALLENGE_FILES_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error) throw error;

    return jsonSuccess({
      path: storagePath,
      signedUrl: data.signedUrl,
      token: data.token,
      contentType,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
