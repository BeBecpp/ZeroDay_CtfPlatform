export const CHALLENGE_FILES_BUCKET = "challenge-files";

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export const ALLOWED_EXTENSIONS = [
  ".zip",
  ".txt",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".pdf",
  ".py",
  ".js",
  ".pcap",
  ".pcapng",
  ".bin",
  ".exe",
] as const;

const ALLOWED_SET = new Set<string>(ALLOWED_EXTENSIONS);

export function getFileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) return "";
  return fileName.slice(dot).toLowerCase();
}

export function isAllowedExtension(fileName: string): boolean {
  return ALLOWED_SET.has(getFileExtension(fileName));
}

export function sanitizeFileName(fileName: string): string {
  if (
    fileName.includes("..") ||
    fileName.includes("/") ||
    fileName.includes("\\")
  ) {
    throw new Error("Invalid file name");
  }

  const base = fileName.split(/[/\\]/).pop() || fileName;
  const sanitized = base
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "");

  if (!sanitized || sanitized.length < 2) {
    throw new Error("Invalid file name after sanitization");
  }

  if (
    sanitized.includes("..") ||
    sanitized.includes("/") ||
    sanitized.includes("\\")
  ) {
    throw new Error("Invalid file name");
  }

  return sanitized;
}

export function buildStoragePath(
  challengeSlug: string,
  fileName: string
): string {
  if (!/^[a-z0-9-]+$/.test(challengeSlug)) {
    throw new Error("Invalid challenge slug");
  }

  const safeName = sanitizeFileName(fileName);
  if (!isAllowedExtension(safeName)) {
    throw new Error("File extension not allowed");
  }

  return `challenges/${challengeSlug}/${Date.now()}-${safeName}`;
}

export function isValidStoragePath(filePath: string): boolean {
  if (!filePath.startsWith("challenges/")) return false;
  if (filePath.includes("..")) return false;
  if (filePath.includes("\\")) return false;
  const parts = filePath.split("/");
  if (parts.length < 3) return false;
  const slug = parts[1];
  if (!/^[a-z0-9-]+$/.test(slug)) return false;
  const fileName = parts[parts.length - 1];
  return isAllowedExtension(fileName);
}

export function buildDownloadApiPath(filePath: string): string {
  return `/api/files/${filePath.split("/").map(encodeURIComponent).join("/")}`;
}
