"use client";

import { useRef, useState } from "react";
import { CyberButton } from "./CyberButton";
import {
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  isAllowedExtension,
} from "@/lib/storage";

interface AdminFileUploadProps {
  challengeId: string;
  challengeSlug: string;
  currentFilePath?: string | null;
  onUploaded: (filePath: string) => void;
  onRemoved: () => void;
}

export function AdminFileUpload({
  challengeId,
  challengeSlug,
  currentFilePath,
  onUploaded,
  onRemoved,
}: AdminFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [removing, setRemoving] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isAllowedExtension(file.name)) {
      setError(
        `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds 25MB limit");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");
    setSuccess("");
    setProgress(10);

    try {
      const urlRes = await fetch("/api/admin/files/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeSlug,
          fileName: selectedFile.name,
          contentType: selectedFile.type || "application/octet-stream",
          fileSize: selectedFile.size,
        }),
      });

      const urlData = await urlRes.json();
      if (!urlRes.ok) {
        throw new Error(urlData.error || "Failed to get upload URL");
      }

      setProgress(40);

      const uploadRes = await fetch(urlData.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedFile.type || "application/octet-stream",
        },
        body: selectedFile,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file to storage");
      }

      setProgress(70);

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

      setProgress(100);
      setSuccess("FILE ATTACHED");
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded(urlData.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleRemove = async () => {
    if (!currentFilePath) return;
    if (!confirm("Remove attached file from storage?")) return;

    setRemoving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: currentFilePath }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove file");
      }

      setSuccess("FILE REMOVED");
      onRemoved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setRemoving(false);
    }
  };

  const fileName = currentFilePath?.split("/").pop() || "";

  return (
    <div className="space-y-3 border border-arena-cyan/20 p-4 bg-arena-panel/50">
      <label className="text-arena-cyan text-xs font-mono uppercase tracking-wider block">
        Uploaded File
      </label>

      {currentFilePath ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
          <span className="text-arena-muted font-mono truncate" title={currentFilePath}>
            {fileName}
          </span>
          <CyberButton
            type="button"
            variant="danger"
            size="sm"
            onClick={handleRemove}
            disabled={removing || uploading}
          >
            {removing ? "REMOVING..." : "REMOVE FILE"}
          </CyberButton>
        </div>
      ) : (
        <p className="text-arena-muted text-xs font-mono">No file attached</p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="cyber-input text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-arena-neon/20 file:text-arena-neon file:font-mono file:text-xs"
        accept={ALLOWED_EXTENSIONS.join(",")}
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {selectedFile && (
        <p className="text-arena-muted text-xs font-mono">
          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </p>
      )}

      {uploading && (
        <div className="space-y-1">
          <div className="progress-bar">
            <div
              className="progress-bar-fill transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-arena-cyan text-xs font-mono">Uploading... {progress}%</p>
        </div>
      )}

      <CyberButton
        type="button"
        size="sm"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
      >
        {uploading ? "UPLOADING..." : "UPLOAD FILE"}
      </CyberButton>

      {error && (
        <p className="text-arena-danger text-xs font-mono access-denied-shake border border-arena-danger/40 p-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-arena-neon text-xs font-mono breach-pulse border border-arena-neon/40 p-2">
          {success}
        </p>
      )}
    </div>
  );
}
