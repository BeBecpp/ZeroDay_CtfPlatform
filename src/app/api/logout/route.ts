import { clearTeamCookie, jsonSuccess } from "@/lib/auth";

export async function POST() {
  const response = jsonSuccess({ message: "Logged out" });
  clearTeamCookie(response);
  return response;
}
