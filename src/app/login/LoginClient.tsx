"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PixelPanel } from "@/components/PixelPanel";
import { CyberButton } from "@/components/CyberButton";
import { GlitchText } from "@/components/GlitchText";

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/arena";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (res.ok) router.replace(nextPath.startsWith("/") ? nextPath : "/arena");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      router.push(nextPath.startsWith("/") ? nextPath : "/arena");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-arena-muted font-mono text-sm animate-pulse">
          Verifying session...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="text-arena-muted text-xs font-mono hover:text-arena-neon">
            &larr; Back to Arena
          </Link>
          <GlitchText text="TEAM AUTH" className="text-2xl font-bold mt-4 block" />
          <p className="text-arena-muted text-xs mt-2 font-mono">
            Authenticate to enter the battleground
          </p>
        </div>

        <PixelPanel>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-arena-muted text-xs font-mono uppercase tracking-wider block mb-2">
                Team Code / Name
              </label>
              <input
                type="text"
                className="cyber-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="NF404"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="text-arena-muted text-xs font-mono uppercase tracking-wider block mb-2">
                Password
              </label>
              <input
                type="password"
                className="cyber-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-arena-danger text-sm font-mono shake-error text-center border border-arena-danger/50 p-2 bg-arena-danger/10">
                {error}
              </p>
            )}

            <CyberButton type="submit" className="w-full" disabled={loading}>
              {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
            </CyberButton>
          </form>
        </PixelPanel>
      </div>
    </main>
  );
}
