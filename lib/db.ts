import { neon } from "@neondatabase/serverless";

export type RouletteState = Record<string, unknown>;

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

let ready: Promise<void> | null = null;
function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      const q = sql();
      await q`CREATE TABLE IF NOT EXISTS roulette_users (
        email TEXT PRIMARY KEY,
        name TEXT,
        state JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
    })();
  }
  return ready;
}

export async function getState(email: string): Promise<RouletteState | null> {
  await ensureSchema();
  const rows = await sql()`SELECT state FROM roulette_users WHERE email = ${email}`;
  return rows.length ? (rows[0].state as RouletteState) : null;
}

export async function saveState(email: string, name: string | null, state: RouletteState) {
  await ensureSchema();
  await sql()`INSERT INTO roulette_users (email, name, state)
    VALUES (${email}, ${name}, ${JSON.stringify(state)}::jsonb)
    ON CONFLICT (email) DO UPDATE SET state = EXCLUDED.state, name = COALESCE(EXCLUDED.name, roulette_users.name), updated_at = now()`;
}

/** Flatten the stored state into a date-sorted list of events for the history page. */
export type HistoryEvent = { date: string; mode: string; item: string; status: "ok" | "no" | null };
export function eventsFromState(state: RouletteState | null): HistoryEvent[] {
  if (!state) return [];
  const out: HistoryEvent[] = [];
  for (const [key, val] of Object.entries(state)) {
    if (!key.startsWith("hist:") || !Array.isArray(val)) continue;
    const mode = key.slice(5);
    for (const h of val as Array<{ t: string; s: "ok" | "no" | null; d?: string }>) {
      if (h && typeof h.t === "string") out.push({ date: h.d ?? "", mode, item: h.t, status: h.s ?? null });
    }
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
