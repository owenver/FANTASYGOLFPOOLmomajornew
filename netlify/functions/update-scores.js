// Netlify Function - Fetches ESPN Valero Texas Open scores and saves to Firebase
// Uses direct tournament URL: event=401811940
 
const ESPN_URL = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=401811940";
const FIREBASE_URL = "https://momajors-pool-default-rtdb.firebaseio.com/liveScores/current.json";
 
async function fetchESPNScores() {
  try {
    console.log("Fetching from ESPN API...");
    console.log("URL:", ESPN_URL);
    
    const response = await fetch(ESPN_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.log("ESPN API returned status:", response.status);
      return null;
    }
    
    const data = await response.json();
    console.log("ESPN API response received");
    
    const scores = {};
    
    // Parse ESPN scoreboard format
    const events = data.events || [];
    if (events.length === 0) {
      console.log("No events found in ESPN response");
      return null;
    }
    
    const event = events[0];
    const competitions = event.competitions || [];
    if (competitions.length === 0) {
      console.log("No competitions found");
      return null;
    }
    
    const competitors = competitions[0].competitors || [];
    console.log("Found competitors:", competitors.length);
    
    if (competitors.length === 0) {
      console.log("No competitors found - tournament may not have started");
      return null;
    }
    
    // Parse each player
    competitors.forEach(comp => {
      const athlete = comp.athlete || {};
      const name = athlete.displayName || "";
      
      if (!name) return;
      
      const status = comp.status || {};
      const linescores = comp.linescores || [];
      
      // Get round scores (ESPN returns actual strokes, we convert to par)
      const r1Score = linescores[0]?.value ? parseInt(linescores[0].value) : null;
      const r2Score = linescores[1]?.value ? parseInt(linescores[1].value) : null;
      const r3Score = linescores[2]?.value ? parseInt(linescores[2].value) : null;
      const r4Score = linescores[3]?.value ? parseInt(linescores[3].value) : null;
      
      scores[name] = {
        r1: r1Score !== null ? r1Score - 72 : null,
        r2: r2Score !== null ? r2Score - 72 : null,
        r3: r3Score !== null ? r3Score - 72 : null,
        r4: r4Score !== null ? r4Score - 72 : null,
        thru: status.thru || status.displayValue || "-",
        cut: status.missedCut || false
      };
    });
    
    console.log("Successfully parsed", Object.keys(scores).length, "players");
    return scores;
    
  } catch (error) {
    console.error("Error fetching ESPN scores:", error.message);
    return null;
  }
}
 
exports.handler = async (event, context) => {
  console.log("=== Score Update Function Started ===");
  console.log("Time:", new Date().toISOString());
  
  try {
    // Fetch scores from ESPN
    const scores = await fetchESPNScores();
    
    if (!scores || Object.keys(scores).length === 0) {
      console.log("No scores available yet");
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          success: false, 
          message: "No scores",
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Save to Firebase using REST API
    console.log("Saving to Firebase...");
    const firebaseResponse = await fetch(FIREBASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        scores: scores,
        lastUpdated: new Date().toISOString(),
        playerCount: Object.keys(scores).length
      })
    });
    
    if (!firebaseResponse.ok) {
      const errorText = await firebaseResponse.text();
      throw new Error(`Firebase error ${firebaseResponse.status}: ${errorText}`);
    }
    
    console.log("✅ SUCCESS! Scores saved to Firebase");
    console.log("Players saved:", Object.keys(scores).length);
    
    // Log first few players as confirmation
    const samplePlayers = Object.keys(scores).slice(0, 3);
    console.log("Sample players:", samplePlayers.map(name => `${name}: ${scores[name].r1}`).join(", "));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        playerCount: Object.keys(scores).length,
        timestamp: new Date().toISOString(),
        samplePlayers: samplePlayers
      })
    };
    
  } catch (error) {
    console.error("❌ Function Error:", error.message);
    console.error("Stack:", error.stack);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
  }
};
