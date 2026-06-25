"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PixelPanel } from "@/components/PixelPanel";
import { CyberButton } from "@/components/CyberButton";
import { GlitchText } from "@/components/GlitchText";
import { AdminTabs } from "@/components/AdminTabs";
import { AdminChallengeForm } from "@/components/AdminChallengeForm";
import { AdminTeamForm } from "@/components/AdminTeamForm";
import { Toast } from "@/components/Toast";
import type { Challenge, Team } from "@/lib/types";

type Overview = {
  teams: number;
  challenges: number;
  submissions: number;
  solves: number;
  eventState: string;
  scoreboardFrozen: boolean;
  eventName: string;
};

type Submission = {
  id: string;
  team_name: string;
  challenge_title: string;
  submitted_flag: string;
  correct: boolean;
  created_at: string;
};

type EventSettings = {
  event_name: string;
  start_time: string | null;
  end_time: string | null;
  scoreboard_frozen: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [settings, setSettings] = useState<EventSettings | null>(null);

  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/admin/me");
    setAuthenticated(res.ok);
    setChecking(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.error || "Login failed");
      setLoginLoading(false);
      return;
    }
    setAuthenticated(true);
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    router.refresh();
  };

  const loadTabData = useCallback(async (tab: string) => {
    setTabLoading(true);
    try {
      if (tab === "overview") {
        const res = await fetch("/api/admin/overview");
        if (res.ok) setOverview(await res.json());
      } else if (tab === "challenges") {
        const res = await fetch("/api/admin/challenges");
        if (res.ok) {
          const data = await res.json();
          setChallenges(data.challenges);
        }
      } else if (tab === "teams") {
        const res = await fetch("/api/admin/teams");
        if (res.ok) {
          const data = await res.json();
          setTeams(data.teams);
        }
      } else if (tab === "submissions") {
        const res = await fetch("/api/admin/submissions");
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions);
        }
      } else if (tab === "settings") {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }
      }
    } finally {
      setTabLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) loadTabData(activeTab);
  }, [authenticated, activeTab, loadTabData]);

  const saveChallenge = async (data: Record<string, unknown>) => {
    const url = editingChallenge
      ? `/api/admin/challenges/${editingChallenge.id}`
      : "/api/admin/challenges";
    const res = await fetch(url, {
      method: editingChallenge ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Save failed");
    setEditingChallenge(null);
    setCreatingChallenge(false);
    showToast("Challenge saved", "success");
    loadTabData("challenges");
  };

  const deleteChallenge = async (id: string) => {
    if (!confirm("Delete this challenge?")) return;
    await fetch(`/api/admin/challenges/${id}`, { method: "DELETE" });
    showToast("Challenge deleted", "success");
    loadTabData("challenges");
  };

  const saveTeam = async (data: Record<string, unknown>) => {
    const url = editingTeam
      ? `/api/admin/teams/${editingTeam.id}`
      : "/api/admin/teams";
    const res = await fetch(url, {
      method: editingTeam ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Save failed");
    setEditingTeam(null);
    setCreatingTeam(false);
    showToast("Team saved", "success");
    loadTabData("teams");
  };

  const deleteTeam = async (id: string) => {
    if (!confirm("Delete this team and all their data?")) return;
    await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
    showToast("Team deleted", "success");
    loadTabData("teams");
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      showToast("Settings saved", "success");
      loadTabData("overview");
    } else {
      showToast("Failed to save settings", "error");
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-arena-muted font-mono animate-pulse">Loading...</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link href="/" className="text-arena-muted text-xs font-mono hover:text-arena-neon">
              &larr; Arena
            </Link>
            <GlitchText text="ADMIN ACCESS" className="text-2xl font-bold mt-4 block" />
          </div>
          <PixelPanel variant="cyan">
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                className="cyber-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                required
              />
              {loginError && (
                <p className="text-arena-danger text-sm shake-error text-center">{loginError}</p>
              )}
              <CyberButton type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? "AUTHENTICATING..." : "ADMIN LOGIN"}
              </CyberButton>
            </form>
          </PixelPanel>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="border-b border-arena-cyan/20 bg-arena-panel/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-arena-cyan font-bold text-sm neon-glow-cyan">
            ADMIN CONTROL PANEL
          </span>
          <CyberButton size="sm" variant="danger" onClick={handleLogout}>
            Logout
          </CyberButton>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdminTabs active={activeTab} onChange={setActiveTab} />

        {tabLoading && (
          <p className="text-arena-muted font-mono text-sm mb-4 animate-pulse">
            Loading data...
          </p>
        )}

        {activeTab === "overview" && overview && !tabLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Teams", value: overview.teams },
              { label: "Challenges", value: overview.challenges },
              { label: "Submissions", value: overview.submissions },
              { label: "Solves", value: overview.solves },
              { label: "Event State", value: overview.eventState },
              { label: "Scoreboard", value: overview.scoreboardFrozen ? "FROZEN" : "LIVE" },
            ].map((stat) => (
              <PixelPanel key={stat.label} className="text-center">
                <p className="text-arena-muted text-xs font-mono uppercase">{stat.label}</p>
                <p className="text-2xl font-bold text-arena-neon mt-2">{stat.value}</p>
              </PixelPanel>
            ))}
          </div>
        )}

        {activeTab === "challenges" && (
          <div className="space-y-6">
            {!creatingChallenge && !editingChallenge && (
              <CyberButton onClick={() => setCreatingChallenge(true)}>
                + New Challenge
              </CyberButton>
            )}
            {(creatingChallenge || editingChallenge) && (
              <PixelPanel>
                <h3 className="text-arena-neon font-mono mb-4">
                  {editingChallenge ? "Edit Challenge" : "Create Challenge"}
                </h3>
                <AdminChallengeForm
                  challenge={editingChallenge || undefined}
                  onSave={saveChallenge}
                  onCancel={() => {
                    setCreatingChallenge(false);
                    setEditingChallenge(null);
                  }}
                />
              </PixelPanel>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-arena-muted text-xs border-b border-arena-neon/20">
                    <th className="text-left py-2 px-3">Title</th>
                    <th className="text-left py-2 px-3">Category</th>
                    <th className="text-left py-2 px-3">Pts</th>
                    <th className="text-left py-2 px-3">Visible</th>
                    <th className="text-right py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map((c) => (
                    <tr key={c.id} className="border-b border-arena-neon/10 hover:bg-arena-neon/5">
                      <td className="py-2 px-3 text-white">{c.title}</td>
                      <td className="py-2 px-3 text-arena-cyan">{c.category}</td>
                      <td className="py-2 px-3 text-arena-neon">{c.points}</td>
                      <td className="py-2 px-3">{c.visible ? "✓" : "✗"}</td>
                      <td className="py-2 px-3 text-right space-x-2">
                        <button
                          className="text-arena-cyan hover:underline text-xs"
                          onClick={() => setEditingChallenge(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-arena-danger hover:underline text-xs"
                          onClick={() => deleteChallenge(c.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "teams" && (
          <div className="space-y-6">
            {!creatingTeam && !editingTeam && (
              <CyberButton onClick={() => setCreatingTeam(true)}>
                + New Team
              </CyberButton>
            )}
            {(creatingTeam || editingTeam) && (
              <PixelPanel>
                <h3 className="text-arena-neon font-mono mb-4">
                  {editingTeam ? "Edit Team" : "Create Team"}
                </h3>
                <AdminTeamForm
                  team={editingTeam || undefined}
                  onSave={saveTeam}
                  onCancel={() => {
                    setCreatingTeam(false);
                    setEditingTeam(null);
                  }}
                />
              </PixelPanel>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-arena-muted text-xs border-b border-arena-neon/20">
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-left py-2 px-3">Code</th>
                    <th className="text-right py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.id} className="border-b border-arena-neon/10 hover:bg-arena-neon/5">
                      <td className="py-2 px-3 text-white">{t.name}</td>
                      <td className="py-2 px-3 text-arena-cyan">{t.code}</td>
                      <td className="py-2 px-3 text-right space-x-2">
                        <button
                          className="text-arena-cyan hover:underline text-xs"
                          onClick={() => setEditingTeam(t)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-arena-danger hover:underline text-xs"
                          onClick={() => deleteTeam(t.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "submissions" && !tabLoading && (
          <div className="overflow-x-auto">
            {submissions.length === 0 ? (
              <p className="text-arena-muted font-mono text-center py-16 uppercase tracking-wider">
                NO TRAFFIC CAPTURED
              </p>
            ) : (
            <table className="w-full text-sm font-mono min-w-[640px]">
              <thead>
                <tr className="text-arena-muted text-xs border-b border-arena-neon/20">
                  <th className="text-left py-2 px-3">Time</th>
                  <th className="text-left py-2 px-3">Team</th>
                  <th className="text-left py-2 px-3">Challenge</th>
                  <th className="text-left py-2 px-3">Flag</th>
                  <th className="text-left py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-b border-arena-neon/10">
                    <td className="py-2 px-3 text-arena-muted text-xs">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-arena-cyan">{s.team_name}</td>
                    <td className="py-2 px-3 text-white">{s.challenge_title}</td>
                    <td className="py-2 px-3 text-arena-muted truncate max-w-[200px]">
                      {s.submitted_flag}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-xs px-2 py-0.5 border ${
                          s.correct
                            ? "border-arena-neon text-arena-neon"
                            : "border-arena-danger text-arena-danger"
                        }`}
                      >
                        {s.correct ? "CORRECT" : "WRONG"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        )}

        {activeTab === "settings" && settings && (
          <PixelPanel className="max-w-lg">
            <form onSubmit={saveSettings} className="space-y-4">
              <div>
                <label className="text-arena-muted text-xs block mb-1">Event Name</label>
                <input
                  className="cyber-input"
                  value={settings.event_name}
                  onChange={(e) =>
                    setSettings({ ...settings, event_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-arena-muted text-xs block mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  className="cyber-input"
                  value={
                    settings.start_time
                      ? new Date(settings.start_time).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      start_time: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-arena-muted text-xs block mb-1">End Time</label>
                <input
                  type="datetime-local"
                  className="cyber-input"
                  value={
                    settings.end_time
                      ? new Date(settings.end_time).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      end_time: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-arena-muted">
                <input
                  type="checkbox"
                  checked={settings.scoreboard_frozen}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      scoreboard_frozen: e.target.checked,
                    })
                  }
                  className="accent-arena-neon"
                />
                Freeze Scoreboard (hide solve feed)
              </label>
              <CyberButton type="submit">Save Settings</CyberButton>
            </form>
          </PixelPanel>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
