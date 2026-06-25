import { clearAdminCookie, jsonSuccess } from "@/lib/auth";

export async function POST() {
  const response = jsonSuccess({ message: "Logged out" });
  clearAdminCookie(response);
  return response;
}
