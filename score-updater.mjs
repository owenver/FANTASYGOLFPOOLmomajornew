import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// ── Config ────────────────────────────────────────────────────────────────────
const RAPIDAPI_KEY = "58ef4291ccmshea54951632533a9p1242ccjsn869c9c2c5a2d";
const ADMIN_EMAIL = "owenverlander@gmail.com";
const ADMIN_PASSWORD = process.env.FIREBASE_PASS; // run with: FIREBASE_PASS=yourpass node score-updater.mjs

const TOURNAMENT = { orgId: "1", year: "2026", tournId: "014" }; // Masters Tournament
const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const firebaseConfig = {
  apiKey: "AIzaSyCviqCqFcWxpL2thpVY6zaH11Rsmu3Bnfg",
  authDomain: "momajors-pool.firebaseapp.com",
  projectId: "momajors-pool",
  storageBucket: "momajors-pool.firebasestorage.app",
  messagingSenderId: "1046135617645",
  appId: "1:1046135617645:web:8e2e2e26c6ec09e93fe764",
  databaseURL: "https://momajors-pool-default-rtdb.firebaseio.com",
};

// ── Golfer list from the app ──────────────────────────────────────────────────
const GOLFER_LIST = ["Scottie Scheffler","Rory McIlroy","Tommy Fleetwood","Cameron Young","Matt Fitzpatrick","Xander Schauffele","Collin Morikawa","Justin Rose","Chris Gotterup","Russell Henley","Ludvig Aberg","Hideki Matsuyama","Justin Thomas","Robert MacIntyre","Ben Griffin","Akshay Bhatia","Sepp Straka","J.J. Spaun","Jacob Bridgeman","Alexander Noren","Bryson DeChambeau","Jon Rahm","Patrick Reed","Viktor Hovland","Tyrrell Hatton","Shane Lowry","Patrick Cantlay","Si Woo Kim","Min Woo Lee","Daniel Berger","Sam Burns","Marco Penge","Harris English","Maverick McNealy","Ryan Gerard","Keegan Bradley","Kurt Kitayama","Nicolai Hojgaard","Aaron Rai","Nicolas Echavarria","Brooks Koepka","Jordan Spieth","Corey Conners","Jake Knapp","Jason Day","Adam Scott","Cameron Smith","Max Homa","Gary Woodland","Sungjae Im","Wyndham Clark","Matt McCarty","Ryan Fox","Harry Hall","John Keefer","Rasmus Neergaard-Petersen","Tom McKibbin","Brian Harman","Carlos Ortiz","Rasmus Hojgaard","Sam Stevens","Aldrich Potgieter","Andrew Novak","Casey Jarvis","Michael Kim","Hao-Tong Li","Max Greyserman","Nick Taylor","Davis Riley","Kristoffer Reitan","Sami Valimaki","Brian Campbell","Michael Brennan","Dustin Johnson","Sergio Garcia","Bubba Watson","Charl Schwartzel","Zach Johnson","Angel Cabrera","Danny Willett","Fred Couples","Mike Weir","Vijay Singh","Brandon Holtz","Ethan Fang","Fifa Laopakdee","Jackson Herrington","Jose Maria Olazabal","Mason Howell","Mateo Pulcini","Naoyuki Kataoka"];

// Normalize accents for fuzzy matching (Åberg → Aberg)
function normalize(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics (Å→A, é→e, etc.)
    .replace(/ø/gi, "o")             // ø doesn't decompose in NFD (Højgaard→Hojgaard)
    .replace(/æ/gi, "ae")
    .replace(/ñ/gi, "n")
    .toLowerCase();
}

// Build a lookup map: normalized name → original app name
const NORMALIZED_MAP = {};
for (const name of GOLFER_LIST) {
  NORMALIZED_MAP[normalize(name)] = name;
}

function findAppName(apiFirstName, apiLastName) {
  const apiName = `${apiFirstName} ${apiLastName}`;
  // Try exact match first
  if (NORMALIZED_MAP[normalize(apiName)]) return NORMALIZED_MAP[normalize(apiName)];
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseScore(str) {
  if (!str || str === "E") return 0;
  const n = parseInt(str, 10);
  return isNaN(n) ? 0 : n;
}

// Firebase keys can't contain . # $ / [ ]
function safeKey(name) {
  return name.replace(/\./g, "_");
}

function transformLeaderboard(rows) {
  const scores = {};

  for (const row of rows) {
    const appName = findAppName(row.firstName, row.lastName);
    if (!appName) continue; // not in our player pool, skip

    const r = { thru: "-", cut: false };

    for (const round of row.rounds || []) {
      const roundNum = round.roundId?.$numberInt ?? round.roundId;
      const key = `r${roundNum}`;
      if (["r1","r2","r3","r4"].includes(key)) r[key] = parseScore(round.scoreToPar);
    }

    // If current round is in progress, store currentRoundScore in the right slot
    if (!row.roundComplete && row.currentRoundScore && row.currentRoundScore !== "-") {
      const currentRound = row.currentRound?.$numberInt ?? row.currentRound;
      const key = `r${currentRound}`;
      if (["r1","r2","r3","r4"].includes(key)) r[key] = parseScore(row.currentRoundScore);
    }

    r.thru = row.thru || "-";
    r.cut = row.status === "cut";

    scores[safeKey(appName)] = r;
  }

  return scores;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function fetchAndUpdate(db) {
  const url = `https://live-golf-data.p.rapidapi.com/leaderboard?orgId=${TOURNAMENT.orgId}&year=${TOURNAMENT.year}&tournId=${TOURNAMENT.tournId}`;

  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": "live-golf-data.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    });

    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      return;
    }

    const data = await res.json();
    const scores = transformLeaderboard(data.leaderboardRows || []);
    const playerCount = Object.keys(scores).length;

    await set(ref(db, "liveScores/current"), {
      scores,
      playerCount,
      lastUpdated: new Date().toISOString(),
      tournamentStatus: data.status || "unknown",
      round: data.roundId?.$numberInt ?? data.roundId,
    });

    console.log(`[${new Date().toLocaleTimeString()}] Updated ${playerCount} players | Tournament: ${data.status} | Round: ${data.roundId?.$numberInt ?? data.roundId}`);
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] Fetch error (will retry next interval):`, err.message);
  }
}

async function main() {
  if (!ADMIN_PASSWORD) {
    console.error("ERROR: Set your Firebase password with: FIREBASE_PASS=yourpassword node score-updater.mjs");
    process.exit(1);
  }

  // Force exit after 60 seconds when running in CI/GitHub Actions
  if (process.env.RUN_ONCE) {
    setTimeout(() => process.exit(0), 60000);
  }

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const auth = getAuth(app);

  console.log("Signing in to Firebase...");
  await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log("Signed in. Starting score updates every 10 minutes...\n");

  // Run once (GitHub Actions) or loop every 10 min (local)
  await fetchAndUpdate(db);
  if (process.env.RUN_ONCE) {
    process.exit(0);
  }
  setInterval(() => fetchAndUpdate(db), POLL_INTERVAL_MS);
}

main().catch(console.error);
