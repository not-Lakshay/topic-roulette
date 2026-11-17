# Copies AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET and DATABASE_URL from the gym-rank Vercel
# project to the topic-roulette project. Values are never printed. Delete this file after use.
$ErrorActionPreference = "Stop"
$tmp = Join-Path $env:TEMP "gymrank-env-copy"
New-Item -ItemType Directory -Force $tmp | Out-Null
Push-Location $tmp
try {
  npx vercel link --yes --project gym-rank | Out-Null
  npx vercel env pull --environment=production .env.gr --yes | Out-Null
  $lines = Get-Content .env.gr
} finally { Pop-Location }

foreach ($k in "AUTH_GOOGLE_ID","AUTH_GOOGLE_SECRET","DATABASE_URL") {
  $line = $lines | Where-Object { $_ -like "$k=*" } | Select-Object -First 1
  if (-not $line) { Write-Host "$k : not found on gym-rank"; continue }
  $v = $line.Substring($k.Length + 1).Trim('"')
  $v | npx vercel env add $k production | Out-Null
  Write-Host "$k : copied"
}
Remove-Item -Recurse -Force $tmp
Write-Host "--- now on topic-roulette:"
npx vercel env ls production
