import React, { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc as firestoreDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCviqCqFcWxpL2thpVY6zaH11Rsmu3Bnfg",
  authDomain: "momajors-pool.firebaseapp.com",
  projectId: "momajors-pool",
  storageBucket: "momajors-pool.firebasestorage.app",
  messagingSenderId: "1046135617645",
  appId: "1:1046135617645:web:8e2e2e26c6ec09e93fe764",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "owenverlander@gmail.com";
const BUDGET = 20000;
const MIN_PLAYERS = 4;
const ENTRIES_LOCK_TIME = new Date("2026-04-09T11:40:00Z"); // 7:40 AM ET April 9

// MASTERS COLORS - Augusta Green and Gold
const PRIMARY = "#006747";
const SECONDARY = "#00563B";
const ACCENT = "#C5A028";
const LIGHT_ACCENT = "#F5F0E0";

const safeKey = (name) => name.replace(/\./g, "_");

const fmt = (s) => {
  if (s === 0) return "E";
  return s > 0 ? "+" + s : String(s);
};
const fmtMoney = (n) => "$" + n.toLocaleString();
const scoreCol = (s) => (s < 0 ? "#16a34a" : s > 0 ? "#dc2626" : "#374151");

// MASTERS 2026 FIELD
const GOLFER_LIST = [
  // $9,000
  { name: "Scottie Scheffler", salary: 9000 },
  { name: "Rory McIlroy", salary: 9000 },
  { name: "Tommy Fleetwood", salary: 9000 },
  { name: "Cameron Young", salary: 9000 },
  { name: "Matt Fitzpatrick", salary: 9000 },

  // $7,000
  { name: "Xander Schauffele", salary: 7000 },
  { name: "Collin Morikawa", salary: 7000 },
  { name: "Justin Rose", salary: 7000 },
  { name: "Chris Gotterup", salary: 7000 },
  { name: "Russell Henley", salary: 7000 },

  // $6,000
  { name: "Ludvig Aberg", salary: 6000 },
  { name: "Hideki Matsuyama", salary: 6000 },
  { name: "Justin Thomas", salary: 6000 },
  { name: "Robert MacIntyre", salary: 6000 },
  { name: "Ben Griffin", salary: 6000 },
  { name: "Akshay Bhatia", salary: 6000 },
  { name: "Sepp Straka", salary: 6000 },
  { name: "J.J. Spaun", salary: 6000 },
  { name: "Jacob Bridgeman", salary: 6000 },
  { name: "Alexander Noren", salary: 6000 },

  // $4,000
  { name: "Bryson DeChambeau", salary: 4000 },
  { name: "Jon Rahm", salary: 4000 },
  { name: "Patrick Reed", salary: 4000 },
  { name: "Viktor Hovland", salary: 4000 },
  { name: "Tyrrell Hatton", salary: 4000 },
  { name: "Shane Lowry", salary: 4000 },
  { name: "Patrick Cantlay", salary: 4000 },
  { name: "Si Woo Kim", salary: 4000 },
  { name: "Min Woo Lee", salary: 4000 },
  { name: "Daniel Berger", salary: 4000 },
  { name: "Sam Burns", salary: 4000 },
  { name: "Marco Penge", salary: 4000 },
  { name: "Harris English", salary: 4000 },
  { name: "Maverick McNealy", salary: 4000 },
  { name: "Ryan Gerard", salary: 4000 },
  { name: "Keegan Bradley", salary: 4000 },
  { name: "Kurt Kitayama", salary: 4000 },
  { name: "Nicolai Hojgaard", salary: 4000 },
  { name: "Aaron Rai", salary: 4000 },
  { name: "Nicolas Echavarria", salary: 4000 },

  // $2,000
  { name: "Brooks Koepka", salary: 2000 },
  { name: "Jordan Spieth", salary: 2000 },
  { name: "Corey Conners", salary: 2000 },
  { name: "Jake Knapp", salary: 2000 },
  { name: "Jason Day", salary: 2000 },
  { name: "Adam Scott", salary: 2000 },
  { name: "Cameron Smith", salary: 2000 },
  { name: "Max Homa", salary: 2000 },
  { name: "Gary Woodland", salary: 2000 },
  { name: "Sungjae Im", salary: 2000 },
  { name: "Wyndham Clark", salary: 2000 },
  { name: "Matt McCarty", salary: 2000 },
  { name: "Ryan Fox", salary: 2000 },
  { name: "Harry Hall", salary: 2000 },
  { name: "John Keefer", salary: 2000 },
  { name: "Rasmus Neergaard-Petersen", salary: 2000 },
  { name: "Tom McKibbin", salary: 2000 },
  { name: "Brian Harman", salary: 2000 },
  { name: "Carlos Ortiz", salary: 2000 },
  { name: "Rasmus Hojgaard", salary: 2000 },
  { name: "Sam Stevens", salary: 2000 },
  { name: "Aldrich Potgieter", salary: 2000 },
  { name: "Andrew Novak", salary: 2000 },
  { name: "Casey Jarvis", salary: 2000 },
  { name: "Michael Kim", salary: 2000 },
  { name: "Hao-Tong Li", salary: 2000 },
  { name: "Max Greyserman", salary: 2000 },
  { name: "Nick Taylor", salary: 2000 },
  { name: "Davis Riley", salary: 2000 },
  { name: "Kristoffer Reitan", salary: 2000 },
  { name: "Sami Valimaki", salary: 2000 },
  { name: "Brian Campbell", salary: 2000 },
  { name: "Michael Brennan", salary: 2000 },

  // $1,000
  { name: "Dustin Johnson", salary: 1000 },
  { name: "Sergio Garcia", salary: 1000 },
  { name: "Bubba Watson", salary: 1000 },
  { name: "Charl Schwartzel", salary: 1000 },
  { name: "Zach Johnson", salary: 1000 },
  { name: "Angel Cabrera", salary: 1000 },
  { name: "Danny Willett", salary: 1000 },
  { name: "Fred Couples", salary: 1000 },
  { name: "Mike Weir", salary: 1000 },
  { name: "Vijay Singh", salary: 1000 },
  { name: "Brandon Holtz", salary: 1000 },
  { name: "Ethan Fang", salary: 1000 },
  { name: "Fifa Laopakdee", salary: 1000 },
  { name: "Jackson Herrington", salary: 1000 },
  { name: "Jose Maria Olazabal", salary: 1000 },
  { name: "Mason Howell", salary: 1000 },
  { name: "Mateo Pulcini", salary: 1000 },
  { name: "Naoyuki Kataoka", salary: 1000 },
];

const DEFAULT_LIVE = {};
GOLFER_LIST.forEach((g) => {
  DEFAULT_LIVE[g.name] = {
    r1: null,
    r2: null,
    r3: null,
    r4: null,
    thru: "-",
    cut: false,
  };
});

function computeTeam(golfers, liveScores) {
  const withData = golfers
    .map((g) => {
      const d = liveScores[safeKey(g.name)] || DEFAULT_LIVE[g.name] || { r1: null, r2: null, r3: null, r4: null, thru: "-", cut: false };
      const total = [d.r1, d.r2, d.r3, d.r4]
        .filter((x) => x != null)
        .reduce((a, b) => a + b, 0);
      return { ...g, ...d, total };
    })
    .sort((a, b) => {
      if (a.cut && !b.cut) return 1;
      if (!a.cut && b.cut) return -1;
      return a.total - b.total;
    });
  const top4 = withData.slice(0, 4);
  const teamScore = top4.reduce((s, g) => s + g.total, 0);
  const cutHappened = withData.some((g) => g.cut);
  const eliminated = cutHappened && top4.some((g) => g.cut);
  return { withData, top4, teamScore, eliminated };
}

const PulsingDot = () => (
  <span
    style={{
      position: "relative",
      display: "inline-flex",
      width: 10,
      height: 10,
    }}
  >
    <span
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: "#fbbf24",
        animation: "mpx 1.2s cubic-bezier(0,0,.2,1) infinite",
      }}
    />
    <span
      style={{
        position: "relative",
        borderRadius: "50%",
        width: 10,
        height: 10,
        background: ACCENT,
        display: "block",
      }}
    />
  </span>
);

const RndBox = ({ val, label }) => {
  if (val == null)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          minWidth: 26,
        }}
      >
        <div
          style={{
            width: 26,
            height: 22,
            borderRadius: 4,
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 9, color: "#d1d5db" }}>-</span>
        </div>
        <span style={{ fontSize: 8, color: "#d1d5db" }}>{label}</span>
      </div>
    );
  const bg = val < 0 ? "#dcfce7" : val > 0 ? "#fee2e2" : "#f3f4f6";
  const col = val < 0 ? "#16a34a" : val > 0 ? "#b91c1c" : "#6b7280";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        minWidth: 26,
      }}
    >
      <div
        style={{
          width: 26,
          height: 22,
          borderRadius: 4,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: col,
            fontFamily: "monospace",
          }}
        >
          {val === 0 ? "E" : val > 0 ? "+" + val : val}
        </span>
      </div>
      <span style={{ fontSize: 8, color: "#9ca3af" }}>{label}</span>
    </div>
  );
};

const LoginPage = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          maxWidth: 420,
          width: "100%",
          padding: 40,
          boxShadow: "0 20px 60px rgba(0,0,0,.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: "Georgia,serif",
              fontSize: 28,
              fontWeight: 700,
              color: PRIMARY,
              marginBottom: 8,
            }}
          >
            The Masters
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Fantasy Golf Pool - Sign {isSignup ? "up" : "in"} to play
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <p
              style={{
                color: "#ef4444",
                fontSize: 12,
                marginBottom: 16,
                background: "#fee2e2",
                padding: 10,
                borderRadius: 6,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 10,
              background: loading ? "#9ca3af" : PRIMARY,
              color: "white",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: 15,
              marginBottom: 16,
            }}
          >
            {loading ? "Loading..." : isSignup ? "Create Account" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              background: "#f3f4f6",
              color: "#6b7280",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {isSignup
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </button>

          {!isSignup && (
            <button
              type="button"
              onClick={async () => {
                if (!email) {
                  setError("Enter your email first");
                  return;
                }
                try {
                  await sendPasswordResetEmail(auth, email);
                  alert("Password reset email sent! Check your inbox.");
                } catch (err) {
                  setError(err.message);
                }
              }}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 8,
                borderRadius: 10,
                background: "transparent",
                color: PRIMARY,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                textDecoration: "underline",
              }}
            >
              Forgot password?
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ entries, onApprove, onDeny, onDelete, onLogout, onBack, liveScores }) => {
  const pending = entries.filter((e) => e.status === "pending");
  const approved = entries.filter((e) => e.status === "approved");
  const denied = entries.filter((e) => e.status === "denied");

  // Announcement
  const [announcement, setAnnouncement] = useState("");
  const [announceSaved, setAnnounceSaved] = useState(false);

  const saveAnnouncement = async () => {
    await set(ref(realtimeDb, "announcement"), announcement.trim() || null);
    setAnnounceSaved(true);
    setTimeout(() => setAnnounceSaved(false), 2000);
  };

  // Score override
  const [overrideGolfer, setOverrideGolfer] = useState("");
  const [overrideFields, setOverrideFields] = useState({ r1: "", r2: "", r3: "", r4: "", thru: "", cut: false });
  const [overrideSaved, setOverrideSaved] = useState(false);

  const handleSelectGolfer = (name) => {
    setOverrideGolfer(name);
    const current = liveScores[safeKey(name)] || {};
    setOverrideFields({
      r1: current.r1 ?? "",
      r2: current.r2 ?? "",
      r3: current.r3 ?? "",
      r4: current.r4 ?? "",
      thru: current.thru ?? "",
      cut: current.cut ?? false,
    });
  };

  const saveOverride = async () => {
    if (!overrideGolfer) return;
    const key = safeKey(overrideGolfer);
    // Build patch — only include rounds that have a value entered (leave blank = not played)
    const patch = { thru: overrideFields.thru || "-", cut: overrideFields.cut };
    for (const r of ["r1", "r2", "r3", "r4"]) {
      if (overrideFields[r] !== "") patch[r] = Number(overrideFields[r]);
    }
    // Use set() to fully replace the player node (removes any stale rounds)
    await set(ref(realtimeDb, `liveScores/current/scores/${key}`), patch);
    setOverrideSaved(true);
    setTimeout(() => setOverrideSaved(false), 2000);
  };

  const downloadCSV = () => {
    const headers = ["Team", "Owner", "Status", "Golfers", "Cap", "TB"];
    const rows = entries.map((e) => [
      e.name,
      e.ownerEmail,
      e.status,
      e.golfers.map((g) => g.name).join("; "),
      e.golfers.reduce((s, g) => s + g.salary, 0),
      e.tb,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => '"' + cell + '"').join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "pool-entries-" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "Georgia,serif",
              fontSize: 26,
              fontWeight: 700,
              color: PRIMARY,
              margin: "0 0 4px",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
            Team Approval & Management
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onBack}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: PRIMARY,
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            ← Back to Site
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: "#f3f4f6",
              color: "#6b7280",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Pending Review", value: pending.length, color: ACCENT },
          { label: "Approved", value: approved.length, color: PRIMARY },
          { label: "Denied", value: denied.length, color: "#ef4444" },
          { label: "Total Entries", value: entries.length, color: SECONDARY },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "white",
              padding: 18,
              borderRadius: 10,
              boxShadow: "0 1px 3px rgba(0,0,0,.1)",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "#9ca3af",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {label}
            </p>
            <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "white",
          padding: 18,
          borderRadius: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,.1)",
          marginBottom: 20,
        }}
      >
        <button
          onClick={downloadCSV}
          style={{
            padding: "9px 14px",
            borderRadius: 8,
            background: PRIMARY,
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          Download CSV
        </button>
      </div>

      {/* Announcement Banner */}
      <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700, color: PRIMARY, marginBottom: 12 }}>
          📢 Site Announcement
        </h2>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          This message will appear as a banner at the top of the site for all users. Leave blank to hide it.
        </p>
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="e.g. Entries close Thursday 6:40 AM ET — make sure your team is submitted!"
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, resize: "vertical", minHeight: 70, boxSizing: "border-box", fontFamily: "inherit" }}
        />
        <button
          onClick={saveAnnouncement}
          style={{ marginTop: 8, padding: "8px 18px", borderRadius: 8, background: announceSaved ? "#16a34a" : PRIMARY, color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
        >
          {announceSaved ? "✓ Saved!" : "Post Announcement"}
        </button>
      </div>

      {/* Score Override */}
      <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700, color: PRIMARY, marginBottom: 4 }}>
          ✏️ Manual Score Entry
        </h2>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
          Enter scores manually for any player. Leave rounds blank if not yet played. Scores are to par (e.g. -3, 0, +2).
        </p>
        <select
          value={overrideGolfer}
          onChange={(e) => handleSelectGolfer(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, marginBottom: 12 }}
        >
          <option value="">— Select a golfer —</option>
          {GOLFER_LIST.map((g) => <option key={g.name} value={g.name}>{g.name} (${g.salary.toLocaleString()})</option>)}
        </select>
        {overrideGolfer && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
              {["r1","r2","r3","r4"].map((r) => (
                <div key={r}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>{r.toUpperCase()} <span style={{fontWeight:400}}>(to par, blank=unplayed)</span></label>
                  <input
                    type="number"
                    value={overrideFields[r]}
                    onChange={(e) => setOverrideFields((f) => ({ ...f, [r]: e.target.value }))}
                    style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, boxSizing: "border-box" }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>THRU</label>
                <input
                  value={overrideFields.thru}
                  onChange={(e) => setOverrideFields((f) => ({ ...f, thru: e.target.value }))}
                  placeholder="F, F*, 9, —"
                  style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #e5e7eb", fontSize: 13, width: 80 }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
                <input
                  type="checkbox"
                  checked={overrideFields.cut}
                  onChange={(e) => setOverrideFields((f) => ({ ...f, cut: e.target.checked }))}
                  id="cutCheck"
                />
                <label htmlFor="cutCheck" style={{ fontSize: 13, fontWeight: 600, color: "#ef4444" }}>Missed Cut</label>
              </div>
            </div>
            <button
              onClick={saveOverride}
              style={{ padding: "8px 18px", borderRadius: 8, background: overrideSaved ? "#16a34a" : "#f59e0b", color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}
            >
              {overrideSaved ? "✓ Saved!" : "Save Override"}
            </button>
          </div>
        )}
      </div>

      {pending.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: 10,
            boxShadow: "0 1px 3px rgba(0,0,0,.1)",
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid #f3f4f6",
              background: LIGHT_ACCENT,
            }}
          >
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: PRIMARY,
                margin: 0,
              }}
            >
              Pending Approval ({pending.length})
            </h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <th
                    style={{
                      padding: "9px 18px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#9ca3af",
                    }}
                  >
                    Team
                  </th>
                  <th
                    style={{
                      padding: "9px 18px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#9ca3af",
                    }}
                  >
                    Owner
                  </th>
                  <th
                    style={{
                      padding: "9px 18px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#9ca3af",
                    }}
                  >
                    Golfers
                  </th>
                  <th
                    style={{
                      padding: "9px 18px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#9ca3af",
                    }}
                  >
                    Cap
                  </th>
                  <th
                    style={{
                      padding: "9px 18px",
                      textAlign: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#9ca3af",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pending.map((entry) => {
                  const capUsed = entry.golfers.reduce(
                    (s, g) => s + g.salary,
                    0
                  );
                  return (
                    <tr
                      key={entry.id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td
                        style={{
                          padding: "11px 18px",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        {entry.name}
                      </td>
                      <td
                        style={{
                          padding: "11px 18px",
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        {entry.ownerEmail}
                      </td>
                      <td
                        style={{
                          padding: "11px 18px",
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        {entry.golfers.length}
                      </td>
                      <td
                        style={{
                          padding: "11px 18px",
                          fontSize: 12,
                          fontFamily: "monospace",
                          color: PRIMARY,
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {fmtMoney(capUsed)}
                      </td>
                      <td style={{ padding: "11px 18px", textAlign: "center" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => onApprove(entry.id)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              background: "#d1fae5",
                              color: "#16a34a",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onDeny(entry.id)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 6,
                              background: "#fee2e2",
                              color: "#ef4444",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6" }}
        >
          <h2
            style={{ fontSize: 15, fontWeight: 700, color: PRIMARY, margin: 0 }}
          >
            All Entries ({entries.length})
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#f9fafb",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <th
                  style={{
                    padding: "9px 18px",
                    textAlign: "left",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",
                  }}
                >
                  Team
                </th>
                <th
                  style={{
                    padding: "9px 18px",
                    textAlign: "left",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",
                  }}
                >
                  Owner
                </th>
                <th
                  style={{
                    padding: "9px 18px",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: "9px 18px",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",
                  }}
                >
                  Cap
                </th>
                <th
                  style={{
                    padding: "9px 18px",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",
                  }}
                ></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const capUsed = entry.golfers.reduce((s, g) => s + g.salary, 0);
                return (
                  <tr
                    key={entry.id}
                    style={{ borderBottom: "1px solid #f3f4f6" }}
                  >
                    <td
                      style={{
                        padding: "11px 18px",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {entry.name}
                    </td>
                    <td
                      style={{
                        padding: "11px 18px",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      {entry.ownerEmail}
                    </td>
                    <td style={{ padding: "11px 18px", textAlign: "center" }}>
                      {entry.status === "approved" ? (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 7px",
                            borderRadius: 999,
                            background: "#d1fae5",
                            color: "#16a34a",
                            fontWeight: 700,
                          }}
                        >
                          APPROVED
                        </span>
                      ) : entry.status === "denied" ? (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 7px",
                            borderRadius: 999,
                            background: "#fee2e2",
                            color: "#ef4444",
                            fontWeight: 700,
                          }}
                        >
                          DENIED
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 10,
                            padding: "2px 7px",
                            borderRadius: 999,
                            background: LIGHT_ACCENT,
                            color: PRIMARY,
                            fontWeight: 700,
                          }}
                        >
                          PENDING
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "11px 18px",
                        fontSize: 12,
                        fontFamily: "monospace",
                        color: PRIMARY,
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {fmtMoney(capUsed)}
                    </td>
                    <td style={{ padding: "11px 18px", textAlign: "center" }}>
                      <button
                        onClick={() =>
                          window.confirm('Delete "' + entry.name + '"?') &&
                          onDelete(entry.id)
                        }
                        style={{
                          padding: "4px 9px",
                          borderRadius: 6,
                          background: "#fee2e2",
                          color: "#ef4444",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const JoinModal = ({ onClose, onSubmit }) => {
  const [teamName, setTeamName] = useState("");
  const [search, setSearch] = useState("");
  const [picks, setPicks] = useState([]);
  const [tb, setTb] = useState("");
  const [errs, setErrs] = useState({});
  const [done, setDone] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const totalSalary = picks.reduce((s, g) => s + g.salary, 0);
  const remaining = BUDGET - totalSalary;
  const overBudget = totalSalary > BUDGET;
  const filtered = GOLFER_LIST.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) &&
      !picks.find((p) => p.name === g.name)
  );

  const addPick = (g) => {
    if (totalSalary + g.salary > BUDGET) {
      alert("Cannot add " + g.name + " - would exceed $20,000!");
      return;
    }
    setPicks([...picks, g]);
    setSearch("");
    setErrs({ ...errs, picks: null });
  };

  const removePick = (name) => setPicks(picks.filter((p) => p.name !== name));

  const submit = () => {
    const e = {};
    if (!teamName.trim()) e.name = "Team name required";
    if (picks.length < MIN_PLAYERS)
      e.picks = "Need " + MIN_PLAYERS + " golfers";
    if (overBudget) e.picks = "Over budget!";
    if (!tb.trim()) e.tb = "Tiebreaker required";
    if (!termsAccepted) e.terms = "Accept Terms";
    if (Object.keys(e).length) {
      setErrs(e);
      return;
    }

    if (totalSalary > BUDGET) {
      alert("Over budget!");
      return;
    }

    setDone(true);
    setTimeout(() => {
      onSubmit({ teamName, picks, tb });
      onClose();
    }, 1800);
  };

  if (done)
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,.52)",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            maxWidth: 360,
            padding: "44px 28px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 10, color: ACCENT }}>✓</div>
          <h2
            style={{
              fontFamily: "Georgia,serif",
              color: PRIMARY,
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Submitted!
          </h2>
          <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>
            Your team is pending admin approval
          </p>
        </div>
      </div>
    );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,.52)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 16,
          width: "100%",
          maxWidth: 520,
          maxHeight: "94vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: PRIMARY,
            padding: "20px 24px 18px",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "Georgia,serif",
                  color: "white",
                  fontSize: 18,
                  fontWeight: 700,
                  margin: "0 0 3px",
                }}
              >
                Build Your Team
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,.6)",
                  fontSize: 11,
                  margin: 0,
                }}
              >
                $20,000 Cap - Min 4 Players
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,.6)",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,.65)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                Cap Used
              </span>
              <span
                style={{
                  color: overBudget ? "#fca5a5" : "white",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                {fmtMoney(totalSalary)} / {fmtMoney(BUDGET)}
              </span>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,.2)",
                borderRadius: 999,
                height: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 999,
                  width: Math.min((totalSalary / BUDGET) * 100, 100) + "%",
                  background: overBudget ? "#ef4444" : ACCENT,
                  transition: "width .3s",
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 700,
                color: PRIMARY,
                marginBottom: 6,
              }}
            >
              Team Name
            </label>
            <input
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setErrs({ ...errs, name: null });
              }}
              placeholder="e.g., Texas Two-Step"
              style={{
                width: "100%",
                padding: "9px 11px",
                borderRadius: 8,
                border: "1px solid " + (errs.name ? "#ef4444" : "#e5e7eb"),
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {errs.name && (
              <p style={{ color: "#ef4444", fontSize: 10, margin: "3px 0 0" }}>
                {errs.name}
              </p>
            )}
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 700,
                color: PRIMARY,
                marginBottom: 6,
              }}
            >
              Roster - {picks.length} players
            </label>
            {picks.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  marginBottom: 7,
                }}
              >
                {picks.map((g) => (
                  <div
                    key={g.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      borderRadius: 7,
                      background: LIGHT_ACCENT,
                      border: "1px solid " + ACCENT,
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500 }}>
                      {g.name}
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          fontWeight: 700,
                          color: PRIMARY,
                        }}
                      >
                        {fmtMoney(g.salary)}
                      </span>
                      <button
                        onClick={() => removePick(g.name)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#9ca3af",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errs.picks && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: 10,
                  margin: "0 0 5px",
                  fontWeight: 600,
                }}
              >
                {errs.picks}
              </p>
            )}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search golfers..."
              style={{
                width: "100%",
                padding: "9px 11px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 5,
              }}
            />
            <div
              style={{
                maxHeight: 180,
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            >
              {filtered.length === 0 ? (
                <p
                  style={{
                    color: "#9ca3af",
                    fontSize: 12,
                    textAlign: "center",
                    padding: 12,
                    margin: 0,
                  }}
                >
                  No golfers
                </p>
              ) : (
                filtered.map((g) => {
                  const cant = totalSalary + g.salary > BUDGET;
                  return (
                    <div
                      key={g.name}
                      onClick={() => !cant && addPick(g)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 11px",
                        borderBottom: "1px solid #f3f4f6",
                        cursor: cant ? "not-allowed" : "pointer",
                        opacity: cant ? 0.4 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!cant) e.currentTarget.style.background = "#f9fafb";
                      }}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "white")
                      }
                    >
                      <span style={{ fontSize: 12, fontWeight: 500 }}>
                        {g.name}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            fontWeight: 700,
                            color: PRIMARY,
                          }}
                        >
                          {fmtMoney(g.salary)}
                        </span>
                        <span
                          style={{
                            color: PRIMARY,
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          +
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontWeight: 700,
                color: PRIMARY,
                marginBottom: 4,
              }}
            >
              Tiebreaker
            </label>
            <input
              value={tb}
              onChange={(e) => {
                setTb(e.target.value);
                setErrs({ ...errs, tb: null });
              }}
              placeholder="-12"
              style={{
                width: "100%",
                padding: "9px 11px",
                borderRadius: 8,
                border: "1px solid " + (errs.tb ? "#ef4444" : "#e5e7eb"),
                fontSize: 13,
                fontFamily: "monospace",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {errs.tb && (
              <p style={{ color: "#ef4444", fontSize: 10, margin: "3px 0 0" }}>
                {errs.tb}
              </p>
            )}
          </div>
          <div style={{ background: "#f9fafb", padding: 12, borderRadius: 8 }}>
            <label
              style={{
                display: "flex",
                alignItems: "start",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  setErrs({ ...errs, terms: null });
                }}
                style={{
                  marginTop: 1,
                  width: 15,
                  height: 15,
                  cursor: "pointer",
                  accentColor: PRIMARY,
                }}
              />
              <span style={{ fontSize: 12 }}>I agree to Terms</span>
            </label>
            {errs.terms && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: 10,
                  margin: "5px 0 0 23px",
                }}
              >
                {errs.terms}
              </p>
            )}
          </div>
          <button
            onClick={submit}
            style={{
              width: "100%",
              padding: 11,
              borderRadius: 8,
              background: overBudget || !termsAccepted ? "#9ca3af" : PRIMARY,
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              border: "none",
              cursor: overBudget || !termsAccepted ? "not-allowed" : "pointer",
            }}
          >
            {overBudget
              ? "Over Budget"
              : !termsAccepted
              ? "Accept Terms"
              : "Submit Team"}
          </button>
        </div>
      </div>
    </div>
  );
};

const GolferLeaderboard = ({ liveScores }) => {
  const [showAll, setShowAll] = useState(false);
  const field = GOLFER_LIST.map((g) => {
    const d = liveScores[safeKey(g.name)] || DEFAULT_LIVE[g.name] || { r1: null, r2: null, r3: null, r4: null, thru: "-", cut: false };
    const total = [d.r1, d.r2, d.r3, d.r4]
      .filter((x) => x != null)
      .reduce((a, b) => a + b, 0);
    return { ...g, ...d, total };
  }).sort((a, b) => {
    if (a.cut && !b.cut) return 1;
    if (!a.cut && b.cut) return -1;
    return a.total - b.total;
  });
  const display = showAll ? field : field.slice(0, 25);
  let rank = 0,
    lastScore = null,
    tieCount = 0;

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "Georgia,serif",
              fontSize: 15,
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 3px",
            }}
          >
            Tournament Leaderboard
          </h2>
        </div>
        {liveScores !== DEFAULT_LIVE && (
          <div style={{ fontSize: 10, color: "#9ca3af" }}>
            Updated:{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
      <div style={{ overflowX: "auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "34px minmax(120px,1fr) 46px 36px 30px 30px 30px 30px 50px",
          gap: 2,
          padding: "6px 10px",
          background: "#f9fafb",
          borderBottom: "1px solid #f3f4f6",
          minWidth: 460,
        }}
      >
        {["POS", "PLAYER", "TOT", "THRU", "R1", "R2", "R3", "R4", "SALARY"].map(
          (h, i) => (
            <span
              key={i}
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#9ca3af",
                textTransform: "uppercase",
                textAlign: i === 0 || i > 1 ? "center" : "left",
              }}
            >
              {h}
            </span>
          )
        )}
      </div>
      <div style={{ maxHeight: 600, overflowY: "auto" }}>
        {display.map((g, i) => {
          const prevCut = i > 0 && display[i - 1].cut;
          const cutDivider = g.cut && !prevCut;
          if (g.total !== lastScore) {
            rank += tieCount + 1;
            tieCount = 0;
          } else {
            tieCount++;
          }
          lastScore = g.total;
          const dispRank = g.cut
            ? "CUT"
            : tieCount > 0
            ? "T" + rank
            : String(rank);
          const isLead = rank === 1 && !g.cut;
          return (
            <React.Fragment key={g.name}>
            {cutDivider && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#fef2f2", borderTop: "1px solid #fca5a5", borderBottom: "1px solid #fca5a5" }}>
                <div style={{ flex: 1, height: 1, background: "#fca5a5" }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: 1 }}>✂ MISSED CUT</span>
                <div style={{ flex: 1, height: 1, background: "#fca5a5" }} />
              </div>
            )}
            <div
              key={g.name}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "34px minmax(120px,1fr) 46px 36px 30px 30px 30px 30px 50px",
                gap: 2,
                padding: "7px 10px",
                borderBottom: "1px solid #f9fafb",
                background: isLead ? "#fffbeb" : "white",
                alignItems: "center",
                minWidth: 460,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isLead ? 700 : 500,
                  color: isLead ? ACCENT : "#6b7280",
                  textAlign: "center",
                  fontFamily: "monospace",
                }}
              >
                {dispRank}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: isLead ? 600 : 400,
                  color: "#111827",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {g.name}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: scoreCol(g.total),
                  fontFamily: "monospace",
                  textAlign: "center",
                }}
              >
                {fmt(g.total)}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  fontFamily: "monospace",
                  textAlign: "center",
                }}
              >
                {g.thru}
              </span>
              <RndBox val={g.r1} label="R1" />
              <RndBox val={g.r2} label="R2" />
              <RndBox val={g.r3} label="R3" />
              <RndBox val={g.r4} label="R4" />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: PRIMARY,
                  fontFamily: "monospace",
                  textAlign: "center",
                }}
              >
                {fmtMoney(g.salary)}
              </span>
            </div>
            </React.Fragment>
          );
        })}
      </div>
      </div>
      {!showAll && field.length > 25 && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            padding: "10px",
            background: "#f9fafb",
            border: "none",
            borderTop: "1px solid #f3f4f6",
            cursor: "pointer",
            color: PRIMARY,
            fontSize: 12,
            fontWeight: 600,
            width: "100%",
          }}
        >
          Show all
        </button>
      )}
    </div>
  );
};

const TeamPlayerList = ({ entry }) => {
  const [showAll, setShowAll] = useState(false);
  const displayPlayers = showAll ? entry.withData : entry.top4;

  return (
    <div style={{ paddingLeft: 42 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {displayPlayers.map((g) => (
          <div
            key={g.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
            }}
          >
            <span style={{ color: g.cut ? "#ef4444" : "#6b7280" }}>
              {g.name}{" "}
              {g.cut && (
                <span
                  style={{ fontSize: 9, color: "#ef4444", fontWeight: 700 }}
                >
                  CUT
                </span>
              )}
            </span>
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 600,
                color: scoreCol(g.total),
              }}
            >
              {fmt(g.total)}
            </span>
          </div>
        ))}
      </div>
      {entry.withData.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            marginTop: 8,
            fontSize: 10,
            color: PRIMARY,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
          }}
        >
          {showAll ? "Show top 4 only" : "Show all players"}
        </button>
      )}
    </div>
  );
};

const TeamLeaderboard = ({ entries, liveScores }) => {
  const approvedEntries = entries.filter((e) => e.status === "approved");
  const computed = approvedEntries.map((e) => {
    const { withData, top4, teamScore, eliminated } = computeTeam(
      e.golfers,
      liveScores
    );
    return { ...e, withData, top4, teamScore, eliminated };
  });
  const active = computed
    .filter((e) => !e.eliminated)
    .sort((a, b) => a.teamScore - b.teamScore);
  const elim = computed
    .filter((e) => e.eliminated)
    .sort((a, b) => a.teamScore - b.teamScore);
  const sorted = [...active, ...elim];

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,.06)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
        <h2
          style={{
            fontFamily: "Georgia,serif",
            fontSize: 15,
            fontWeight: 700,
            color: "#111827",
            margin: "0 0 3px",
          }}
        >
          Pool Leaderboard
        </h2>
        <p style={{ color: "#9ca3af", fontSize: 11, margin: 0 }}>
          {active.length} active
        </p>
      </div>
      <div style={{ maxHeight: 600, overflowY: "auto" }}>
        {sorted.map((entry) => {
          const rank = entry.eliminated
            ? null
            : active.findIndex((a) => a.id === entry.id) + 1;
          const isLead = rank === 1;
          return (
            <div
              key={entry.id}
              style={{
                borderBottom: "1px solid #f3f4f6",
                background: entry.eliminated ? "#fef2f2" : isLead ? "#fffbeb" : "white",
                padding: "12px 16px",
                opacity: entry.eliminated ? 0.75 : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: isLead ? ACCENT : "#9ca3af",
                    minWidth: 30,
                  }}
                >
                  {rank || "-"}
                </span>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: PRIMARY,
                      margin: "0 0 2px",
                    }}
                  >
                    {entry.name}
                  </h3>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                    {entry.ownerEmail}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <span
                    style={{
                      fontSize: 18,
                      fontFamily: "monospace",
                      fontWeight: 700,
                      color: entry.eliminated ? "#ef4444" : isLead ? ACCENT : PRIMARY,
                    }}
                  >
                    {fmt(entry.teamScore)}
                  </span>
                  {entry.eliminated && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#ef4444", background: "#fee2e2", padding: "1px 5px", borderRadius: 4, letterSpacing: 0.5 }}>
                      ELIMINATED
                    </span>
                  )}
                </div>
              </div>
              <TeamPlayerList entry={entry} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HelpPage = () => (
  <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
    {[
      {
        title: "How the Pool Works",
        items: [
          "Each player picks a team of golfers from the tournament field before the event begins.",
          "You have a $20,000 salary cap — your total golfer salaries cannot exceed this amount.",
          "You must select at least 4 golfers.",
          "Your team score is the combined cumulative total (strokes to par) of your 4 best golfers at any point in the tournament. Your other golfers are dropped.",
          "The team with the lowest combined score at the end of the tournament wins.",
        ],
      },
      {
        title: "Scoring",
        items: [
          "Scores are based on strokes-to-par (e.g. -6 means 6 under par).",
          "Lower is better — just like real golf.",
          "Your team score = the sum of your 4 best golfers' total scores.",
          "If a golfer on your roster misses the cut but they are outside your top 4, it doesn't affect you — your top 4 still count.",
          "If any of your top 4 scoring golfers miss the cut, your team is eliminated.",
        ],
      },
      {
        title: "Salary Tiers",
        items: [
          "$9,000 — Elite contenders (Scheffler, McIlroy tier)",
          "$7,000 — Strong players",
          "$6,000 — Solid mid-range picks",
          "$4,000 — Mid-tier value plays",
          "$2,000 — Longshot/value picks",
          "$1,000 — Past champions & amateurs",
        ],
      },
      {
        title: "Rules & Entry",
        items: [
          "Entries must be submitted before the tournament begins — no changes after tee-off.",
          "All entries must be approved by the pool admin before they are officially entered.",
          "You can enter multiple teams.",
          "In the event of a tie in the pool, the tiebreaker score you submitted is used.",
          "Scores update automatically every 10 minutes during tournament rounds.",
        ],
      },
    ].map(({ title, items }) => (
      <div
        key={title}
        style={{
          background: "white",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,.08)",
          padding: 20,
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia,serif",
            fontSize: 16,
            fontWeight: 700,
            color: PRIMARY,
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: "2px solid " + ACCENT,
          }}
        >
          {title}
        </h2>
        <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
          {items.map((item, i) => (
            <li key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 8, lineHeight: 1.5 }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    ))}
    <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
      Questions? Contact the pool admin at owenverlander@gmail.com
    </p>
  </div>
);

const MyTeamsPage = ({ entries, userEmail, liveScores }) => {
  const mine = entries.filter((e) => e.ownerEmail === userEmail);

  // Compute pool rank for each of my teams
  const approvedEntries = entries.filter((e) => e.status === "approved");
  const rankedEntries = [...approvedEntries]
    .map((e) => {
      const { teamScore } = computeTeam(e.golfers, liveScores);
      return { ...e, teamScore };
    })
    .sort((a, b) => a.teamScore - b.teamScore);

  function getPoolRank(entryId) {
    const idx = rankedEntries.findIndex((e) => e.id === entryId);
    if (idx === -1) return null;
    const myScore = rankedEntries[idx].teamScore;
    const ties = rankedEntries.filter((e) => e.teamScore === myScore);
    const rank = rankedEntries.findIndex((e) => e.teamScore === myScore) + 1;
    return ties.length > 1 ? `T${rank}` : String(rank);
  }

  if (mine.length === 0)
    return (
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "60px 16px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia,serif",
            color: PRIMARY,
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          No Teams Yet
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14 }}>
          Click "+ New Team" to get started!
        </p>
      </div>
    );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h2
        style={{
          fontFamily: "Georgia,serif",
          color: PRIMARY,
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 16,
        }}
      >
        My Teams ({mine.length})
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {mine.map((entry) => {
          const { withData, teamScore, eliminated } = computeTeam(entry.golfers, liveScores);
          const poolRank = entry.status === "approved" ? getPoolRank(entry.id) : null;
          return (
          <div
            key={entry.id}
            style={{
              background: "white",
              borderRadius: 12,
              boxShadow: "0 1px 3px rgba(0,0,0,.1)",
              border:
                "2px solid " +
                (entry.status === "approved"
                  ? "#d1fae5"
                  : entry.status === "denied"
                  ? "#fee2e2"
                  : LIGHT_ACCENT),
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: PRIMARY, margin: "0 0 2px" }}>
                  {entry.name}
                </h3>
                {eliminated && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", background: "#fee2e2", padding: "2px 8px", borderRadius: 6, display: "inline-block", marginBottom: 4 }}>
                    ❌ ELIMINATED
                  </span>
                )}
                {poolRank && !eliminated && (
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    Pool Rank: <strong style={{ color: PRIMARY }}>#{poolRank}</strong>
                    {" · "}Team Score: <strong style={{ color: scoreCol(teamScore), fontFamily: "monospace" }}>{fmt(teamScore)}</strong>
                  </span>
                )}
                {poolRank && eliminated && (
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    Team Score: <strong style={{ color: "#ef4444", fontFamily: "monospace" }}>{fmt(teamScore)}</strong>
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                {entry.status === "approved" ? (
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "#d1fae5", color: "#16a34a", fontWeight: 700 }}>APPROVED</span>
                ) : entry.status === "denied" ? (
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "#fee2e2", color: "#ef4444", fontWeight: 700 }}>DENIED</span>
                ) : (
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: LIGHT_ACCENT, color: PRIMARY, fontWeight: 700 }}>PENDING</span>
                )}
              </div>
            </div>

            {/* Player score table */}
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(130px,1fr) 40px 36px 30px 30px 30px 30px", gap: 2, padding: "5px 12px", background: "#f9fafb", borderTop: "1px solid #f3f4f6", minWidth: 380 }}>
                {["PLAYER","TOT","THRU","R1","R2","R3","R4"].map((h, i) => (
                  <span key={i} style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", textAlign: i === 0 ? "left" : "center" }}>{h}</span>
                ))}
              </div>
              {withData.map((g) => (
                <div key={g.name} style={{ display: "grid", gridTemplateColumns: "minmax(130px,1fr) 40px 36px 30px 30px 30px 30px", gap: 2, padding: "7px 12px", borderTop: "1px solid #f3f4f6", alignItems: "center", minWidth: 380, background: g.cut ? "#fef2f2" : "white" }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: g.cut ? "#9ca3af" : "#111827" }}>{g.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: scoreCol(g.total), textAlign: "center" }}>{fmt(g.total)}</span>
                  <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", textAlign: "center" }}>{g.thru || "-"}</span>
                  <RndBox val={g.r1} label="R1" />
                  <RndBox val={g.r2} label="R2" />
                  <RndBox val={g.r3} label="R3" />
                  <RndBox val={g.r4} label="R4" />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: "10px 16px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280" }}>
              <span>Cap used: <strong style={{ color: PRIMARY }}>{fmtMoney(entry.golfers.reduce((s, g) => s + g.salary, 0))}</strong></span>
              <span>Tiebreaker: <strong>{fmt(entry.tb)}</strong></span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState("leaderboard");
  const [showJoin, setShowJoin] = useState(false);
  const [liveScores, setLiveScores] = useState(DEFAULT_LIVE);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tournamentInfo, setTournamentInfo] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [siteAnnouncement, setSiteAnnouncement] = useState("");
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const entriesLocked = Date.now() >= ENTRIES_LOCK_TIME.getTime();

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    localStorage.setItem("dismissedAnnouncement", siteAnnouncement);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "entries"), (snapshot) => {
      const entriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(entriesData);
    });
    return () => unsubscribe();
  }, [user]);

  // Live scoring - reads from Realtime Database (populated by GitHub Actions cron job)
  useEffect(() => {
    const scoresRef = ref(realtimeDb, "liveScores/current");
    const unsubscribe = onValue(scoresRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setLiveScores(data.scores || DEFAULT_LIVE);
        setIsLive(data.playerCount > 0);
        setLastUpdated(data.lastUpdated || null);
        console.log("Live scores updated:", data.playerCount, "players");
      } else {
        setLiveScores(DEFAULT_LIVE);
        setIsLive(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Announcement banner
  useEffect(() => {
    const unsubscribe = onValue(ref(realtimeDb, "announcement"), (snap) => {
      const msg = snap.val() || "";
      setSiteAnnouncement(msg);
      const dismissed = localStorage.getItem("dismissedAnnouncement");
      setAnnouncementDismissed(dismissed === msg && msg !== "");
    });
    return () => unsubscribe();
  }, []);

  // Countdown to next Masters round (April 9-12 2026, tee times ~8am CT)
  useEffect(() => {
    const rounds = [
      new Date("2026-04-09T13:00:00Z"), // R1 Thu 8am CT
      new Date("2026-04-10T13:00:00Z"), // R2 Fri 8am CT
      new Date("2026-04-11T13:00:00Z"), // R3 Sat 8am CT
      new Date("2026-04-12T13:00:00Z"), // R4 Sun 8am CT
    ];
    const tick = () => {
      const now = Date.now();
      const next = rounds.find((d) => d.getTime() > now);
      if (!next) { setCountdown(""); return; }
      const diff = next.getTime() - now;
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const label = rounds.indexOf(next) === 0 ? "Masters R1" : `Masters R${rounds.indexOf(next) + 1}`;
      setCountdown(d > 0 ? `${label} in ${d}d ${h}h ${m}m` : `${label} in ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleJoin = async ({ teamName, picks, tb }) => {
    const total = picks.reduce((s, g) => s + g.salary, 0);
    if (total > BUDGET) {
      alert("Over cap!");
      return;
    }

    try {
      // Parse tiebreaker - handle NaN
      const tbValue = parseInt(tb.replace(/[^-\d]/g, ""));
      const finalTb = isNaN(tbValue) ? 0 : tbValue;

      await addDoc(collection(db, "entries"), {
        name: teamName,
        ownerEmail: user.email,
        tb: finalTb,
        golfers: picks.map((g) => ({ name: g.name, salary: g.salary })),
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving team");
    }
  };

  const handleApprove = async (id) => {
    try {
      await updateDoc(firestoreDoc(db, "entries", id), { status: "approved" });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeny = async (id) => {
    try {
      await updateDoc(firestoreDoc(db, "entries", id), { status: "denied" });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await deleteDoc(firestoreDoc(db, "entries", id));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setPage("leaderboard");
  };

  const isAdmin = user?.email === ADMIN_EMAIL;
  const myCount = entries.filter((e) => e.ownerEmail === user?.email).length;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
        }}
      >
        <p style={{ color: "#6b7280" }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => setLoading(false)} />;
  }

  if (page === "admin" && isAdmin) {
    return (
      <AdminDashboard
        entries={entries}
        onApprove={handleApprove}
        onDeny={handleDeny}
        onDelete={handleDeleteEntry}
        onLogout={handleLogout}
        onBack={() => setPage("leaderboard")}
        liveScores={liveScores}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "'Segoe UI',sans-serif",
      }}
    >
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes mpx{75%,100%{transform:scale(2);opacity:0;}}
        input:focus{outline:none;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:999px;}
      `}</style>

      <header
        style={{ background: PRIMARY, position: "sticky", top: 0, zIndex: 10 }}
      >
        <div
          style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 20px 0" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  color: "rgba(255,255,255,.5)",
                  fontSize: 10,
                  marginBottom: 3,
                }}
              >
                momajors.com
              </p>
              <h1 style={{ color: "white", fontSize: 20, fontWeight: 700 }}>
                The Masters
              </h1>
              <p style={{ color: ACCENT, fontSize: 11, marginTop: 2 }}>
                Fantasy Golf Pool
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {isLive && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    background: "rgba(255,255,255,.12)",
                    padding: "6px 12px",
                    borderRadius: 999,
                  }}
                >
                  <PulsingDot />
                  <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>LIVE</span>
                  {lastUpdated && (
                    <span style={{ color: "rgba(255,255,255,.7)", fontSize: 10 }}>
                      · Updated {new Date(lastUpdated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              )}
              <span style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>
                {user.email}
              </span>
              {isAdmin && (
                <button
                  onClick={() =>
                    setPage(page === "admin" ? "leaderboard" : "admin")
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.12)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {page === "admin" ? "Back" : "Admin"}
                </button>
              )}
              <button
                onClick={() => !entriesLocked && setShowJoin(true)}
                title={entriesLocked ? "Entries are closed" : ""}
                style={{
                  padding: "7px 16px",
                  borderRadius: 999,
                  background: entriesLocked ? "#9ca3af" : ACCENT,
                  color: entriesLocked ? "white" : PRIMARY,
                  border: "none",
                  cursor: entriesLocked ? "not-allowed" : "pointer",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                {entriesLocked ? "🔒 Entries Closed" : "+ New Team"}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.12)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Logout
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 12 }}>
            {[
              { id: "leaderboard", label: "Leaderboard" },
              {
                id: "myteams",
                label: "My Teams" + (myCount > 0 ? " (" + myCount + ")" : ""),
              },
              { id: "help", label: "How It Works" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPage(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "7px 7px 0 0",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    page === tab.id ? "#f3f4f6" : "rgba(255,255,255,.12)",
                  color: page === tab.id ? PRIMARY : "rgba(255,255,255,.75)",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {siteAnnouncement && !announcementDismissed && (
        <div style={{ background: "#1e3a5f", color: "white", fontSize: 13, fontWeight: 600, padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span>📢 {siteAnnouncement}</span>
          <button
            onClick={dismissAnnouncement}
            style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: 6, padding: "2px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}
          >
            Got it ✕
          </button>
        </div>
      )}
      {countdown && (
        <div style={{ background: ACCENT, color: PRIMARY, textAlign: "center", fontSize: 12, fontWeight: 700, padding: "6px 16px", letterSpacing: 0.5 }}>
          ⛳ {countdown}
        </div>
      )}

      {page === "leaderboard" && (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "18px 16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            <GolferLeaderboard liveScores={liveScores} />
            <TeamLeaderboard entries={entries} liveScores={liveScores} />
          </div>
        </div>
      )}
      {page === "myteams" && (
        <MyTeamsPage entries={entries} userEmail={user.email} liveScores={liveScores} />
      )}
      {page === "help" && <HelpPage />}

      {showJoin && (
        <JoinModal onClose={() => setShowJoin(false)} onSubmit={handleJoin} />
      )}
    </div>
  );
}
