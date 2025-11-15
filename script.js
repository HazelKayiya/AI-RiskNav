// ---------- AI SYSTEMS DATASET ----------

const systems = [
  {
    id: 1,
    name: "Credit Scoring Engine",
    owner: "Risk",
    category: "Credit Scoring",
    criticality: "High",
    riskTier: "Very High",
    regulatoryExposure: "EU AI Act High-Risk; GDPR profiling",
    envScore: 3.9,
    socialScore: 2.4,
    economicScore: 4.7,
    policyAligned: false,
    flags: ["bias", "missing DPIA"]
  },
  {
    id: 2,
    name: "HR Screening Model",
    owner: "HR",
    category: "HR Screening",
    criticality: "High",
    riskTier: "High",
    regulatoryExposure: "Employment & Equality",
    envScore: 2.8,
    socialScore: 2.9,
    economicScore: 3.6,
    policyAligned: false,
    flags: ["bias", "explainability gap"]
  },
  {
    id: 3,
    name: "GenAI Copilot (Internal)",
    owner: "IT",
    category: "GenAI Assistant",
    criticality: "Medium",
    riskTier: "Medium",
    regulatoryExposure: "Internal data handling",
    envScore: 3.4,
    socialScore: 3.0,
    economicScore: 3.9,
    policyAligned: true,
    flags: ["data leakage concern"]
  },
  {
    id: 4,
    name: "GenAI Content Tool (Marketing)",
    owner: "Marketing",
    category: "GenAI Content",
    criticality: "Medium",
    riskTier: "Medium",
    regulatoryExposure: "Brand & IP",
    envScore: 3.1,
    socialScore: 3.4,
    economicScore: 3.5,
    policyAligned: true,
    flags: ["IP risk"]
  },
  {
    id: 5,
    name: "Fraud Detection Model",
    owner: "Risk",
    category: "Fraud Detection",
    criticality: "High",
    riskTier: "Medium",
    regulatoryExposure: "Financial crime",
    envScore: 3.6,
    socialScore: 3.8,
    economicScore: 4.8,
    policyAligned: true,
    flags: []
  },
  {
    id: 6,
    name: "Customer Chatbot",
    owner: "Customer Service",
    category: "Chatbot",
    criticality: "Medium",
    riskTier: "Medium",
    regulatoryExposure: "Consumer protection",
    envScore: 3.0,
    socialScore: 3.1,
    economicScore: 3.7,
    policyAligned: true,
    flags: ["hallucination risk"]
  },
  {
    id: 7,
    name: "Vendor LLM Service",
    owner: "IT",
    category: "Third-Party LLM",
    criticality: "High",
    riskTier: "High",
    regulatoryExposure: "Cross-border; data transfer",
    envScore: 4.1,
    socialScore: 3.0,
    economicScore: 4.2,
    policyAligned: false,
    flags: ["no vendor ESG data", "weak logging"]
  },
  {
    id: 8,
    name: "Legacy Recommendation Model",
    owner: "Product",
    category: "Recommendation",
    criticality: "Medium",
    riskTier: "Medium",
    regulatoryExposure: "Consumer transparency",
    envScore: 3.2,
    socialScore: 2.8,
    economicScore: 3.8,
    policyAligned: false,
    flags: ["weak logging"]
  },
  {
    id: 9,
    name: "KYC Screening Engine",
    owner: "Compliance",
    category: "Screening",
    criticality: "High",
    riskTier: "High",
    regulatoryExposure: "AML / KYC",
    envScore: 3.3,
    socialScore: 3.2,
    economicScore: 4.1,
    policyAligned: true,
    flags: ["manual override"]
  }
];

// ---------- RISK & CONTROLS MODEL ----------

const riskDomains = [
  {
    id: 1,
    name: "Data Governance & Privacy",
    esec: ["Social"],
    inherentRisk: 4.6,
    controlMaturity: 3.0,
    residualRisk: 3.9,
    status: "Partial",
    frameworks: ["GDPR", "AI Act", "ISO 27701"],
    subtitle: "Lawful basis, DPIA, data minimisation, retention, data lineage.",
    keyControls: [
      "Central data inventory in place for 80% of AI systems.",
      "DPIA completed for Credit Scoring and Fraud models."
    ],
    keyGaps: [
      "DPIA missing for HR Screening and Legacy Recommendation.",
      "Data lineage incomplete for Vendor LLM integration."
    ],
    owner: "Chief Data Officer"
  },
  {
    id: 2,
    name: "Model Risk Management",
    esec: ["Social", "Economic"],
    inherentRisk: 4.4,
    controlMaturity: 3.4,
    residualRisk: 3.4,
    status: "Aligned",
    frameworks: ["NIST", "AI Act"],
    subtitle: "Validation, testing, monitoring, explainability, change control.",
    keyControls: [
      "Standardised validation pack for high-risk models.",
      "Performance drift monitoring active on Fraud Detection and Credit Scoring."
    ],
    keyGaps: ["Explainability documentation shallow for GenAI use cases."],
    owner: "Head of AI Assurance"
  },
  {
    id: 3,
    name: "Ethics & Responsible AI",
    esec: ["Social"],
    inherentRisk: 4.8,
    controlMaturity: 2.6,
    residualRisk: 4.2,
    status: "Gap",
    frameworks: ["AI Act", "OECD", "Internal Ethics Charter"],
    subtitle: "Fairness, non-discrimination, human oversight, redress.",
    keyControls: [
      "Ethics principles drafted and approved.",
      "Escalation path defined via Group Risk."
    ],
    keyGaps: [
      "Ethics Committee not meeting regularly.",
      "No systematic impact assessment for vulnerable groups."
    ],
    owner: "Chief Compliance Officer"
  },
  {
    id: 4,
    name: "Cybersecurity & Access Control",
    esec: ["Economic"],
    inherentRisk: 3.2,
    controlMaturity: 4.0,
    residualRisk: 2.4,
    status: "Aligned",
    frameworks: ["ISO 27001"],
    subtitle: "Access management, logs, key management, incident response.",
    keyControls: [
      "SOC2 / ISO 27001 coverage for core platforms.",
      "Privileged access management enforced on AI infra."
    ],
    keyGaps: ["Vendor LLM access logs not yet integrated with SIEM."],
    owner: "CISO"
  },
  {
    id: 5,
    name: "Vendor & Third-Party Risk",
    esec: ["Economic", "Env"],
    inherentRisk: 4.1,
    controlMaturity: 2.9,
    residualRisk: 3.6,
    status: "Partial",
    frameworks: ["AI Act", "NIST", "ISO 42001"],
    subtitle: "Contractual safeguards, ESG assurance, exit strategies.",
    keyControls: [
      "Central register of AI-relevant third parties.",
      "Baseline security due diligence performed."
    ],
    keyGaps: [
      "No standard for AI-specific clauses across all contracts.",
      "Limited evidence on vendor environmental performance."
    ],
    owner: "Head of Procurement"
  },
  {
    id: 6,
    name: "Operational Resilience & Incident Management",
    esec: ["Economic", "Social"],
    inherentRisk: 3.9,
    controlMaturity: 3.2,
    residualRisk: 3.3,
    status: "Partial",
    frameworks: ["NIST", "DORA"],
    subtitle: "Continuity, failover, incident playbooks, communications.",
    keyControls: [
      "Playbooks exist for core transaction systems.",
      "Named owners for AI incidents within Group Risk."
    ],
    keyGaps: [
      "Specific AI failure scenarios not fully tested.",
      "Customer communication templates missing for AI-driven incidents."
    ],
    owner: "Chief Risk Officer"
  }
];

// ---------- Helpers ----------

function average(arr, key) {
  if (!arr.length) return 0;
  return arr.reduce((sum, item) => sum + (item[key] || 0), 0) / arr.length;
}

function formatScore(score) {
  return score.toFixed(1) + " / 5";
}

function classifyEsEcStatus(env, soc, eco) {
  const min = Math.min(env, soc, eco);
  if (min >= 3.5) return "On track";
  if (eco >= 4 && (soc < 3 || env < 3)) return "Economy-led; check balance";
  if (soc < 3 || env < 3) return "Mixed (attention required)";
  return "Mixed";
}

function classifyResidualLevel(r) {
  if (r > 4.0) return "Critical";
  if (r > 3.3) return "High";
  if (r > 2.5) return "Medium";
  return "Low";
}

function clampScore(v) {
  return Math.max(1, Math.min(5, v));
}

// ---------- Date ----------

function renderDate() {
  const el = document.getElementById("todayLabel");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// ---------- Alerts builder (used by KPIs + Alerts + Edu) ----------

function buildAlertsFromSystems(data) {
  const severityRank = { "Very High": 3, High: 2, Medium: 1, Low: 0 };

  return data
    .filter(
      s =>
        s.riskTier === "High" ||
        s.riskTier === "Very High" ||
        !s.policyAligned ||
        (s.flags && s.flags.length)
    )
    .map(s => {
      const severeFlags = (s.flags || []).some(f =>
        /bias|missing DPIA|no vendor ESG data|weak logging/i.test(f)
      );

      const tags = [];
      if (s.riskTier === "High" || s.riskTier === "Very High") tags.push("High risk");
      if (!s.policyAligned) tags.push("Policy gap");
      (s.flags || []).forEach(f => tags.push(f));
      if (/EU AI Act|GDPR|AML|KYC/i.test(s.regulatoryExposure)) tags.push("Regulatory");

      const level = severeFlags || s.riskTier === "Very High" ? "high" : "medium";

      return {
        system: s.name,
        description: `${s.name}: ${s.regulatoryExposure}.`,
        tags,
        level,
        sortKey: severityRank[s.riskTier] || 0
      };
    })
    .sort((a, b) => b.sortKey - a.sortKey)
    .slice(0, 5);
}

// ---------- KPIs ----------

function renderKpis() {
  const total = systems.length;
  const highRisk = systems.filter(
    s => s.riskTier === "High" || s.riskTier === "Very High"
  ).length;
  const aligned = systems.filter(s => s.policyAligned).length;

  const envAvg = average(systems, "envScore");
  const socAvg = average(systems, "socialScore");
  const ecoAvg = average(systems, "economicScore");

  document.getElementById("kpiSystems").textContent = total;
  document.getElementById("kpiHighRisk").textContent = highRisk;
  document.getElementById("kpiAligned").textContent =
    total ? Math.round((aligned / total) * 100) + "%" : "0%";
  document.getElementById("kpiEsEcStatus").textContent =
    classifyEsEcStatus(envAvg, socAvg, ecoAvg);

  const alerts = buildAlertsFromSystems(systems);
  const critical = alerts.filter(a => a.level === "high").length;
  const pill = document.getElementById("criticalPill");
  if (pill) {
    pill.textContent =
      critical > 0
        ? `Critical: ${critical} item${critical > 1 ? "s" : ""} flagged`
        : "Critical: 0 items flagged";
  }
}

// ---------- E–S–Ec aggregate ----------

function renderEsEcIndicators() {
  const envAvg = average(systems, "envScore");
  const socAvg = average(systems, "socialScore");
  const ecoAvg = average(systems, "economicScore");

  document.getElementById("envScoreText").textContent =
    "Carbon & compute: " + formatScore(envAvg);
  document.getElementById("socScoreText").textContent =
    "Fairness & rights: " + formatScore(socAvg);
  document.getElementById("ecoScoreText").textContent =
    "Resilience & value: " + formatScore(ecoAvg);

  document.getElementById("envNote").textContent =
    envAvg > 3.5
      ? "Compute-intensive models approach internal climate thresholds."
      : "Environmental impact moderate; monitor top consumers.";
  document.getElementById("socNote").textContent =
    socAvg < 3
      ? "Fairness and explainability gaps in decision systems."
      : "Social indicators improving; continue targeted assurance.";
  document.getElementById("ecoNote").textContent =
    ecoAvg >= 4
      ? "Strong economic contribution; validate controls keep pace."
      : "Economic benefits positive but uneven.";
}

// ---------- E–S–Ec lens visuals ----------

function getTopSystemsByLens(key, n = 3) {
  return systems
    .slice()
    .sort((a, b) => (b[key] || 0) - (a[key] || 0))
    .slice(0, n);
}

function createLensBarRow({ name, value, color, badgeText }) {
  const row = document.createElement("div");
  row.className = "lens-bar-row";

  const label = document.createElement("div");
  label.className = "lens-bar-label";
  label.innerHTML = `
    <span class="name">${name}</span>
    <span class="badge">${badgeText}</span>
  `;

  const track = document.createElement("div");
  track.className = "lens-bar-track";

  const fill = document.createElement("div");
  fill.className = "lens-bar-fill";

  const width = Math.max(6, (value / 5) * 100);
  fill.style.width = width + "%";
  fill.style.background =
    color === "env"
      ? "linear-gradient(to right, #47d45a, #2e8b57)"
      : color === "soc"
      ? "linear-gradient(to right, #59abf9, #3a7bd5)"
      : "linear-gradient(to right, #facd5a, #f0a700)";

  track.appendChild(fill);
  row.appendChild(label);
  row.appendChild(track);
  return row;
}

function renderEsEcLens(lens = "all") {
  const lensNote = document.getElementById("lensNote");
  const lensBars = document.getElementById("lensBars");
  if (!lensNote || !lensBars) return;

  lensBars.innerHTML = "";

  const envAvg = average(systems, "envScore");
  const socAvg = average(systems, "socialScore");
  const ecoAvg = average(systems, "economicScore");

  if (lens === "all") {
    lensNote.textContent =
      "Aggregate view: does economic value track with climate and social commitments across the AI portfolio?";
    lensBars.appendChild(
      createLensBarRow({
        name: "Environmental",
        value: envAvg,
        color: "env",
        badgeText: `${envAvg.toFixed(1)} / 5`
      })
    );
    lensBars.appendChild(
      createLensBarRow({
        name: "Social",
        value: socAvg,
        color: "soc",
        badgeText: `${socAvg.toFixed(1)} / 5`
      })
    );
    lensBars.appendChild(
      createLensBarRow({
        name: "Economic",
        value: ecoAvg,
        color: "eco",
        badgeText: `${ecoAvg.toFixed(1)} / 5`
      })
    );
    return;
  }

  let key, desc, color;
  if (lens === "env") {
    key = "envScore";
    color = "env";
    desc =
      "Top contributors to compute load and infrastructure impact. Use to challenge climate alignment.";
  } else if (lens === "soc") {
    key = "socialScore";
    color = "soc";
    desc =
      "Systems with greatest impact on people and rights. Focus on fairness, explainability, recourse.";
  } else {
    key = "economicScore";
    color = "eco";
    desc =
      "Systems concentrated for value and dependency. Check resilience and vendor lock-in.";
  }

  lensNote.textContent = desc;

  const top = getTopSystemsByLens(key, 3);
  top.forEach(sys => {
    const badge = `${sys[key].toFixed(1)} / 5 • ${sys.riskTier}${
      sys.policyAligned ? "" : " • policy gap"
    }`;
    lensBars.appendChild(
      createLensBarRow({
        name: sys.name,
        value: sys[key],
        color,
        badgeText: badge
      })
    );
  });
}

function setupEsEcLensInteractions() {
  const pills = document.querySelectorAll(".lens-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      const lens = pill.dataset.lens || "all";
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      renderEsEcLens(lens);
    });
  });
}

// ---------- Scenario Simulator ----------

function updateSimulator() {
  const compute = Number(document.getElementById("simCompute").value);
  const rights = Number(document.getElementById("simRights").value);
  const dep = Number(document.getElementById("simDependency").value);
  const thirdParty = document.getElementById("simThirdParty").checked;
  const policyGap = document.getElementById("simPolicyGap").checked;
  const highImpact = document.getElementById("simHighImpact").checked;

  document.getElementById("simComputeVal").textContent = compute;
  document.getElementById("simRightsVal").textContent = rights;
  document.getElementById("simDependencyVal").textContent = dep;

  let env = compute + (thirdParty ? 0.3 : 0);
  let soc = rights + (policyGap ? 0.4 : 0) + (highImpact ? 0.6 : 0);
  let eco = dep + (thirdParty ? 0.4 : 0);

  env = clampScore(env);
  soc = clampScore(soc);
  eco = clampScore(eco);

  document.getElementById("simEnvScore").textContent = `Env: ${env.toFixed(1)} / 5`;
  document.getElementById("simSocScore").textContent = `Social: ${soc.toFixed(1)} / 5`;
  document.getElementById("simEcoScore").textContent = `Economic: ${eco.toFixed(1)} / 5`;

  document.getElementById("envBar").style.width = `${(env / 5) * 100}%`;
  document.getElementById("socBar").style.width = `${(soc / 5) * 100}%`;
  document.getElementById("ecoBar").style.width = `${(eco / 5) * 100}%`;

  let category;
  if (env >= 4 || soc >= 4 || eco >= 4.5 || (soc >= 3.7 && highImpact)) {
    category = "High-impact / board-level scenario";
  } else if (env >= 3 || soc >= 3 || eco >= 3.5) {
    category = "Material impact – management with board oversight";
  } else {
    category = "Lower-impact – manage within standard controls";
  }

  const regHints = [];
  if (soc >= 4 || highImpact) {
    regHints.push("Potentially in scope of stricter AI / fundamental rights regimes.");
  }
  if (thirdParty) {
    regHints.push("Check contracts, cross-border transfers, and vendor AI obligations.");
  }
  if (policyGap) {
    regHints.push("Policy and control gaps must be closed or explicitly accepted.");
  }
  if (!regHints.length) {
    regHints.push("Within existing policy envelope; continue monitoring.");
  }

  const questions = [];
  if (soc >= 3.5 || highImpact) {
    questions.push("What evidence supports fairness, explainability, and redress?");
  }
  if (env >= 3.5) {
    questions.push("Is compute/emissions consistent with climate targets?");
  }
  if (eco >= 3.5 || thirdParty) {
    questions.push("What is our fallback if this model/provider fails or is withdrawn?");
  }
  if (policyGap) {
    questions.push("Who owns closing the identified gaps and by when?");
  }
  if (!questions.length) {
    questions.push("Is this system registered with a named accountable owner?");
  }

  document.getElementById("simCategory").innerHTML =
    `<strong>Scenario classification:</strong> ${category}`;
  document.getElementById("simRegulatory").innerHTML =
    `<strong>Governance signal:</strong> ${regHints.join(" ")}`;
  document.getElementById("simBoardPrompt").innerHTML =
    `<strong>Board challenge prompts:</strong> ${questions.join(" ")}`;
}

function setupSimulator() {
  const ids = [
    "simCompute",
    "simRights",
    "simDependency",
    "simThirdParty",
    "simPolicyGap",
    "simHighImpact"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const evt = el.type === "range" ? "input" : "change";
    el.addEventListener(evt, updateSimulator);
  });

  updateSimulator();
}

// ---------- Alerts ----------

function renderAlerts() {
  const container = document.getElementById("alertList");
  if (!container) return;
  container.innerHTML = "";

  const alerts = buildAlertsFromSystems(systems);
  alerts.forEach(alert => {
    const item = document.createElement("div");
    item.className = `alert-item ${alert.level}`;
    item.innerHTML = `
      <div class="alert-left">
        <div class="alert-title">${alert.system}</div>
        <div class="alert-meta">${alert.description}</div>
        <div class="alert-tags">
          ${alert.tags.map(t => `<span class="alert-pill-tag">${t}</span>`).join("")}
        </div>
      </div>
      <div class="alert-arrow">›</div>
    `;
    container.appendChild(item);
  });
}

// ---------- Inventory ----------

function populateInventoryFilters() {
  const ownerSelect = document.getElementById("filterOwner");
  if (!ownerSelect) return;
  const owners = [...new Set(systems.map(s => s.owner))].sort();
  owners.forEach(o => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = `Owner: ${o}`;
    ownerSelect.appendChild(opt);
  });
}

function applyInventoryFilters(system, search, risk, owner, policy) {
  if (risk && system.riskTier !== risk) return false;
  if (owner && system.owner !== owner) return false;
  if (policy === "aligned" && !system.policyAligned) return false;
  if (policy === "gap" && system.policyAligned) return false;

  if (search) {
    const text = (
      system.name +
      " " +
      system.owner +
      " " +
      system.category +
      " " +
      system.regulatoryExposure +
      " " +
      (system.flags || []).join(" ")
    ).toLowerCase();
    if (!text.includes(search.toLowerCase())) return false;
  }
  return true;
}

function esecDotState(sys) {
  return {
    envActive: sys.envScore >= 3,
    socActive: sys.socialScore >= 3,
    ecoActive: sys.economicScore >= 3.5
  };
}

function riskClass(tier) {
  if (tier === "Very High") return "inv-risk-very-high";
  if (tier === "High") return "inv-risk-high";
  if (tier === "Medium") return "inv-risk-medium";
  return "inv-risk-low";
}

function renderInventoryTable() {
  const body = document.getElementById("inventoryTableBody");
  const summary = document.getElementById("inventorySummary");
  if (!body || !summary) return;

  const search = document.getElementById("inventorySearch").value.trim();
  const risk = document.getElementById("filterRisk").value;
  const owner = document.getElementById("filterOwner").value;
  const policy = document.getElementById("filterPolicy").value;

  const filtered = systems.filter(s =>
    applyInventoryFilters(s, search, risk, owner, policy)
  );

  body.innerHTML = "";

  filtered.forEach(sys => {
    const { envActive, socActive, ecoActive } = esecDotState(sys);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="inv-name">${sys.name}</td>
      <td class="inv-owner">${sys.owner}</td>
      <td class="inv-cat">${sys.category}</td>
      <td><span class="inv-risk-pill ${riskClass(sys.riskTier)}">${sys.riskTier}</span></td>
      <td class="inv-reg">
        ${sys.regulatoryExposure}
        ${
          sys.flags && sys.flags.length
            ? `<div class="inv-flags">Flags: ${sys.flags.join(", ")}</div>`
            : ""
        }
      </td>
      <td>
        <div class="inv-esec-dots" title="Env ${sys.envScore.toFixed(
          1
        )}, Soc ${sys.socialScore.toFixed(1)}, Ec ${sys.economicScore.toFixed(1)}">
          <span class="inv-esec-dot env ${envActive ? "active" : ""}"></span>
          <span class="inv-esec-dot soc ${socActive ? "active" : ""}"></span>
          <span class="inv-esec-dot eco ${ecoActive ? "active" : ""}"></span>
        </div>
      </td>
      <td>
        <span class="inv-policy-pill ${
          sys.policyAligned ? "inv-policy-yes" : "inv-policy-no"
        }">${sys.policyAligned ? "Aligned" : "Gap"}</span>
      </td>
    `;
    body.appendChild(tr);
  });

  const total = systems.length;
  const gaps = systems.filter(s => !s.policyAligned).length;
  const high = systems.filter(
    s => s.riskTier === "High" || s.riskTier === "Very High"
  ).length;

  summary.textContent =
    filtered.length === total && !search && !risk && !owner && !policy
      ? `Showing all ${total} systems. ${high} high/very high risk; ${gaps} with policy gaps.`
      : `Showing ${filtered.length} of ${total} systems for current filters.`;
}

function setupInventoryFilters() {
  ["inventorySearch", "filterRisk", "filterOwner", "filterPolicy"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const evt = el.tagName === "INPUT" ? "input" : "change";
    el.addEventListener(evt, renderInventoryTable);
  });
}

// ---------- Educational Mode: dynamic guided tour ----------

const eduSteps = [
  {
    key: "kpi",
    targetId: "kpiCard",
    label: "Start with coverage",
    title: "Board snapshot: what is in scope?",
    text:
      "This tile answers the first board question: do we know which AI systems exist, which are high-risk, and how many are aligned to policy?",
    example: () => {
      const total = systems.length;
      const high = systems.filter(
        s => s.riskTier === "High" || s.riskTier === "Very High"
      ).length;
      const gaps = systems.filter(s => !s.policyAligned).length;
      return `In this example, the organisation has ${total} AI systems, ${high} of which are high/very high risk and ${gaps} still show policy or control gaps. A director should ask: “Can I see named owners and evidence for each of these?”`;
    }
  },
  {
    key: "esec",
    targetId: "esecCard",
    label: "Read impact, not just volume",
    title: "E–S–Ec lens: how is value balanced?",
    text:
      "This tile translates technical metrics into environmental, social and economic signals that sit alongside ESG and risk responsibilities.",
    example: () => {
      const credit = systems.find(s => s.name.includes("Credit Scoring"));
      if (!credit) {
        return "Use a high-dependency decision system as a worked example to test whether economic benefits justify the environmental and social footprint.";
      }
      return `Example: The ${credit.name} scores strongly on economic value but carries fairness and DPIA gaps. Educational Mode uses this to show how a profitable system can still create rights and compliance exposure.`;
    }
  },
  {
    key: "risk",
    targetId: "riskControlsCard",
    label: "Connect to controls",
    title: "Risk & Controls: where are we thin?",
    text:
      "Here you see AI mapped to governance domains and frameworks. Residual risk and status show whether controls keep pace with AI use.",
    example: () => {
      const ethics = riskDomains.find(d =>
        d.name.startsWith("Ethics & Responsible AI")
      );
      if (!ethics) {
        return "Pick any domain marked High or Critical to show how missing controls relate directly to specific AI systems.";
      }
      return `In this view, “${ethics.name}” is a Gap at ${ethics.residualRisk.toFixed(
        1
      )}/5. That tells the board: high-impact systems (Credit Scoring, HR Screening) are running ahead of ethics governance and need timebound remediation.`;
    }
  },
  {
    key: "inventory",
    targetId: "inventoryCard",
    label: "Traceability",
    title: "Inventory: link red flags to systems",
    text:
      "The inventory is the evidence base behind all summary tiles. It should take seconds to go from a red KPI to a system, owner and controls.",
    example: () => {
      return `Try filtering for “Very High” or “High” risk and owner “Risk” or “HR”. A good register lets a director click from a flagged metric to the underlying system and its accountable owner without guesswork.`;
    }
  },
  {
    key: "alerts",
    targetId: "alertsCard",
    label: "Prioritise challenge",
    title: "Alerts: focus the agenda",
    text:
      "Alerts condense the dataset into a small set of items that deserve airtime in the next committee or board meeting.",
    example: () => {
      const alerts = buildAlertsFromSystems(systems);
      if (!alerts.length) {
        return "If no alerts appear, it either reflects a strong posture or thresholds that may be too generous. Both are worth testing.";
      }
      const top = alerts[0];
      return `Example: “${top.system}” appears with tags like ${top.tags
        .slice(0, 3)
        .join(", ")}. That is a ready-made agenda item: ask for testing evidence, DPIA status and remediation dates before further scale-up.`;
    }
  }
];

let currentEduStep = 0;

function clearEduFocus() {
  document.querySelectorAll(".edu-focus").forEach(el => {
    el.classList.remove("edu-focus");
  });
}

function renderEducationalContent() {
  const box = document.getElementById("eduContent");
  if (!box) return;

  box.innerHTML = `
    <div class="edu-steps-header">Guided explanation</div>
    <div class="edu-step-label" id="eduStepLabel"></div>
    <div class="edu-step-title" id="eduStepTitle"></div>
    <div class="edu-step-text" id="eduStepText"></div>
    <div class="edu-step-example" id="eduStepExample"></div>
    <div class="edu-step-actions">
      <button class="edu-step-btn" id="eduPrevStep">◀ Prev</button>
      <div class="edu-step-progress" id="eduStepProgress"></div>
      <button class="edu-step-btn primary" id="eduNextStep">Next ▶</button>
    </div>
  `;
}

function applyEduStep(index) {
  const dashboard = document.querySelector(".dashboard");
  const step = eduSteps[index];
  if (!dashboard || !step) return;

  currentEduStep = index;

  const labelEl = document.getElementById("eduStepLabel");
  const titleEl = document.getElementById("eduStepTitle");
  const textEl = document.getElementById("eduStepText");
  const exEl = document.getElementById("eduStepExample");
  const progEl = document.getElementById("eduStepProgress");

  if (!labelEl || !titleEl || !textEl || !exEl || !progEl) return;

  labelEl.textContent = step.label;
  titleEl.textContent = step.title;
  textEl.textContent = step.text;
  exEl.innerHTML = `
    <div class="edu-example-label">Learning example</div>
    <div>${step.example()}</div>
    <div>
      <a data-target="${step.targetId}" class="edu-jump-link">Jump to panel in dashboard</a>
    </div>
  `;
  progEl.textContent = `Step ${index + 1} of ${eduSteps.length}`;

  clearEduFocus();
  const target = document.getElementById(step.targetId);
  if (target) {
    target.classList.add("edu-focus");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const jump = exEl.querySelector(".edu-jump-link");
  if (jump && target) {
    jump.onclick = () => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    };
  }
}

function setupEduStepButtons() {
  const prev = document.getElementById("eduPrevStep");
  const next = document.getElementById("eduNextStep");
  if (!prev || !next) return;

  prev.addEventListener("click", () => {
    const idx = currentEduStep - 1 >= 0
      ? currentEduStep - 1
      : eduSteps.length - 1;
    applyEduStep(idx);
  });

  next.addEventListener("click", () => {
    const idx = currentEduStep + 1 < eduSteps.length
      ? currentEduStep + 1
      : 0;
    applyEduStep(idx);
  });
}

function setupEducationalToggle() {
  const btn = document.getElementById("eduToggle");
  const dashboard = document.querySelector(".dashboard");
  const content = document.getElementById("eduContent");
  if (!btn || !dashboard || !content) return;

  btn.addEventListener("click", () => {
    const on = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", String(on));
    btn.classList.toggle("active", on);
    dashboard.classList.toggle("edu-on", on);
    content.style.display = on ? "block" : "none";

    if (on) {
      applyEduStep(0);
      setupEduStepButtons();
    } else {
      clearEduFocus();
    }
  });
}

// ---------- Narrative ----------

function renderNarrative() {
  const highRisk = systems.filter(
    s => s.riskTier === "High" || s.riskTier === "Very High"
  );
  const misaligned = systems.filter(s => !s.policyAligned);

  const envAvg = average(systems, "envScore");
  const socAvg = average(systems, "socialScore");
  const ecoAvg = average(systems, "economicScore");

  const criticalDomains = riskDomains.filter(
    rd => classifyResidualLevel(rd.residualRisk) === "Critical"
  );
  const highDomains = riskDomains.filter(
    rd => classifyResidualLevel(rd.residualRisk) === "High"
  );

  const obsEl = document.getElementById("narrativeObservation");
  const impEl = document.getElementById("narrativeImplication");
  const actEl = document.getElementById("narrativeAction");
  if (!obsEl || !impEl || !actEl) return;

  const obs = [
    `The register covers ${systems.length} AI systems, with ${highRisk.length} classified as high or very high risk.`,
    `Policy alignment is at ${Math.round(
      (systems.filter(s => s.policyAligned).length / systems.length) * 100
    )}%.`,
    `E–S–Ec averages: Env ${envAvg.toFixed(
      1
    )}, Soc ${socAvg.toFixed(1)}, Ec ${ecoAvg.toFixed(1)}.`
  ].join(" ");

  const implications = [];

  if (criticalDomains.length || highDomains.length) {
    const names = [...criticalDomains, ...highDomains]
      .map(d => d.name)
      .slice(0, 3)
      .join(", ");
    implications.push(
      `Control stress is concentrated in ${names}, which underpins multiple high-risk AI systems.`
    );
  }

  if (socAvg < 3 && highRisk.length) {
    implications.push(
      "Fairness and transparency weaknesses in key decision systems could invite regulatory challenge or customer harm."
    );
  }

  if (envAvg > 3.5) {
    implications.push(
      "Compute usage for some models is approaching internal climate and sustainability expectations."
    );
  }

  if (misaligned.length) {
    implications.push(
      "Several strategically important systems operate with policy or control gaps that need timebound remediation."
    );
  }

  if (!implications.length) {
    implications.push(
      "Current posture is stable but relies on disciplined testing, documentation, and vendor oversight."
    );
  }

  const priorityDomains =
    [...criticalDomains, ...highDomains].map(d => d.name).slice(0, 3).join(", ") ||
    "the highest risk domains";

  const actions = [
    `Request detailed remediation plans for ${priorityDomains}, linked to specific AI systems (e.g. Credit Scoring, HR Screening, Vendor LLM).`,
    "Mandate E–S–Ec reporting and AI Act alignment checks for all high-risk uses before scale-up or renewal.",
    "Use the E–S–Ec simulator and Risk & Controls panel in the next board session to test scenarios against risk appetite."
  ];

  obsEl.innerHTML =
    `<span class="narrative-highlight">Observation.</span> ${obs}`;
  impEl.innerHTML =
    `<span class="narrative-highlight">Implication.</span> ${implications.join(" ")}`;
  actEl.innerHTML =
    `<span class="narrative-highlight">Prompt for action.</span> ${actions.join(" ")}`;
}

// ---------- Risk & Controls rendering ----------

function renderRiskControls() {
  const list = document.getElementById("riskList");
  const summary = document.getElementById("riskSummaryText");
  if (!list || !summary) return;

  const highOnly = document.getElementById("riskHighOnly").checked;
  const frameworkFilter = document.getElementById("riskFrameworkFilter").value;
  const esecFilter = document.getElementById("riskEsEcFilter").value;

  list.innerHTML = "";

  const filtered = riskDomains.filter(d => {
    const residualLevel = classifyResidualLevel(d.residualRisk);
    if (highOnly && !(residualLevel === "High" || residualLevel === "Critical")) {
      return false;
    }
    if (frameworkFilter && !d.frameworks.some(f => f.includes(frameworkFilter))) {
      return false;
    }
    if (esecFilter && !d.esec.includes(esecFilter)) {
      return false;
    }
    return true;
  });

  filtered.forEach(d => {
    const residualLevel = classifyResidualLevel(d.residualRisk);
    const domainEl = document.createElement("div");
    domainEl.className =
      "risk-domain " +
      (residualLevel === "Critical"
        ? "critical"
        : residualLevel === "High"
        ? "high"
        : "");

    const statusClass =
      d.status === "Aligned"
        ? "aligned"
        : d.status === "Gap"
        ? "gap"
        : "partial";

    const esecTags = d.esec
      .map(tag => {
        const cls =
          tag === "Env"
            ? "env"
            : tag === "Social"
            ? "soc"
            : "eco";
        return `<span class="risk-tag ${cls}">${tag}</span>`;
      })
      .join("");

    const frameworks = d.frameworks
      .map(f => `<span class="risk-tag">${f}</span>`)
      .join("");

    domainEl.innerHTML = `
      <div class="risk-header">
        <div class="risk-title-block">
          <div class="risk-title">${d.name}</div>
          <div class="risk-subtitle">${d.subtitle}</div>
          <div class="risk-tags">
            ${esecTags}
            ${frameworks}
          </div>
        </div>
        <div class="risk-metrics">
          <div class="risk-status-pill ${statusClass}">
            ${d.status}
          </div>
          <div>Residual: ${d.residualRisk.toFixed(1)} / 5 (${residualLevel})</div>
        </div>
      </div>

      <div class="risk-bar-row">
        <div class="risk-bar-label">Inherent</div>
        <div class="risk-bar">
          <div class="risk-bar-fill inherent" style="width:${(d.inherentRisk / 5) *
            100}%"></div>
        </div>
        <div>${d.inherentRisk.toFixed(1)}</div>
      </div>

      <div class="risk-bar-row">
        <div class="risk-bar-label">Maturity</div>
        <div class="risk-bar">
          <div class="risk-bar-fill maturity" style="width:${(d.controlMaturity / 5) *
            100}%"></div>
        </div>
        <div>${d.controlMaturity.toFixed(1)}</div>
      </div>

      <div class="risk-bar-row">
        <div class="risk-bar-label">Residual</div>
        <div class="risk-bar">
          <div class="risk-bar-fill residual ${residualLevel.toLowerCase()}" style="width:${(d.residualRisk / 5) *
            100}%"></div>
        </div>
        <div>${d.residualRisk.toFixed(1)}</div>
      </div>

      <div class="risk-details">
        <div class="risk-details-title">Key controls in place</div>
        <ul>
          ${d.keyControls.map(c => `<li>${c}</li>`).join("")}
        </ul>
        <div class="risk-details-title">Key gaps / exposures</div>
        <ul>
          ${d.keyGaps.map(g => `<li>${g}</li>`).join("")}
        </ul>
        <div><strong>Accountable owner:</strong> ${d.owner}</div>
        <div><strong>Board focus:</strong> ${
          residualLevel === "Critical"
            ? "Immediate oversight and evidence of corrective actions."
            : residualLevel === "High"
            ? "Timebound remediation and regular status updates."
            : "Monitor as part of standard reporting."
        }</div>
      </div>
    `;

    domainEl.addEventListener("click", () => {
      domainEl.classList.toggle("open");
    });

    list.appendChild(domainEl);
  });

  const avgResidual =
    filtered.reduce((sum, d) => sum + d.residualRisk, 0) /
    (filtered.length || 1);
  const critCount = filtered.filter(
    d => classifyResidualLevel(d.residualRisk) === "Critical"
  ).length;
  const highCount = filtered.filter(
    d => classifyResidualLevel(d.residualRisk) === "High"
  ).length;

  summary.textContent =
    `Showing ${filtered.length} of ${riskDomains.length} domains. ` +
    `Average residual risk: ${avgResidual.toFixed(1)} / 5. ` +
    `${critCount} Critical and ${highCount} High domain(s) require clear ownership and tracked remediation.`;
}

function setupRiskControlsFilters() {
  const highOnly = document.getElementById("riskHighOnly");
  const fw = document.getElementById("riskFrameworkFilter");
  const es = document.getElementById("riskEsEcFilter");

  [highOnly, fw, es].forEach(el => {
    if (!el) return;
    el.addEventListener("change", renderRiskControls);
  });
}

// ---------- Navigation ----------

function setupNav() {
  const items = document.querySelectorAll(".nav-item");
  const dashboard = document.querySelector(".dashboard");

  items.forEach(item => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;

      const isInventory = dashboard.classList.contains("inventory-only");
      const isEsEc = dashboard.classList.contains("esec-only");
      const isRisk = dashboard.classList.contains("risk-only");

      if (section === "inventory") {
        const turnOn = !isInventory;
        dashboard.classList.remove("esec-only", "risk-only");
        items.forEach(i => i.classList.remove("active"));

        if (turnOn) {
          dashboard.classList.add("inventory-only");
          item.classList.add("active");
          document
            .getElementById("inventoryCard")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          dashboard.classList.remove("inventory-only");
          document
            .querySelector('.nav-item[data-section="overview"]')
            ?.classList.add("active");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (section === "esec") {
        const turnOn = !isEsEc;
        dashboard.classList.remove("inventory-only", "risk-only");
        items.forEach(i => i.classList.remove("active"));

        if (turnOn) {
          dashboard.classList.add("esec-only");
          item.classList.add("active");
          document
            .getElementById("esecCard")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          dashboard.classList.remove("esec-only");
          document
            .querySelector('.nav-item[data-section="overview"]')
            ?.classList.add("active");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (section === "risk") {
        const turnOn = !isRisk;
        dashboard.classList.remove("inventory-only", "esec-only");
        items.forEach(i => i.classList.remove("active"));

        if (turnOn) {
          dashboard.classList.add("risk-only");
          item.classList.add("active");
          document
            .getElementById("riskControlsCard")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          dashboard.classList.remove("risk-only");
          document
            .querySelector('.nav-item[data-section="overview"]')
            ?.classList.add("active");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      // Overview / learning / reports
      dashboard.classList.remove("inventory-only", "esec-only", "risk-only");
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      if (section === "overview") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (section === "learning") {
        document
          .getElementById("eduCard")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (section === "reports") {
        document
          .getElementById("narrativeCard")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ---------- Init ----------

document.addEventListener("DOMContentLoaded", () => {
  renderDate();
  renderKpis();
  renderEsEcIndicators();
  renderEsEcLens("all");
  setupEsEcLensInteractions();
  setupSimulator();
  renderAlerts();
  populateInventoryFilters();
  setupInventoryFilters();
  renderInventoryTable();
  renderEducationalContent();
  setupEducationalToggle();
  renderRiskControls();
  setupRiskControlsFilters();
  renderNarrative();
  setupNav();
});
