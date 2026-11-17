import { signIn } from "@/auth";

// Skip Auth.js's provider-picker page: go straight to Google's account chooser.
export async function GET() {
  return signIn("google", { redirectTo: "/" });
}
