import { auth, signIn, signOut } from "@/auth";
import { eventsFromState, getState } from "@/lib/db";

export const dynamic = "force-dynamic";

const MODE: Record<string, { label: string; icon: string; color: string }> = {
  speak: { label: "Speak", icon: "🎤", color: "#f5b544" },
  code: { label: "Vibe Code", icon: "💻", color: "#8b7cff" },
  learn: { label: "Learn", icon: "🧠", color: "#4fd1a0" },
  dsa: { label: "DSA", icon: "🧩", color: "#ff6b6b" },
  design: { label: "Design", icon: "🏗️", color: "#5cc8ff" },
  challenge: { label: "Challenge", icon: "🔥", color: "#ff9f43" },
  interview: { label: "Interview", icon: "💼", color: "#f472b6" },
};

function fmtDate(d: string) {
  if (!d) return "Unknown date";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default async function HistoryPage() {
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!email) {
    return (
      <Shell>
        <h1 style={h1}>History</h1>
        <p style={muted}>Sign in to see what you did on which day, synced across your devices.</p>
        <form action={async () => { "use server"; await signIn("google", { redirectTo: "/history" }); }}>
          <button style={primary}>Sign in with Google</button>
        </form>
      </Shell>
    );
  }

  const state = await getState(email);
  const events = eventsFromState(state);
  const byDate = new Map<string, typeof events>();
  for (const e of events) byDate.set(e.date, [...(byDate.get(e.date) ?? []), e]);
  const days: Record<string, { n: number; streak: number }> = {};
  for (const [k, v] of Object.entries(state ?? {})) if (k.startsWith("day:") && v && typeof v === "object") days[k.slice(4)] = v as { n: number; streak: number };
  const done = events.filter((e) => e.status === "ok").length;
  const skipped = events.filter((e) => e.status === "no").length;

  return (
    <Shell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={h1}>History</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={muted}>{email}</span>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
            <button style={ghost}>Sign out</button>
          </form>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, margin: "18px 0 26px" }}>
        <Stat label="picks" value={events.length} />
        <Stat label="done" value={done} color="#4fd1a0" />
        <Stat label="skipped" value={skipped} color="#ff6b6b" />
        <Stat label="days active" value={byDate.size} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
        {Object.entries(days).map(([m, d]) => (
          <span key={m} style={{ ...pill, borderColor: MODE[m]?.color ?? "#555" }}>
            {MODE[m]?.icon} {MODE[m]?.label ?? m} · day {d.n} · streak {d.streak ?? 0}
          </span>
        ))}
      </div>

      {events.length === 0 && <p style={muted}>Nothing yet. Spin something on the <a href="/" style={{ color: "#f5b544" }}>main page</a> while signed in.</p>}

      {[...byDate.entries()].map(([date, list]) => (
        <section key={date} style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#6f7280", marginBottom: 8 }}>{fmtDate(date)}</div>
          {list.map((e, i) => {
            const m = MODE[e.mode];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "#111217", border: "1px solid rgba(255,255,255,.08)", marginBottom: 6 }}>
                <span style={{ width: 22, textAlign: "center" }}>{e.status === "ok" ? "✅" : e.status === "no" ? "❌" : "⏳"}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: m?.color ?? "#aaa", minWidth: 80 }}>{m?.icon} {m?.label ?? e.mode}</span>
                <span style={{ fontWeight: 600 }}>{e.item.replace(/ · (Easy|Medium|Hard)$/, "")}</span>
              </div>
            );
          })}
        </section>
      ))}
      <p style={{ marginTop: 30 }}><a href="/" style={{ color: "#f5b544", fontWeight: 600 }}>← Back to the roulette</a></p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 60px" }}>{children}</main>;
}
function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ background: "#111217", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.03em", color: color ?? "#f2f2f4" }}>{value}</div>
      <div style={{ fontFamily: '"JetBrains Mono",monospace', fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "#6f7280" }}>{label}</div>
    </div>
  );
}
const h1: React.CSSProperties = { fontSize: 36, fontWeight: 800, letterSpacing: "-.04em", margin: 0 };
const muted: React.CSSProperties = { color: "#6f7280", fontSize: 14 };
const primary: React.CSSProperties = { marginTop: 16, padding: "14px 28px", borderRadius: 12, border: 0, background: "#f5b544", color: "#0b0c10", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" };
const ghost: React.CSSProperties = { padding: "8px 12px", borderRadius: 10, background: "#111217", border: "1px solid rgba(255,255,255,.08)", color: "#f2f2f4", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
const pill: React.CSSProperties = { fontSize: 12, padding: "6px 12px", borderRadius: 999, border: "1px solid", background: "#111217", color: "#f2f2f4" };
