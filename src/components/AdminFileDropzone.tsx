"use client";

import { useCallback, useRef, useState } from "react";
import { CyberButton } from "./CyberButton";
import { validateChallengeFile } from "@/lib/uploadChallengeFile";
import { ALLOWED_EXTENSIONS } from "@/lib/storage";

interface AdminFileDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  attachedFilePath?: string | null;
  onRemoveAttached?: () => Promise<void>;
  uploadProgress?: number;
  disabled?: boolean;
  error?: string;
  success?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminFileDropzone({
  selectedFile,
  onFileSelect,
  attachedFilePath,
  onRemoveAttached,
  uploadProgress = 0,
  disabled = false,
  error,
  success,
}: AdminFileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [localError, setLocalError] = useState("");

  const pickFile = useCallback(
    (file: File | null) => {
      setLocalError("");
      if (!file) {
        onFileSelect(null);
        return;
      }
      const validationError = validateChallengeFile(file);
      if (validationError) {
        setLocalError(validationError);
        onFileSelect(null);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) pickFile(file);
    },
    [disabled, pickFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    pickFile(file);
  };

  const clearSelected = () => {
    onFileSelect(null);
    setLocalError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemoveAttached = async () => {
    if (!attachedFilePath || !onRemoveAttached) return;
    if (!confirm("Remove attached artifact from storage?")) return;
    setRemoving(true);
    setLocalError("");
    try {
      await onRemoveAttached();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "UPLOAD FAILED");
    } finally {
      setRemoving(false);
    }
  };

  const attachedName = attachedFilePath?.split("/").pop() || "";
  const displayError = error || localError;
  const isUploading = uploadProgress > 0 && uploadProgress < 100;

  return (
    <div className="space-y-3">
      <label className="text-arena-cyan text-xs font-mono uppercase tracking-wider block">
        Uploaded File
      </label>
      <p className="text-arena-muted text-[10px] font-mono">
        Drop an artifact here. It will be uploaded when you save the challenge.
      </p>

      {attachedFilePath && !selectedFile && (
        <div className="pixel-border border-arena-neon/40 bg-arena-neon/5 p-3 space-y-2">
          <p className="text-arena-neon text-xs font-mono uppercase tracking-wider">
            ATTACHED ARTIFACT
          </p>
          <p className="text-arena-muted text-sm font-mono truncate" title={attachedFilePath}>
            {attachedName}
          </p>
          {onRemoveAttached && (
            <CyberButton
              type="button"
              variant="danger"
              size="sm"
              onClick={handleRemoveAttached}
              disabled={removing || disabled || isUploading}
            >
              {removing ? "REMOVING..." : "REMOVE ATTACHED"}
            </CyberButton>
          )}
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          artifact-dropzone pixel-border cursor-pointer text-center p-8 transition-all
          ${dragOver ? "border-arena-neon bg-arena-neon/10 shadow-neon" : "border-arena-cyan/30 bg-arena-panel/40"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-arena-neon/50 hover:bg-arena-neon/5"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={handleInputChange}
          disabled={disabled}
        />

        {selectedFile ? (
          <div className="space-y-2 pointer-events-none">
            <p className="text-arena-neon font-mono text-sm uppercase tracking-wider neon-glow">
              READY TO UPLOAD
            </p>
            <p className="text-white font-mono text-sm">{selectedFile.name}</p>
            <p className="text-arena-muted text-xs font-mono">
              {formatSize(selectedFile.size)}
            </p>
          </div>
        ) : (
          <div className="space-y-2 pointer-events-none">
            <p className="text-arena-cyan font-mono text-sm uppercase tracking-wider">
              DROP ARTIFACT HERE
            </p>
            <p className="text-arena-muted text-xs font-mono">or click to browse</p>
            <p className="text-arena-muted text-[10px] font-mono mt-2">
              {ALLOWED_EXTENSIONS.join(" ")} · max 25MB
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <CyberButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            clearSelected();
          }}
          disabled={disabled || isUploading}
        >
          CLEAR SELECTION
        </CyberButton>
      )}

      {isUploading && (
        <div className="space-y-1">
          <div className="progress-bar">
            <div
              className="progress-bar-fill transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-arena-cyan text-xs font-mono">
            Uploading artifact... {uploadProgress}%
          </p>
        </div>
      )}

      {displayError && (
        <p className="text-arena-danger text-xs font-mono access-denied-shake border border-arena-danger/40 p-2">
          UPLOAD FAILED — {displayError}
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
