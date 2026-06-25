"use client";

import { useState } from "react";
import type { Team } from "@/lib/types";
import { CyberButton } from "./CyberButton";

interface AdminTeamFormProps {
  team?: Team;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export function AdminTeamForm({ team, onSave, onCancel }: AdminTeamFormProps) {
  const [form, setForm] = useState({
    name: team?.name || "",
    code: team?.code || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSave({
        ...form,
        password: form.password || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="text-arena-muted text-xs block mb-1">Team Name</label>
        <input
          className="cyber-input"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <label className="text-arena-muted text-xs block mb-1">Team Code</label>
        <input
          className="cyber-input"
          value={form.code}
          onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
          required
          pattern="[A-Z0-9_]+"
        />
      </div>
      <div>
        <label className="text-arena-muted text-xs block mb-1">
          Password {team ? "(leave empty to keep current)" : "(required)"}
        </label>
        <input
          type="password"
          className="cyber-input"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          required={!team}
          minLength={4}
        />
      </div>

      {error && <p className="text-arena-danger text-sm shake-error">{error}</p>}

      <div className="flex gap-3">
        <CyberButton type="submit" disabled={loading}>
          {loading ? "SAVING..." : team ? "UPDATE" : "CREATE"}
        </CyberButton>
        <CyberButton type="button" variant="secondary" onClick={onCancel}>
          CANCEL
        </CyberButton>
      </div>
    </form>
  );
}
