import { NextRequest } from "next/server";
import {
  createAdminSession,
  jsonError,
  jsonSuccess,
  setAdminCookie,
} from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import {
  checkRateLimit,
  getClientKey,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rateLimit";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const rateKey = getClientKey(request, "admin-login");
    const { allowed } = checkRateLimit(rateKey, 5, 15 * 60 * 1000);
    if (!allowed) {
      return jsonError(RATE_LIMIT_MESSAGE, 429);
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return jsonError("Admin not configured", 503);
    }

    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    if (parsed.data.password !== adminPassword) {
      return jsonError("Invalid admin password", 401);
    }

    const token = await createAdminSession();
    const response = jsonSuccess({ role: "admin" });
    setAdminCookie(response, token);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
