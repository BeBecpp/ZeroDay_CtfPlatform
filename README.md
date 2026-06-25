# ZeroDay Arena

**ZeroDay Arena** is a custom cyberpunk CTF platform built for small **Team vs Team Jeopardy-style CTF battles**.

It is designed as a lightweight, cinematic alternative to a full CTFd setup for friendly training matches, private duels, school teams, and small cyber competitions.

> Enter the arena. Break the logic. Capture the flag.

Live demo:
https://zero-day-ctf-platform.vercel.app/

Repository:
https://github.com/BeBecpp/ZeroDay_CtfPlatform

---

## Overview

ZeroDay Arena is not just a scoreboard. It is a full hacker-themed CTF battle platform with:

* Team login
* Challenge dashboard
* Flag submission
* Live scoreboard
* Solve feed
* Event timer
* Admin panel
* Challenge CRUD
* Team management
* Submission tracking
* Scoreboard freeze
* Supabase database
* Supabase Storage file uploads
* Private challenge artifacts
* Secure server-side flag checking
* Matrix rain background
* Cyberpunk / terminal / pixel UI

It was built for a 2-team friendly CTF battle, but it can be extended for larger events.

---

## Why ZeroDay Arena?

Traditional CTF platforms are powerful, but sometimes too heavy for small team battles.

ZeroDay Arena focuses on:

* Fast setup
* Small-team competitions
* Custom visual identity
* Admin-friendly challenge management
* Secure flag checking
* Private file delivery
* A more cinematic hacker-arena experience

It is inspired by the workflow of platforms like CTFd, but the UI and event flow are custom-built for a more immersive Team vs Team experience.

---

## Features

### Player Features

* Team login with code and password
* Challenge grid
* Category filters
* Challenge detail pages
* Flag submission
* Solved challenge state
* Scoreboard
* Solve feed
* Event countdown
* Secure challenge file downloads

### Admin Features

* Admin login
* Dashboard overview
* Create, edit, delete challenges
* Toggle challenge visibility
* Upload challenge files
* Manage teams
* View submissions
* Configure event settings
* Freeze or unfreeze scoreboard

### Security Features

* Server-side flag checking
* Flags are stored as hashes
* Plaintext flags are never exposed to the frontend
* Passwords are hashed
* Supabase service role key is server-only
* Private Supabase Storage bucket for challenge files
* Signed download URLs for artifacts
* Hidden challenge files cannot be downloaded by normal teams
* Duplicate solves do not duplicate points

---

## Tech Stack

* **Next.js App Router**
* **TypeScript**
* **Tailwind CSS**
* **Supabase Database**
* **Supabase Storage**
* **Vercel Deployment**
* **Cookie-based auth**
* **bcrypt password hashing**
* **SHA-256 flag hashing with pepper**
* **Cyberpunk UI components**
* **Canvas Matrix rain animation**

---

## Project Structure

```txt
ZeroDay_CtfPlatform/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── login/
│   │   ├── arena/
│   │   ├── challenge/[slug]/
│   │   ├── scoreboard/
│   │   ├── admin/
│   │   └── api/
│   ├── components/
│   └── lib/
├── supabase/
│   └── schema.sql
├── scripts/
│   └── seed.ts
├── docs/
│   ├── PRODUCTION_CHECKLIST.md
│   └── SMOKE_TEST.md
├── public/
├── README.md
└── package.json
```

---

## Database Design

ZeroDay Arena uses Supabase PostgreSQL.

Main tables:

### `teams`

Stores team accounts.

```sql
id uuid primary key
name text
code text unique
password_hash text
created_at timestamptz
```

### `challenges`

Stores CTF challenges.

```sql
id uuid primary key
slug text unique
title text
category text
points integer
difficulty text
description text
url text
file_url text
file_path text
flag_hash text
visible boolean
sort_order integer
created_at timestamptz
updated_at timestamptz
```

Field meaning:

* `url` — external challenge URL, for example a Railway-hosted web challenge
* `file_url` — external public file URL
* `file_path` — private Supabase Storage artifact path
* `flag_hash` — hashed flag, never sent to frontend

### `submissions`

Stores all submitted flags.

```sql
id uuid primary key
team_id uuid
challenge_id uuid
submitted_flag text
correct boolean
created_at timestamptz
```

### `solves`

Stores accepted solves.

```sql
id uuid primary key
team_id uuid
challenge_id uuid
points integer
solved_at timestamptz
unique (team_id, challenge_id)
```

The unique constraint prevents duplicate points for the same challenge.

### `event_settings`

Stores event configuration.

```sql
id integer primary key
event_name text
start_time timestamptz
end_time timestamptz
scoreboard_frozen boolean
```

---

## Supabase Schema

Run the SQL schema in:

```txt
Supabase Dashboard → SQL Editor → New Query
```

Main schema file:

```txt
supabase/schema.sql
```

The schema creates:

* Teams table
* Challenges table
* Submissions table
* Solves table
* Event settings table
* Required indexes
* Updated timestamp trigger
* `challenge-files` private storage bucket

---

## Supabase Storage Setup

ZeroDay Arena supports admin challenge file uploads using Supabase Storage.

Create a private bucket:

```txt
Supabase Dashboard → Storage → New bucket
```

Bucket settings:

```txt
Name: challenge-files
Public: OFF
```

Do not make this bucket public.

Uploaded files are stored like:

```txt
challenges/<challenge-slug>/<timestamp>-<safe-filename>
```

Teams download files through a secure API route:

```txt
/api/files/...
```

The app generates short-lived signed URLs server-side.

---

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ADMIN_PASSWORD=
SESSION_SECRET=
FLAG_PEPPER=
```

### Example

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key

ADMIN_PASSWORD=change-this-admin-password
SESSION_SECRET=change-this-long-random-secret
FLAG_PEPPER=change-this-flag-pepper
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it twice:

* one value for `SESSION_SECRET`
* one value for `FLAG_PEPPER`

Important:

* Never commit `.env.local`
* Never expose `SUPABASE_SERVICE_ROLE_KEY`
* Never change `FLAG_PEPPER` after seeding flags unless you re-hash all flags

---

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
cp .env.example .env.local
```

Apply Supabase schema:

```txt
Supabase Dashboard → SQL Editor → paste supabase/schema.sql → Run
```

Seed sample data:

```bash
npm run seed
```

Run development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Default Seed Credentials

Team login:

```txt
Code: NF404
Password: nf404pass
```

Second team:

```txt
Code: OPPONENT
Password: opponentpass
```

Admin login:

```txt
/admin
Password: value from ADMIN_PASSWORD
```

Sample welcome flag:

```txt
NF404{welcome_to_zeroday_arena}
```

---

## Deployment to Vercel

Push the project to GitHub.

Import into Vercel:

```txt
Vercel → New Project → Import GitHub Repository
```

Framework:

```txt
Next.js
```

Build command:

```txt
npm run build
```

Install command:

```txt
npm install
```

Add environment variables in:

```txt
Vercel Project → Settings → Environment Variables
```

Required variables:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
SESSION_SECRET
FLAG_PEPPER
```

Deploy.

After deployment, test:

```txt
/
 /login
 /arena
 /scoreboard
 /admin
```

---

## Challenge File Upload Flow

Admin can upload files directly from the challenge form.

Flow:

1. Admin opens `/admin`
2. Creates or edits a challenge
3. Drags a file into the upload area
4. Saves the challenge
5. The file uploads to Supabase Storage
6. The challenge stores the file path
7. Players download the file from the challenge page

Supported file types:

```txt
.zip
.txt
.png
.jpg
.jpeg
.gif
.pdf
.py
.js
.pcap
.pcapng
.bin
.exe
```

Default max size:

```txt
25MB
```

---

## Challenge Categories

Recommended categories:

```txt
WEB
CRYPTO
REV
TRACE
SHELL
CHAOS
```

Example event pack:

| Challenge           |       Category | Points | Difficulty  |
| ------------------- | -------------: | -----: | ----------- |
| Welcome to Arena    |          CHAOS |     50 | Easy        |
| Broken Transmission | CRYPTO / TRACE |    150 | Medium      |
| Ghost Pixels        |          TRACE |    250 | Hard        |
| Cookie Shop 2FA     |            WEB |    200 | Medium      |
| Password.exe        |            REV |    250 | Medium-Hard |
| RickShell.web       |          SHELL |    300 | Hard        |
| No Flag Here        |    CHAOS / WEB |    300 | Hard        |
| Vault.exe           |       WEB / WS |    450 | Hard+       |

---

## Security Notes

ZeroDay Arena is designed so that flags are not exposed to players through frontend code.

Important rules:

* Do not store plaintext flags in frontend files
* Do not store real flags inside public JSON
* Do not expose `flag_hash`
* Do not expose `password_hash`
* Do not expose `SUPABASE_SERVICE_ROLE_KEY`
* Use server-side API routes for all sensitive operations
* Keep Supabase Storage bucket private
* Use signed URLs for downloads
* Use admin panel or seed script to create challenges

Recommended Supabase security posture:

* Keep direct browser access limited
* Sensitive reads and writes should go through Next.js API routes
* Use the service role key only on the server
* Do not query secret fields directly from frontend clients

---

## Smoke Test

After setup or deploy, run this test:

1. Open `/`
2. Click `ENTER ARENA`
3. Login with:

```txt
Code: NF404
Password: nf404pass
```

4. Open `/arena`
5. Open `Welcome to Arena`
6. Submit:

```txt
NF404{welcome_to_zeroday_arena}
```

7. Confirm success animation
8. Open `/scoreboard`
9. Confirm score updated
10. Open `/admin`
11. Login with `ADMIN_PASSWORD`
12. Create a test challenge
13. Upload a file
14. Login as team
15. Download the artifact
16. Hide the challenge
17. Confirm the hidden challenge cannot be accessed
18. Freeze scoreboard
19. Confirm public scoreboard shows frozen state

---

## Production Checklist

Before running a real event:

* [ ] Supabase schema applied
* [ ] Storage bucket `challenge-files` created
* [ ] Bucket is private
* [ ] Seed script ran successfully
* [ ] Vercel environment variables added
* [ ] `ADMIN_PASSWORD` changed
* [ ] `SESSION_SECRET` changed
* [ ] `FLAG_PEPPER` changed
* [ ] Team passwords changed
* [ ] Admin login tested
* [ ] Team login tested
* [ ] Flag submission tested
* [ ] Duplicate solves tested
* [ ] File upload tested
* [ ] File download tested
* [ ] Hidden challenge access blocked
* [ ] Logged-out file download blocked
* [ ] Scoreboard freeze tested
* [ ] `flag_hash` not exposed
* [ ] `password_hash` not exposed
* [ ] Service role key not exposed

---

## Current Live Platform

```txt
https://zero-day-ctf-platform.vercel.app/
```

---

## Author

Built by **BeBe / NOtFound_404** as a custom CTF platform for friendly team battles, training, and cyber challenge hosting.

GitHub:

```txt
https://github.com/BeBecpp
```

---

## License

This project is intended for educational and friendly CTF use.

Use it responsibly.
