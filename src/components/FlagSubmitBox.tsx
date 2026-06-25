"use client";

import { useState } from "react";
import { CyberButton } from "./CyberButton";

interface FlagSubmitBoxProps {
  challengeSlug: string;
  solved: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  onResult?: (result: {
    correct: boolean;
    message: string;
    points: number;
    alreadySolved: boolean;
  }) => void;
}

export function FlagSubmitBox({
  challengeSlug,
  solved,
  disabled = false,
  disabledMessage,
  onResult,
}: FlagSubmitBoxProps) {
  const [flag, setFlag] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    message: string;
    shake?: boolean;
    breach?: boolean;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (solved || disabled || !flag.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeSlug, flag }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          correct: false,
          message: data.error || "Submission failed",
          shake: true,
        });
        return;
      }

      const newResult = {
        correct: data.correct,
        message: data.message,
        shake: !data.correct,
        breach: data.correct && !data.alreadySolved,
      };

      setResult(newResult);
      onResult?.({
        correct: data.correct,
        message: data.message,
        points: data.points,
        alreadySolved: data.alreadySolved,
      });

      if (data.correct) {
        setFlag("");
      }
    } catch {
      setResult({ correct: false, message: "Network error", shake: true });
    } finally {
      setLoading(false);
    }
  };

  if (solved) {
    return (
      <div className="pixel-border bg-arena-neon/10 p-6 text-center breach-success">
        <p className="text-arena-neon text-2xl font-bold neon-glow">BREACHED</p>
        <p className="text-arena-muted text-sm mt-2">
          Challenge already compromised
        </p>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="pixel-border bg-arena-amber/10 p-6 text-center border-arena-amber/50">
        <p className="text-arena-amber font-mono text-sm">
          {disabledMessage || "SUBMISSIONS DISABLED"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-arena-muted text-xs font-mono uppercase tracking-wider block mb-2">
          Submit Flag
        </label>
        <input
          type="text"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="NF404{...}"
          className={`cyber-input ${result?.shake ? "shake-error" : ""} ${result?.breach ? "breach-success" : ""}`}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <CyberButton type="submit" disabled={loading || !flag.trim()} className="w-full">
        {loading ? "TRANSMITTING..." : "SUBMIT FLAG"}
      </CyberButton>

      {result && (
        <div
          className={`
            text-center font-mono text-sm p-3 border
            ${
              result.correct
                ? "text-arena-neon border-arena-neon/50 bg-arena-neon/10 breach-success"
                : "text-arena-danger border-arena-danger/50 bg-arena-danger/10 shake-error"
            }
          `}
        >
          {result.message}
        </div>
      )}
    </form>
  );
}
