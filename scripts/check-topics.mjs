// Run after editing topics: node scripts/check-topics.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const html = readFileSync(new URL("../public/app.html", import.meta.url), "utf8");
const src = html.slice(html.indexOf("const MODES ="), html.indexOf("const DIFFS="));
const { MODES, POOL, POOL_START } = new Function(src + "return { MODES, POOL, POOL_START };")();

for (const m of Object.keys(MODES)) {
  const pool = POOL[m], base = new Set(MODES[m].list);
  assert.ok(pool?.length, `${m}: empty pool`);
  assert.equal(new Set(pool).size, pool.length, `${m}: duplicate inside POOL`);
  for (const t of pool) assert.ok(!base.has(t), `${m}: "${t}" is already in the built-in list`);
  if (m === "dsa") for (const t of pool) assert.match(t, / · (Easy|Medium|Hard)$/, `dsa: "${t}" has no difficulty tag`);
}
const weeks = Math.min(...Object.values(POOL).map((p) => p.length)) / 5;
console.log(`ok: ${Object.keys(POOL).length} modes, pool lasts until ${new Date(POOL_START + (weeks - 1) * 6048e5).toISOString().slice(0, 10)}`);
