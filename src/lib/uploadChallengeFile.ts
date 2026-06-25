import { MAX_FILE_SIZE, isAllowedExtension } from "./storage";

export type UploadProgressCallback = (percent: number) => void;

export function validateChallengeFile(file: File): string | null {
  if (!isAllowedExtension(file.name)) {
    return "Invalid file type";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File exceeds 25MB limit";
  }
  return null;
}

export async function uploadChallengeFile({
  challengeId,
  challengeSlug,
  file,
  onProgress,
}: {
  challengeId: string;
  challengeSlug: string;
  file: File;
  onProgress?: UploadProgressCallback;
}): Promise<string> {
  const validationError = validateChallengeFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  onProgress?.(10);

  const urlRes = await fetch("/api/admin/files/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challengeSlug,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      fileSize: file.size,
    }),
  });

  const urlData = await urlRes.json();
  if (!urlRes.ok) {
    throw new Error(urlData.error || "Failed to get upload URL");
  }

  onProgress?.(40);

  const uploadRes = await fetch(urlData.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload file to storage");
  }

  onProgress?.(70);

  const attachRes = await fetch("/api/admin/files/attach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challengeId,
      filePath: urlData.path,
    }),
  });

  const attachData = await attachRes.json();
  if (!attachRes.ok) {
    throw new Error(attachData.error || "Failed to attach file");
  }

  onProgress?.(100);
  return urlData.path as string;
}

export async function removeChallengeFile(filePath: string): Promise<void> {
  const res = await fetch("/api/admin/files", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filePath }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to remove file");
  }
}
