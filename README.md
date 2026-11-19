# Topic Roulette

A slot-reel random picker for daily practice — speak, code, learn, DSA, design, challenge, interview.
Live at [topicwheel.vercel.app](https://topicwheel.vercel.app).

Next.js (App Router) serving a vanilla HTML app, Auth.js Google sign-in, Neon Postgres for synced state.

## Local

```
npm install
cp .env.example .env.local   # fill in AUTH_SECRET, AUTH_GOOGLE_ID/SECRET, DATABASE_URL
npm run dev
```

Pushes to `main` deploy to production automatically.
