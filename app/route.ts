import { readFile } from "node:fs/promises";
import path from "node:path";

// Serve the vanilla roulette page at "/" so the URL stays clean.
export async function GET() {
  const html = await readFile(path.join(process.cwd(), "public", "app.html"), "utf8");
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=0, must-revalidate" } });
}
