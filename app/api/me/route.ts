import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { email: session.user.email, name: session.user.name ?? null, image: session.user.image ?? null } });
}
