# Developer Smoke Test

Follow this flow to verify ZeroDay Arena works end-to-end locally.

## Setup

1. Run `npm install`
2. Copy `.env.example` to `.env.local`
3. Fill Supabase URL, anon key, service role key, and secret env vars
4. Apply `supabase/schema.sql` in Supabase SQL Editor
5. Run `npm run seed`
6. Run `npm run dev`

## Team Flow

7. Open [http://localhost:3000/](http://localhost:3000/)
8. Click **ENTER ARENA** → go to `/login`
9. Login with:
   - **Code:** `NF404`
   - **Password:** `nf404pass`
10. Confirm redirect to `/arena` with challenge cards visible
11. Open **Welcome to Arena** challenge
12. Submit flag: `NF404{welcome_to_zeroday_arena}`
13. Confirm `BREACH CONFIRMED` and card shows `BREACHED`
14. Return to arena — confirm score updated
15. Submit the same flag again — confirm no duplicate points

## Scoreboard

16. Open `/scoreboard`
17. Confirm team score and solve feed entry appear
18. Confirm `NO BREACHES YET` shows when no solves exist (fresh DB)

## Admin Flow

19. Open `/admin`
20. Login with `ADMIN_PASSWORD` from `.env.local`
21. **Overview** tab shows stats
22. **Challenges** → create a test challenge with a flag
23. Edit the challenge (change title or points)
24. Toggle **visible** off (hide it)
25. Confirm hidden challenge disappears from `/arena` team view
26. **Teams** → verify both seed teams listed
27. **Submissions** → verify Welcome flag submission appears
28. **Event Settings** → set start/end times, save
29. Enable **Freeze Scoreboard**, save

## Freeze + Event End

30. Open `/scoreboard` — confirm `SCOREBOARD FROZEN` and solve feed hidden
31. Admin **Submissions** tab still shows all traffic
32. Set `end_time` to past — confirm flag submissions disabled
33. Scoreboard still loads with scores

## Build

34. Run `npm run lint`
35. Run `npm run build`
36. Confirm zero TypeScript/build errors

## File Upload (Supabase Storage)

37. Create private bucket `challenge-files` in Supabase Storage
38. Admin: edit `XOR Market`, upload `xor-market.zip`
39. Confirm `FILE ATTACHED` success message
40. Team: open `/challenge/xor-market`
41. Click **DOWNLOAD ARTIFACT** — file downloads
42. Logout and open download URL directly — should return 401
43. Admin: hide challenge — team can no longer see or download file

## Expected Security

- No `flag_hash` in any API response (check Network tab)
- No `password_hash` in any API response
- Service role key only in server env, never in client bundle
