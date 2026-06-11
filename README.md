# 🐾 Petinder

A mobile-first platform combining **Rover + Petfinder + a pet social network + a services marketplace**.

## What's inside (MVP)

| Module | Where |
|---|---|
| Pet owner app — feed, AI matching, services booking, shop, chat | `/feed` `/match` `/services` `/shop` `/chat` |
| Pet profiles with temperament, medical info & followers | `/pets` |
| AI features — match scoring, health insights, chat suggestions, recommendations | `lib/ai.ts` |
| Provider (partner) app — booking management, earnings | `/provider` |
| Admin dashboard — GMV, revenue, moderation, provider verification | `/admin` |
| Journey QA agent — spots defects across all three journeys | `qa/journey-agent.mjs` |
| Design docs — architecture, DB schema, APIs, screens, monetization | `docs/` |

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Demo accounts (password `petinder123`):
- Owner: `sara@petinder.app`
- Provider: `omar@petinder.app`
- Admin: `admin@petinder.app`

## Journey QA agent

Walks the **customer → partner → admin** journeys end-to-end in a real browser and
writes `qa/defect-report.md` listing every failed step, console error and failed
network request (with screenshots of failures).

```bash
npm run build && npm run start &
npm run qa:journeys              # exit code 1 if any defect is found
```

MVP storage is in-memory (resets on restart). Production schema: `docs/DATABASE_SCHEMA.md`.
