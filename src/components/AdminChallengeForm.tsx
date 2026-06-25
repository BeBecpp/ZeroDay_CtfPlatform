"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/types";
import type { Challenge } from "@/lib/types";
import { CyberButton } from "./CyberButton";
import { AdminFileDropzone } from "./AdminFileDropzone";
import {
  removeChallengeFile,
  uploadChallengeFile,
} from "@/lib/uploadChallengeFile";

export type ChallengeSaveResult = {
  challenge: Challenge;
};

interface AdminChallengeFormProps {
  challenge?: Challenge;
  onSave: (data: Record<string, unknown>) => Promise<ChallengeSaveResult>;
  onCancel: () => void;
  onSuccess?: (message: string) => void;
  onPartialSave?: (challenge: Challenge) => void;
}

export function AdminChallengeForm({
  challenge,
  onSave,
  onCancel,
  onSuccess,
  onPartialSave,
}: AdminChallengeFormProps) {
  const [form, setForm] = useState({
    title: challenge?.title || "",
    slug: challenge?.slug || "",
    category: challenge?.category || "WEB",
    points: challenge?.points || 100,
    difficulty: challenge?.difficulty || "Easy",
    description: challenge?.description || "",
    url: challenge?.url || "",
    file_url: challenge?.file_url || "",
    flag: "",
    visible: challenge?.visible ?? true,
    sort_order: challenge?.sort_order || 0,
  });
  const [filePath, setFilePath] = useState<string | null>(
    challenge?.file_path ?? null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setWarning("");
    setUploadProgress(0);

    try {
      const result = await onSave({
        ...form,
        url: form.url || null,
        file_url: form.file_url || null,
        flag: form.flag || undefined,
      });

      const savedChallenge = result.challenge;

      if (selectedFile) {
        try {
          const newPath = await uploadChallengeFile({
            challengeId: savedChallenge.id,
            challengeSlug: form.slug,
            file: selectedFile,
            onProgress: setUploadProgress,
          });
          setFilePath(newPath);
          setSelectedFile(null);
          setSuccess("FILE ATTACHED");
          onSuccess?.("Challenge saved and file attached");
          onCancel();
        } catch (uploadErr) {
          onPartialSave?.(savedChallenge);
          setWarning(
            "Challenge saved, but file upload failed. You can retry upload from edit."
          );
          setError(
            uploadErr instanceof Error ? uploadErr.message : "Upload failed"
          );
          onSuccess?.("Challenge saved (upload failed)");
        }
      } else {
        setSuccess(challenge ? "Challenge updated" : "Challenge created");
        onSuccess?.(challenge ? "Challenge updated" : "Challenge created");
        onCancel();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1500);
    }
  };

  const handleRemoveAttached = async () => {
    if (!filePath) return;
    await removeChallengeFile(filePath);
    setFilePath(null);
    setSuccess("FILE REMOVED");
  };

  const update = (key: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-arena-muted text-xs block mb-1">Title</label>
          <input className="cyber-input" value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>
        <div>
          <label className="text-arena-muted text-xs block mb-1">Slug</label>
          <input className="cyber-input" value={form.slug} onChange={(e) => update("slug", e.target.value)} required pattern="[a-z0-9-]+" />
        </div>
        <div>
          <label className="text-arena-muted text-xs block mb-1">Category</label>
          <select className="cyber-input" value={form.category} onChange={(e) => update("category", e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-arena-muted text-xs block mb-1">Points</label>
          <input type="number" className="cyber-input" value={form.points} onChange={(e) => update("points", parseInt(e.target.value))} required min={1} />
        </div>
        <div>
          <label className="text-arena-muted text-xs block mb-1">Difficulty</label>
          <input className="cyber-input" value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)} required />
        </div>
        <div>
          <label className="text-arena-muted text-xs block mb-1">Sort Order</label>
          <input type="number" className="cyber-input" value={form.sort_order} onChange={(e) => update("sort_order", parseInt(e.target.value))} />
        </div>
        <div className="md:col-span-2">
          <label className="text-arena-muted text-xs block mb-1">Challenge URL (optional)</label>
          <input className="cyber-input" value={form.url} onChange={(e) => update("url", e.target.value)} placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <label className="text-arena-muted text-xs block mb-1">External File URL (optional)</label>
          <input className="cyber-input" value={form.file_url} onChange={(e) => update("file_url", e.target.value)} placeholder="https://example.com/artifact.zip" />
          <p className="text-arena-muted text-[10px] mt-1 font-mono">
            Public external link. Private uploads use the dropzone below.
          </p>
        </div>
      </div>

      <AdminFileDropzone
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        attachedFilePath={filePath}
        onRemoveAttached={filePath ? handleRemoveAttached : undefined}
        uploadProgress={uploadProgress}
        disabled={loading}
        error={warning ? error : undefined}
        success={success}
      />

      {warning && (
        <p className="text-arena-amber text-xs font-mono border border-arena-amber/40 bg-arena-amber/10 p-2">
          {warning}
        </p>
      )}

      <div>
        <label className="text-arena-muted text-xs block mb-1">Description</label>
        <textarea className="cyber-input min-h-[120px]" value={form.description} onChange={(e) => update("description", e.target.value)} required />
      </div>

      <div>
        <label className="text-arena-muted text-xs block mb-1">
          Flag {challenge ? "(leave empty to keep current)" : "(required)"}
        </label>
        <input className="cyber-input" value={form.flag} onChange={(e) => update("flag", e.target.value)} required={!challenge} autoComplete="off" />
      </div>

      <label className="flex items-center gap-2 text-sm text-arena-muted cursor-pointer">
        <input
          type="checkbox"
          checked={form.visible}
          onChange={(e) => update("visible", e.target.checked)}
          className="accent-arena-neon"
        />
        Visible to teams
      </label>

      {error && !warning && (
        <p className="text-arena-danger text-sm access-denied-shake">{error}</p>
      )}

      <div className="flex gap-3">
        <CyberButton type="submit" disabled={loading}>
          {loading
            ? uploadProgress > 0
              ? "UPLOADING..."
              : "SAVING..."
            : challenge
              ? "UPDATE"
              : "CREATE"}
        </CyberButton>
        <CyberButton type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          CANCEL
        </CyberButton>
      </div>
    </form>
  );
}
