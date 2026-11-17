import { signOut } from "@/auth";

// POST-only so a stray <img> or prefetched link can't sign the user out.
export async function POST() {
  return signOut({ redirectTo: "/" });
}
