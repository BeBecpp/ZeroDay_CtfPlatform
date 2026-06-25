# Production Checklist

Use this checklist before running a live ZeroDay Arena event.

## Database

- [ ] Supabase project created
- [ ] `supabase/schema.sql` applied successfully
- [ ] `pgcrypto` extension enabled
- [ ] `npm run seed` completed without errors (or manual teams/challenges created)

## Environment Variables (Vercel + local)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (server-only)
- [ ] `ADMIN_PASSWORD` changed from default
- [ ] `SESSION_SECRET` changed to a long random value (32+ chars)
- [ ] `FLAG_PEPPER` changed to a unique random string

## Authentication

- [ ] Team login works (`NF404` / `nf404pass` after seed)
- [ ] Admin login works at `/admin`
- [ ] Logout clears sessions correctly
- [ ] Middleware redirects unauthenticated users from `/arena`, `/challenge/*`, `/scoreboard`

## Core Functionality

- [ ] Challenges visible on `/arena`
- [ ] Flag submission works for correct flag
- [ ] Wrong flag shows `ACCESS DENIED`
- [ ] Duplicate solve does **not** award extra points
- [ ] Scoreboard updates after solve
- [ ] Hidden challenges do **not** appear in team view
- [ ] Hidden challenges reject team submissions

## Event Controls

- [ ] Event start time locks missions before start
- [ ] Event end time disables flag submissions
- [ ] Scoreboard still visible after event ends
- [ ] Scoreboard freeze hides solve feed on public scoreboard
- [ ] Admin still sees all submissions when frozen
- [ ] Solves still recorded during freeze

## Security

- [ ] `flag_hash` never appears in browser Network tab responses
- [ ] `password_hash` never appears in API responses
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed to client
- [ ] No sensitive tables queried from frontend with anon key
- [ ] Rate limiting returns `Too many attempts. Wait a moment.` when triggered

## Deployment

- [ ] `npm run build` passes locally
- [ ] `vercel.json` present
- [ ] All env vars added in Vercel project settings
- [ ] Production URL loads landing page
- [ ] Production team login + submit tested end-to-end
