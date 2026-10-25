"use client";

import { useEffect, useState } from "react";
import { hasSheetsUrl, sheetsGet, sheetsPost } from "@/lib/sheets";
import { RawTeamRow, Team, rowToTeam } from "@/lib/types";
import { getCurrentTeamSlug, setCurrentTeamSlug, LEGACY_TEAM_SLUG } from "@/lib/currentTeam";

export default function TeamSwitcher() {
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentSlug, setCurrentSlug] = useState(LEGACY_TEAM_SLUG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  function loadTeams() {
    if (!hasSheetsUrl()) return;
    setLoading(true);
    setError(null);
    sheetsGet("teams")
      .then((rows: RawTeamRow[]) => setTeams(rows.map(rowToTeam)))
      .catch((err) => setError(String(err.message || err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    // Reading the active team and fetching the team list on mount — not
    // state derived from props, so there's no way to do this outside an
    // effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentSlug(getCurrentTeamSlug());
    loadTeams();
  }, []);

  function openSwitcher() {
    setOpen(true);
    loadTeams();
  }

  const currentName = teams.find((t) => t.slug === currentSlug)?.name || "Team";

  function selectTeam(team: Team) {
    setCurrentTeamSlug(team.slug);
    window.location.reload();
  }

  async function addTeam() {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setError(null);
    try {
      const res = await sheetsPost("addTeam", { name });
      if (res?.slug) {
        setCurrentTeamSlug(res.slug);
        window.location.reload();
      } else {
        setError("Couldn't add that team — try again.");
        setAdding(false);
      }
    } catch (err) {
      setError(String((err as Error).message || err));
      setAdding(false);
    }
  }

  return (
    <>
      <button onClick={openSwitcher} className="flex min-w-0 flex-col items-start leading-tight">
        <span className="flex items-center gap-1 truncate font-display text-xl font-semibold uppercase tracking-wide">
          {currentName}
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" className="shrink-0 text-muted">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">NYHL-Shifts</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/55 p-4 sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-lg">
            <h3 className="mb-3 font-display text-2xl font-semibold">Switch Team</h3>

            {error && (
              <div className="mb-3 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                {error}
              </div>
            )}

            <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
              {loading && <p className="text-sm text-muted">Loading teams…</p>}
              {!loading &&
                teams.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => selectTeam(t)}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-left ${
                      t.slug === currentSlug
                        ? "border-accent/40 bg-accent/10"
                        : "border-border bg-background"
                    }`}
                  >
                    <span className="text-sm font-semibold">{t.name}</span>
                    {t.slug === currentSlug && <span className="text-xs font-bold text-accent">Active</span>}
                  </button>
                ))}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                Coaching another team?
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Team name"
                  maxLength={40}
                  className="w-full min-w-0 rounded-lg border border-border bg-background px-3.5 py-3 text-base text-foreground"
                />
                <button
                  onClick={addTeam}
                  disabled={!newName.trim() || adding}
                  className="shrink-0 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-ink disabled:opacity-40"
                >
                  Add
                </button>
              </div>
              <p className="mt-2 text-[11px] text-muted">
                Starts a brand new roster and game log — nothing here is shared with your other teams.
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-xl border border-border bg-transparent py-2.5 text-sm font-semibold text-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
