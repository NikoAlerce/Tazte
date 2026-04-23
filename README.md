## Taste App

Taste is a Next.js app for Web3 social discovery: wallet connection, archetype analysis, onboarding, and profile discovery.

## Stack

- Next.js (App Router), React, Tailwind, Framer Motion
- Supabase (profiles persistence)
- Tezos (Beacon/Taquito) + EVM wallet (wagmi)

## Environment Variables

Copy `.env.example` to `.env.local` and fill required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TEZOS_RPC`
- `PERSONALITY_ANALYZER_MODE` (`heuristic` or `external`)
- `PERSONALITY_ANALYZER_URL` (required when mode is `external`)

## Local Development

```bash
npm install
npm run dev
```

## Quality Gates

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run check` (lint + test + build)

CI runs these checks for pull requests and pushes to `main`.

## Branch and Deploy Strategy

- `main` is production.
- Use feature branches and open pull requests.
- Every PR should pass CI before merge.
- Vercel preview deploys should be used for review; production deploys from `main`.
