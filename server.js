// server.js
// Simple backend to support the AI Risk Governance Dashboard
// Run with: node server.js
// Make sure you have installed: npm install express cors

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 4000; // Front-end will call http://localhost:4000

app.use(cors());
app.use(express.json());

// -----------------------------
// MOCK DATA & HELPERS
// -----------------------------

// Placeholder AI scenarios (can be replaced with DB later)
// Each scenario is a simplified view of an AI use case the board might assess.
let scenarios = [
  {
    id: 1,
    name: "Credit Scoring Engine",
    category: "Financial Services",
    owner: "Chief Risk Officer",
    lifecycleStage: "In Production",
    envScore: 65, // environmental impact 0–100
    socScore: 45, // social impact 0–100
    ecoScore: 80, // economic value 0–100
    description:
      "ML-based credit scoring model used for SME lending decisions in two markets."
  },
  {
    id: 2,
    name: "Customer Service Chatbot",
    category: "Customer Ops",
    owner: "Head of CX",
    lifecycleStage: "Pilot",
    envScore: 40,
    socScore: 55,
    ecoScore: 70,
    description:
      "NLP chatbot automating first-line support across web and mobile channels."
  },
  {
    id: 3,
    name: "Fraud Detection Model",
    category: "Risk & Compliance",
    owner: "Chief Compliance Officer",
    lifecycleStage: "In Production",
    envScore: 55,
    socScore: 60,
    ecoScore: 75,
    description:
      "Real-time fraud detection model for payment transactions across regions."
  }
];

// Educational mode progress is deliberately simple.
// Values are proportions from 0 to 1.
let educationProgress = {
  env: 0.3,
  soc: 0.2,
  eco: 0.1
};

// Helper: calculate composite E–S–Ec score 0–100
function calculateCompositeScore(scores, weights) {
  const { env, soc, eco } = scores;
  const wEnv = weights.env ?? 0.33;
  const wSoc = weights.soc ?? 0.33;
  const wEco = weights.eco ?? 0.34;

  // Clamp to [0,100] just in case
  const cEnv = Math.max(0, Math.min(100, env));
  const cSoc = Math.max(0, Math.min(100, soc));
  const cEco = Math.max(0, Math.min(100, eco));

  const rawScore = cEnv * wEnv + cSoc * wSoc + cEco * wEco;

  let trafficLight = "Amber";
  if (rawScore >= 70) trafficLight = "Green";
  else if (rawScore < 40) trafficLight = "Red";

  return {
    score: Math.round(rawScore),
    trafficLight
  };
}

// -----------------------------
// API ROUTES
// -----------------------------

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AI Risk Governance API running" });
});

// --- AI INVENTORY ---
// Get all scenarios
app.get("/api/scenarios", (req, res) => {
  res.json(scenarios);
});

// Add a new scenario (simple in-memory example)
app.post("/api/scenarios", (req, res) => {
  const {
    name,
    category,
    owner,
    lifecycleStage,
    envScore,
    socScore,
    ecoScore,
    description
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Scenario 'name' is required." });
  }

  const newScenario = {
    id: scenarios.length ? scenarios[scenarios.length - 1].id + 1 : 1,
    name,
    category: category || "Uncategorised",
    owner: owner || "Not Assigned",
    lifecycleStage: lifecycleStage || "Proposed",
    envScore: Number(envScore) || 0,
    socScore: Number(socScore) || 0,
    ecoScore: Number(ecoScore) || 0,
    description: description || ""
  };

  scenarios.push(newScenario);
  res.status(201).json(newScenario);
});

// --- E–S–Ec SIMULATOR ---
// Post a scenario to calculate its composite E–S–Ec score
app.post("/api/score", (req, res) => {
  const { env, soc, eco, weights } = req.body;

  if (
    typeof env !== "number" ||
    typeof soc !== "number" ||
    typeof eco !== "number"
  ) {
    return res
      .status(400)
      .json({ error: "env, soc, and eco must be numeric values." });
  }

  const result = calculateCompositeScore({ env, soc, eco }, weights || {});
  res.json(result);
});

// --- EDUCATIONAL MODE ---
// Get current progress for the three lenses
app.get("/api/education", (req, res) => {
  res.json(educationProgress);
});

// Update progress (very simple: overwrite or increment)
app.post("/api/education", (req, res) => {
  const { env, soc, eco } = req.body;

  // If values supplied, clamp them between 0 and 1
  if (typeof env === "number") {
    educationProgress.env = Math.max(0, Math.min(1, env));
  }
  if (typeof soc === "number") {
    educationProgress.soc = Math.max(0, Math.min(1, soc));
  }
  if (typeof eco === "number") {
    educationProgress.eco = Math.max(0, Math.min(1, eco));
  }

  res.json(educationProgress);
});

// -----------------------------
// START SERVER
// -----------------------------
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log("Press Ctrl+C to stop.");
});

/*
TODO / EXTENSIONS:
- Replace in-memory 'scenarios' with a real database (PostgreSQL / MongoDB).
- Add authentication & role-based access control for Board / Risk / Ops views.
- Add versioning to scenarios and audit trails.
- Add ESG reporting exports (CSV, PDF) pulling from this API.
*/
