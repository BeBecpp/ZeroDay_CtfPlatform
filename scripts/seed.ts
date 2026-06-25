import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { hashFlag, hashPassword } from "../src/lib/hash";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — copy from .env.example and fill in values.");
    process.exit(1);
  }

  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const CHALLENGES = [
  {
    title: "Welcome to Arena",
    slug: "welcome-to-arena",
    category: "CHAOS",
    points: 50,
    difficulty: "Easy",
    description:
      "Welcome, challenger.\n\nYour first mission is simple: find the hidden flag on this platform.\n\nHint: You are already looking at it.",
    flag: "NF404{welcome_to_zeroday_arena}",
    sort_order: 1,
  },
  {
    title: "XOR Market",
    slug: "xor-market",
    category: "CRYPTO",
    points: 100,
    difficulty: "Easy",
    description:
      "A shady vendor encrypted their price list with XOR.\n\nCiphertext: 0x1a2b3c\nKey: 0x42\n\nDecode the message to find the flag.",
    flag: "NF404{xor_market_opened}",
    sort_order: 2,
  },
  {
    title: "Broken Meme",
    slug: "broken-meme",
    category: "TRACE",
    points: 100,
    difficulty: "Easy",
    description:
      "Someone corrupted a meme file. The metadata still holds a clue.\n\nTrace the original source to recover the flag.",
    flag: "NF404{broken_meme_recovered}",
    sort_order: 3,
  },
  {
    title: "Cookie Shop",
    slug: "cookie-shop",
    category: "WEB",
    points: 150,
    difficulty: "Medium",
    description:
      "A web cookie shop has an admin panel.\n\nThe session cookie might be your way in.\n\nInspect, modify, escalate.",
    url: "https://example.com/cookie-shop",
    flag: "NF404{cookie_shop_admin}",
    sort_order: 4,
  },
  {
    title: "Password.exe",
    slug: "password-exe",
    category: "REV",
    points: 200,
    difficulty: "Medium",
    description:
      "A suspicious Windows executable asks for a password.\n\nReverse engineer it to find the correct input.",
    file_url: "https://example.com/password.exe",
    flag: "NF404{password_exe_reversed}",
    sort_order: 5,
  },
  {
    title: "RickShell.web",
    slug: "rickshell-web",
    category: "SHELL",
    points: 250,
    difficulty: "Medium-Hard",
    description:
      "A web shell disguised as a music player.\n\nEscape the sandbox and read the root flag.",
    flag: "NF404{rickshell_never_gonna_root}",
    sort_order: 6,
  },
  {
    title: "No Flag Here",
    slug: "no-flag-here",
    category: "CHAOS",
    points: 250,
    difficulty: "Medium-Hard",
    description:
      "This challenge claims there is no flag.\n\nBut there is always a flag.\n\nLook harder.",
    flag: "NF404{no_flag_here_but_here}",
    sort_order: 7,
  },
  {
    title: "Vault.exe",
    slug: "vault-exe",
    category: "WEB",
    points: 350,
    difficulty: "Hard",
    description:
      "The final vault. Multi-stage web exploitation.\n\nOnly the worthy will breach this one.",
    flag: "NF404{vault_exe_placeholder}",
    sort_order: 8,
  },
];

const TEAMS = [
  { name: "NOtFound_404", code: "NF404", password: "nf404pass" },
  { name: "Opponent Team", code: "OPPONENT", password: "opponentpass" },
];

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const pepper = process.env.FLAG_PEPPER;

  if (!url || !key || !pepper) {
    console.error("Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FLAG_PEPPER");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Clearing existing seed data...");
  await supabase.from("solves").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("submissions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("challenges").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("Seeding teams...");
  for (const team of TEAMS) {
    const { error } = await supabase.from("teams").insert({
      name: team.name,
      code: team.code,
      password_hash: await hashPassword(team.password),
    });
    if (error) {
      console.error(`Failed to seed team ${team.code}:`, error.message);
      process.exit(1);
    }
    console.log(`  ✓ ${team.name} (${team.code})`);
  }

  console.log("Seeding challenges...");
  for (const challenge of CHALLENGES) {
    const { flag, ...rest } = challenge;
    const { error } = await supabase.from("challenges").insert({
      ...rest,
      url: "url" in challenge ? challenge.url : null,
      file_url: "file_url" in challenge ? challenge.file_url : null,
      flag_hash: hashFlag(flag),
      visible: true,
    });
    if (error) {
      console.error(`Failed to seed challenge ${challenge.slug}:`, error.message);
      process.exit(1);
    }
    console.log(`  ✓ ${challenge.title} (${challenge.points} pts)`);
  }

  console.log("\nSeed complete!");
  console.log("\nTeam credentials:");
  console.log("  NF404 / nf404pass");
  console.log("  OPPONENT / opponentpass");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
