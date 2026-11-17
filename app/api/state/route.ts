import { auth } from "@/auth";
import { getState, saveState } from "@/lib/db";
import { NextResponse } from "next/server";

const ALLOWED = /^(list|used|hist|day):[a-z]+$/;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const state = await getState(session.user.email);
  return NextResponse.json({ state });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "bad state" }, { status: 400 });
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) if (ALLOWED.test(k)) clean[k] = v;
  if (JSON.stringify(clean).length > 200_000) return NextResponse.json({ error: "too large" }, { status: 413 });
  await saveState(session.user.email, session.user.name ?? null, clean);
  return NextResponse.json({ ok: true });
}
