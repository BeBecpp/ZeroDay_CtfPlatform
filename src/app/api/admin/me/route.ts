import { getAdminSession, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return jsonError("Not authenticated", 401);
    }
    return jsonSuccess({ role: "admin" });
  } catch (error) {
    return handleApiError(error);
  }
}
