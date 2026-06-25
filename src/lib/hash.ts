import { createHash } from "crypto";
import bcrypt from "bcryptjs";

export function hashFlag(flag: string): string {
  const pepper = process.env.FLAG_PEPPER;
  if (!pepper) {
    throw new Error("FLAG_PEPPER environment variable is not set");
  }
  const trimmed = flag.trim();
  return createHash("sha256").update(trimmed + pepper).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function verifyFlag(submittedFlag: string, storedHash: string): boolean {
  const computed = hashFlag(submittedFlag);
  return computed === storedHash;
}
