# ZeroDay Arena

**Enter the arena. Break the logic. Capture the flag.**

A full-stack Team vs Team Jeopardy CTF platform built with Next.js, TypeScript, Tailwind CSS, and Supabase. Designed for friendly 2-team CTF battles with a cyberpunk hacker aesthetic.

![ZeroDay Arena](https://img.shields.io/badge/style-cyberpunk-39ff8a)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)

## Features

- **Team login** with cookie-based JWT sessions
- **Challenge dashboard** with category filters and mission cards
- **Flag submission** with server-side SHA-256 + pepper hashing
- **Live scoreboard** with battle control room UI
- **Solve feed** with freeze option for end-of-event
- **Admin panel** for challenges, teams, submissions, and event settings
- **Cyberpunk UI** — Matrix rain, glitch effects, neon glow, terminal boot sequence
- **Vercel-ready** deployment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Custom JWT cookies (no Supabase Auth) |
| Validation | Zod |

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd zeroday-arena
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your project URL and keys from **Settings → API**

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-secure-admin-password
SESSION_SECRET=your-long-random-secret-at-least-32-chars
FLAG_PEPPER=your-random-flag-pepper-string
```

> **Important:** Never commit `.env.local`. Never expose `SUPABASE_SERVICE_ROLE_KEY` or `FLAG_PEPPER` to the client.

### 4. Seed the database

```bash
npm run seed
```

This creates two teams and eight sample challenges with properly hashed passwords and flags.

**Default team credentials:**

| Team | Code | Password |
|------|------|----------|
| NOtFound_404 | `NF404` | `nf404pass` |
| Opponent Team | `OPPONENT` | `opponentpass` |

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with Matrix rain and boot animation |
| `/login` | Team authentication |
| `/arena` | Challenge dashboard (requires login) |
| `/challenge/[slug]` | Challenge detail and flag submission |
| `/scoreboard` | Public live scoreboard |
| `/admin` | Admin control panel |

## Admin Panel

1. Go to `/admin`
2. Login with your `ADMIN_PASSWORD`
3. Manage challenges, teams, view submissions, configure event settings

### Creating Challenges

- Flags are hashed server-side with SHA-256 + `FLAG_PEPPER`
- Only `flag_hash` is stored — never plaintext flags
- Set `visible` to false to hide challenges from teams

### Creating Teams

- Passwords are hashed with bcrypt (12 rounds)
- Team code must be uppercase alphanumeric (e.g. `NF404`)

### Event Settings

- Set `start_time` and `end_time` for countdown timer
- Enable **Freeze Scoreboard** to hide solve feed details at end of event

## API Routes

### Public / Team

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/login` | — | Team login |
| POST | `/api/logout` | — | Team logout |
| GET | `/api/me` | Team | Current session |
| GET | `/api/challenges` | Team | List visible challenges |
| GET | `/api/challenges/[slug]` | Team | Challenge detail |
| POST | `/api/submit` | Team | Submit flag |
| GET | `/api/scoreboard` | — | Public scoreboard |

### Admin

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/overview` | Dashboard stats |
| CRUD | `/api/admin/challenges` | Manage challenges |
| CRUD | `/api/admin/teams` | Manage teams |
| GET | `/api/admin/submissions` | View all submissions |
| GET/PUT | `/api/admin/settings` | Event configuration |

## Deploy to Vercel

This project uses **Next.js serverless API routes** — do **not** enable static export. The included `vercel.json` uses Next.js deployment defaults.

### Steps

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Vercel auto-detects Next.js via `vercel.json`
4. Add all production environment variables (checklist below)
5. Deploy

```bash
npm run build   # verify locally first
npm run lint
```

### Production Environment Variable Checklist

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key (not used for sensitive queries) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Server-only** — API routes only |
| `ADMIN_PASSWORD` | Yes | Change from default before go-live |
| `SESSION_SECRET` | Yes | Long random string (32+ characters) |
| `FLAG_PEPPER` | Yes | Unique random string for flag hashing |

> Never commit secrets. Set all variables in Vercel **Project → Settings → Environment Variables** for Production (and Preview if needed).

### Vercel Notes

- No filesystem persistence — all data lives in Supabase
- No file uploads to disk — use external URLs for challenge files
- API routes run on Vercel serverless runtime (Node.js)
- In-memory rate limiting resets on cold starts (acceptable for a 2-team event)

See also: [docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md) and [docs/SMOKE_TEST.md](docs/SMOKE_TEST.md)

## Supabase & RLS

All sensitive database operations go through **server-side API routes** using the `SUPABASE_SERVICE_ROLE_KEY`. The frontend does **not** query `teams`, `challenges`, `submissions`, or `solves` directly with the anon key.

Row Level Security (RLS) is not required for this architecture because:

- No Supabase Auth is used
- The anon key is never used for sensitive table access in the browser
- All flag checking, password verification, and admin actions happen in API routes

If you enable RLS later, ensure service role bypass remains available for API routes.

## Security Notes

- **Flags:** Hashed with `SHA-256(trimmedFlag + FLAG_PEPPER)`. Case-sensitive. Never returned in API responses.
- **Passwords:** Bcrypt hashed. Never returned in API responses.
- **Sessions:** HTTP-only JWT cookies signed with `SESSION_SECRET`. Secure flag enabled in production.
- **Service role key:** Used only in server-side API routes and seed script. Never exposed to browser.
- **Duplicate solves:** Prevented via unique constraint on `(team_id, challenge_id)`.
- **Hidden challenges:** Not visible in team API. Submissions rejected for invisible challenges.
- **Validation:** All request bodies validated with Zod schemas.
- **Middleware:** Protects `/arena`, `/challenge/*`, `/scoreboard` (team session) and `/api/admin/*` (admin session).
- **Rate limiting:** In-memory limits on login and flag submission endpoints.
- **Event lock:** Submissions disabled before start and after end; admin always has full access.

## Project Structure

```
zeroday-arena/
├── src/
│   ├── app/              # Pages and API routes
│   ├── components/       # UI components
│   └── lib/              # Auth, hash, Supabase, validators
├── supabase/
│   ├── schema.sql        # Database schema
│   └── seed.sql          # Reference (use npm run seed)
├── scripts/
│   └── seed.ts           # Seed script with hashing
├── docs/
│   ├── PRODUCTION_CHECKLIST.md
│   └── SMOKE_TEST.md
├── vercel.json
└── README.md
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with sample data |

## License

MIT — Built for friendly CTF battles. Hack responsibly.
