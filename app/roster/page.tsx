"use client";

import { useEffect, useState } from "react";
import LogoLoader from "@/components/LogoLoader";
import { getCurrentTeamSlug } from "@/lib/currentTeam";
import { hasSheetsUrl, sheetsGet, sheetsPost } from "@/lib/sheets";
import { Player, RawPlayerRow, rowToPlayer } from "@/lib/types";

export default function RosterPage() {
  const team = getCurrentTeamSlug();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newIsGoalie, setNewIsGoalie] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() {
    if (!hasSheetsUrl()) {
      setError(
        "No Google Sheet connected yet. Deploy the Apps Script web app and set NEXT_PUBLIC_SHEETS_WEBAPP_URL (see README)."
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    sheetsGet("players", { team })
      .then((rows: RawPlayerRow[]) => setPlayers(rows.map(rowToPlayer)))
      .catch((err) => setError(String(err.message || err)))
      .finally(() => setLoading(false));
  }

  // Fetching the roster on mount — not state derived from props, so there's
  // no way to do this outside an effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [team]);

  async function addPlayer() {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    try {
      await sheetsPost("addPlayer", { team, name, number: newNumber.trim(), isGoalie: newIsGoalie });
      setNewName("");
      setNewNumber("");
      setNewIsGoalie(false);
      load();
    } catch (err) {
      setError(String((err as Error).message || err));
    } finally {
      setSaving(false);
    }
  }

  async function removePlayer(id: string) {
    setSaving(true);
    try {
      await sheetsPost("deletePlayer", { team, id });
      load();
    } catch (err) {
      setError(String((err as Error).message || err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleGoalie(player: Player) {
    setSaving(true);
    try {
      await sheetsPost("updatePlayer", { team, id: player.id, isGoalie: !player.isGoalie });
      load();
    } catch (err) {
      setError(String((err as Error).message || err));
    } finally {
      setSaving(false);
    }
  }

  async function updateNumber(player: Player, number: string) {
    if (number === player.number) return;
    // Optimistic — a coach fixing a typo shouldn't have to wait on a round trip.
    setPlayers((prev) => prev.map((p) => (p.id === player.id ? { ...p, number } : p)));
    try {
      await sheetsPost("updatePlayer", { team, id: player.id, number });
    } catch (err) {
      setError(String((err as Error).message || err));
      load();
    }
  }

  const skaters = players.filter((p) => !p.isGoalie);
  const goalies = players.filter((p) => p.isGoalie);

  return (
    <div className="flex flex-col gap-4 py-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Roster</h1>
        <p className="text-sm text-muted">Set this up once — edit it anytime a kid joins or leaves the team.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{error}</div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Add a player</p>
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-2.5">
            <input
              type="text"
              inputMode="numeric"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="#"
              maxLength={3}
              className="w-16 shrink-0 rounded-lg border border-border bg-background px-3 py-3 text-center text-base text-foreground"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Player name"
              maxLength={24}
              className="w-full min-w-0 rounded-lg border border-border bg-background px-3.5 py-3 text-base text-foreground"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={newIsGoalie}
              onChange={(e) => setNewIsGoalie(e.target.checked)}
              className="h-4 w-4 accent-accent"
            />
            This player is a goalie
          </label>
          <button
            onClick={addPlayer}
            disabled={!newName.trim() || saving}
            className="rounded-xl bg-accent py-3 text-sm font-bold text-accent-ink disabled:opacity-40"
          >
            Add Player
          </button>
        </div>
      </div>

      {loading ? (
        <LogoLoader size={44} label="Loading roster…" />
      ) : (
        <>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              Goalies ({goalies.length})
            </p>
            <div className="flex flex-col gap-2">
              {goalies.length === 0 && <p className="text-sm text-muted">No goalie added yet.</p>}
              {goalies.map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  onToggleGoalie={toggleGoalie}
                  onRemove={removePlayer}
                  onUpdateNumber={updateNumber}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              Skaters ({skaters.length})
            </p>
            <div className="flex flex-col gap-2">
              {skaters.length === 0 && <p className="text-sm text-muted">No skaters added yet.</p>}
              {skaters.map((p) => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  onToggleGoalie={toggleGoalie}
                  onRemove={removePlayer}
                  onUpdateNumber={updateNumber}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PlayerRow({
  player,
  onToggleGoalie,
  onRemove,
  onUpdateNumber,
}: {
  player: Player;
  onToggleGoalie: (p: Player) => void;
  onRemove: (id: string) => void;
  onUpdateNumber: (p: Player, number: string) => void;
}) {
  const [number, setNumber] = useState(player.number);

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3.5 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <input
          type="text"
          inputMode="numeric"
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ""))}
          onBlur={() => onUpdateNumber(player, number)}
          placeholder="#"
          maxLength={3}
          aria-label={`Jersey number for ${player.name}`}
          className="w-11 shrink-0 rounded-lg border border-border bg-surface px-1 py-1.5 text-center text-sm font-semibold text-accent"
        />
        <span className="truncate text-sm font-semibold">{player.name}</span>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => onToggleGoalie(player)}
          className="rounded-full border border-border bg-surface px-2.5 py-1.5 text-[11px] font-bold text-muted"
        >
          {player.isGoalie ? "Make skater" : "Make goalie"}
        </button>
        <button
          onClick={() => onRemove(player.id)}
          className="rounded-full border border-transparent bg-danger/15 px-2.5 py-1.5 text-[11px] font-bold text-danger"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
