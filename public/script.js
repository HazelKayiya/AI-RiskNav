/* app-core.js (UPDATED)
   - Navigation + date/ footer
   - Calls module init functions when a view is shown
*/
(() => {
  'use strict';

  let currentView = 'overview';

  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
  });

  function initializeApp() {
    setCurrentDate();

    const fy = document.getElementById('footerYear');
    if (fy) fy.textContent = String(new Date().getFullYear());

    updateFooterNavigation('overview');
    updateHeaderNavigation('overview');
    showView('overview');
  }

  // Header click
  window.resetToHome = function resetToHome() {
    showView('overview');
  };

  function setCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-GB', options);
    const dateEl = document.getElementById('currentDate');
    if (dateEl) dateEl.textContent = dateString;
  }

  function updateHeaderNavigation(currentPage) {
    const navButtons = document.querySelectorAll('.primary-nav .nav-btn');
    if (!navButtons.length) return;

    navButtons.forEach(btn => {
      const view = btn.getAttribute('data-view');
      const isActive = view === currentPage;
      if (isActive) {
        btn.setAttribute('aria-current', 'page');
        btn.classList.add('nav-btn-active');
      } else {
        btn.removeAttribute('aria-current');
        btn.classList.remove('nav-btn-active');
      }
    });

    const status = document.getElementById('appStatus');
    if (status) {
      const labelMap = {
        overview: 'Overview',
        inventory: 'AI Inventory',
        esec: 'E–S–Ec Lens',
        risk: 'Risk & Controls',
        education: 'Education'
      };
      status.textContent = `Viewing: ${labelMap[currentPage] || 'Overview'}`;
    }
  }

  // View switching
  window.showView = function showView(viewName) {
    currentView = viewName;

    document.querySelectorAll('.view-content').forEach(v => v.classList.add('view-hidden'));
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.remove('view-hidden');

    updateFooterNavigation(viewName);
    updateHeaderNavigation(viewName);

    // Ensure E–S–Ec Lens V3 is mounted in the iframe (keeps V3 look/behaviour isolated)
    function ensureESEcLensV3Iframe() {
      const iframe = document.getElementById('esec-v3-iframe');
      if (!iframe) return;
      if (iframe.dataset.ready === '1') return;
      const tpl = document.getElementById('esec-v3-srcdoc');
      if (!tpl) return;
      iframe.setAttribute('title', 'E–S–Ec Lens – Portfolio Oversight View');
      iframe.srcdoc = tpl.textContent || '';
      iframe.dataset.ready = '1';
    }

    if (viewName === 'esec') {
      ensureESEcLensV3Iframe();
    }

    // Call module init (once per module)
    const AIR = window.AIRiskNav;
    if (AIR && AIR.modules) {
      if (viewName === 'overview' && typeof AIR.modules.initOverview === 'function') AIR.modules.initOverview();
      if (viewName === 'inventory' && typeof AIR.modules.initInventory === 'function') AIR.modules.initInventory();      if (viewName === 'esec' && typeof AIR.modules.initESEc === 'function') { /* Lens runs in iframe */ }
      if (viewName === 'risk' && typeof AIR.modules.initRisk === 'function') AIR.modules.initRisk();
      if (viewName === 'education' && typeof AIR.modules.initEducation === 'function') AIR.modules.initEducation();
    }

    window.scrollTo(0, 0);
  };

  function updateFooterNavigation(currentPage) {
    const footerNav = document.getElementById('footer-nav');
    if (!footerNav) return;

    const navConfig = {
      overview: [
        { label: 'AI Inventory', view: 'inventory' },
        { label: 'E-S-Ec Lens', view: 'esec' },
        { label: 'Risk & Controls', view: 'risk' },
        { label: 'Education', view: 'education' }
      ],
      inventory: [
        { label: 'Portfolio Overview', view: 'overview' },
        { label: 'E-S-Ec Lens', view: 'esec' },
        { label: 'Risk & Controls', view: 'risk' },
        { label: 'Education', view: 'education' }
      ],
      esec: [
        { label: 'Portfolio Overview', view: 'overview' },
        { label: 'AI Inventory', view: 'inventory' },
        { label: 'Risk & Controls', view: 'risk' },
        { label: 'Education', view: 'education' }
      ],
      risk: [
        { label: 'Portfolio Overview', view: 'overview' },
        { label: 'AI Inventory', view: 'inventory' },
        { label: 'E-S-Ec Lens', view: 'esec' },
        { label: 'Education', view: 'education' }
      ],
      education: [
        { label: 'Portfolio Overview', view: 'overview' },
        { label: 'AI Inventory', view: 'inventory' },
        { label: 'E-S-Ec Lens', view: 'esec' },
        { label: 'Risk & Controls', view: 'risk' }
      ]
    };

    const buttons = navConfig[currentPage] || navConfig.overview;
    footerNav.innerHTML = buttons
      .map(btn => `<button class="footer-nav-btn" type="button" onclick="showView('${btn.view}')">${btn.label}</button>`)
      .join('');
  }
})();
/* portfolio-data.js (UPDATED)
   - Keeps your wedgeData/defaultSnapshot content
   - Avoids global collisions
   - Updates Overview stats + gauges from AIRiskNav.data.aiInventory
   - Exposes toggleQuadrant/resetQuadrants for inline onclick handlers
*/
(() => {
  'use strict';

  window.AIRiskNav = window.AIRiskNav || { data: {}, modules: {}, state: {} };
  const AIR = window.AIRiskNav;

  // ---- Data (unchanged) ----
  const wedgeData = {
  attention: {
    kicker: "⚠️ Attention",
    title: "AI systems needing Board attention",
    text: "Four AI systems sit in the 'Board attention' zone because they directly affect access to credit, work or key suppliers and are classified as high-impact under the EU AI Act and internal risk criteria.",
    esec: ["Social", "Economic"],
    metrics: [
      { label: "Systems flagged", value: "4" },
      { label: "High-risk (EU AI Act)", value: "3" },
      { label: "In pilot / redesign", value: "2" },
      { label: "Retired but still influential", value: "1" }
    ],
    bullets: [
      "Credit Scoring Engine (AI-001), Fraud Anomaly Detector (AI-003) and HR Candidate Screening (AI-004) all change real outcomes for customers or job applicants, so social and economic harms must be explicitly modelled and stress-tested for vulnerable groups.",
      "Supplier ESG Risk Scoring (AI-009) feeds directly into procurement and IFRS S2 climate disclosures; the Board should ask whether the underlying data and scoring logic are explainable to non-technical stakeholders.",
      "Legacy Collections Dialler (AI-010) was retired after fairness concerns but is still used as a 'learning case' in training; the Board should understand what went wrong, what data is retained for audit and how those lessons influence the design of new systems.",
      "Key Board prompts: Which high-risk systems are registered under the EU AI Act, governed through an AI management system (ISO/IEC 42001) and reviewed against NIST AI RMF / ISO 31000 so that social impacts, bias and appeal routes are visible at Board level?"
    ]
  },

  pipeline: {
    kicker: "📊 Pipeline",
    title: "Pipeline from assessment to retirement",
    text: "The pipeline view links the systems lifecycle to governance: which AI systems are under assessment, which are moving into pilot or production, and whether retirements are being handled in a GDPR-compliant and E–S–Ec-aware way.",
    esec: ["Environmental", "Social", "Economic"],
    metrics: [
      { label: "Under assessment", value: "2 (AI-008, new GenAI use case)" },
      { label: "In pilot", value: "2 (AI-004, AI-007)" },
      { label: "In production", value: "6" },
      { label: "Retired in last 12m", value: "1 (AI-010)" }
    ],
    bullets: [
      "Under assessment: Document Classification Assistant (AI-008) and a proposed GenAI summarisation tool both handle confidential documents; the Board should ask whether DPIAs and records-management policies are built into the design before pilots start.",
      "Pilots: HR Candidate Screening (AI-004) and Energy Optimisation (AI-007) must pass fairness, safety and resilience gates; bottlenecks here often reveal thin assurance capacity (e.g. one over-stretched data protection officer or model risk team).",
      "Retirement of AI-010 should demonstrate 'good off-boarding practice': data minimisation under GDPR, clear retention schedules, removal from live decision flows and documentation of how the retirement reshapes the E–S–Ec risk profile.",
      "Board actions: challenge whether pipeline priorities reflect strategy (financial inclusion, net-zero, workforce equity) rather than only quick efficiency wins, and ask how ISO/IEC 42001 and EU AI Act lifecycle obligations are embedded at each gate."
    ]
  },

  incidents: {
    kicker: "🚨 Incidents",
    title: "Incidents and near misses",
    text: "This view connects incidents and near misses back to specific systems, lenses and controls so the Board can see how well lessons are feeding into testing, data governance and the Risk & Controls dashboard.",
    esec: ["Environmental", "Social", "Economic"],
    metrics: [
      { label: "Major incidents (12m)", value: "1 (social / economic)" },
      { label: "Moderate incidents", value: "2" },
      { label: "Near misses logged", value: "5" },
      { label: "Open corrective actions", value: "3" }
    ],
    bullets: [
      "Example major incident: a configuration issue in the Fraud Detector (AI-003) generated a spike in false positives for customers in flood-prone regions, combining economic harm (blocked transactions) with social harm (disproportionate impact on lower-income communities).",
      "Example moderate incident: the Marketing Propensity Model (AI-005) over-targeted a high-carbon product line, raising questions about alignment with climate commitments and IFRS S2 climate-related disclosures.",
      "Example near miss: fairness testing on the HR Screening pilot (AI-004) detected significantly lower pass-through rates for disabled candidates before go-live. Deployment was paused, the model was re-trained and the case logged as a 'hot lesson' in the learning mode.",
      "Board prompts: Are incident themes clearly linked to controls (access, data quality, human-in-the-loop), have any deployments been paused due to rising near-miss trends, and do outcomes from the incident log feed back into model validation, training content and the E–S–Ec lens?"
    ],
    link: "https://codepen.io/Hazel-Kayiya/pen/EaKrpRZ"
  },

  radar: {
    kicker: "📋 Regulatory radar",
    title: "Regulation and standards",
    text: "The regulatory radar summarises recent changes in AI, data and sustainability rules so the Board can see where the portfolio may need design changes, new controls or enhanced disclosures.",
    esec: ["Environmental", "Social", "Economic"],
    metrics: [
      { label: "AI-specific regimes", value: "EU AI Act (Reg. 2024/1689)" },
      { label: "ESG & climate", value: "IFRS S2 effective 2024" },
      { label: "AI governance std", value: "ISO/IEC 42001:2023" },
      { label: "Data protection focus", value: "GDPR / ICO AI guidance" }
    ],
    bullets: [
      "EU AI Act: high-risk systems such as credit scoring, fraud monitoring and HR screening must have a documented risk-management system, be registered in an EU database and meet transparency and human-oversight requirements across the lifecycle.",
      "IFRS S2: climate-related disclosure rules (effective for periods beginning 2024) require boards to describe governance, strategy, risk management and metrics/targets for climate risk, including how AI-enabled tools shape scenario analysis and financed emissions.",
      "ISO/IEC 42001:2023 introduces an AI Management System standard; Boards can ask whether their organisation is aligning to it so that responsibilities, policies and controls for AI risk are integrated with existing ISO 27001 / enterprise risk processes.",
      "Supervisory focus: European DPAs and the UK ICO have issued guidance and consultations on Generative AI, training data and behavioural advertising; Boards should ask when the next 'horizon scan' of AI + data + ESG regulation is due and how findings will be reflected in the risk dashboard."
    ]
  }
};
  const defaultSnapshot = {
  kicker: "Portfolio snapshot",
  title: "Your AI portfolio at a glance",
  text: "This overview highlights AI systems that need Board attention, tracks implementation progress, and surfaces incidents and regulatory changes through an Environmental–Social–Economic (E–S–Ec) lens.",
  esec: ["Environmental", "Social", "Economic"],
  metrics: [
    { label: "Total AI systems", value: "10" },
    { label: "In production", value: "6" },
    { label: "High-risk (EU AI Act)", value: "4" },
    { label: "Retired / legacy", value: "1" }
  ],
  bullets: [
    "The portfolio spans internal optimisation tools, customer-facing models and high-impact decision engines such as credit scoring, fraud detection and HR screening.",
    "The overview concentrates on what requires Board attention now: which systems are high-risk, which are moving through the pipeline, and where incidents or near misses are emerging.",
    "The E–S–Ec lens provides a balanced view of environmental, social and economic implications so that financial, conduct and sustainability risks can be discussed in one place.",
    "Use the tiles below to drill into system-level detail (AI Inventory), aggregate E–S–Ec patterns (Lens), scenario-based learning (Scenario & Learning Mode) and control themes (Risk & Controls)."
  ]
};

  AIR.data.wedgeData = wedgeData;
  AIR.data.defaultSnapshot = defaultSnapshot;

  // ---- Helpers ----
  function safeText(el, value) { if (el) el.textContent = value; }

  function setGaugeStroke(circleEl, score100) {
    if (!circleEl) return;
    const total = 352;
    const dash = Math.round((Math.max(0, Math.min(100, score100)) / 100) * total);
    circleEl.setAttribute('stroke-dasharray', `${dash} ${total}`);
  }

  function computeAverages(inv) {
    if (!Array.isArray(inv) || !inv.length) return { env: 0, soc: 0, eco: 0 };
    const n = inv.length;
    const sum = inv.reduce((acc, x) => {
      acc.env += (Number(x.envScore) || 0);
      acc.soc += (Number(x.socialScore) || 0);
      acc.eco += (Number(x.economicScore) || 0);
      return acc;
    }, { env: 0, soc: 0, eco: 0 });
    return { env: sum.env / n, soc: sum.soc / n, eco: sum.eco / n };
  }

  // ---- Quadrant UI ----
  let activeQuadrant = null;

  function renderQuadrantContent(data) {
    let html = '';
    html += `<div class="quadrant-kicker">${data.kicker}</div>`;
    html += `<h3 class="quadrant-title">${data.title}</h3>`;
    html += `<p class="quadrant-text">${data.text}</p>`;

    if (data.esec && data.esec.length > 0) {
      html += '<div class="quadrant-esec">';
      data.esec.forEach(dim => {
        const badgeClass = dim === 'Environmental' ? 'esec-badge-env' :
                          dim === 'Social' ? 'esec-badge-soc' : 'esec-badge-eco';
        html += `<span class="esec-badge ${badgeClass}">${dim}</span>`;
      });
      html += '</div>';
    }

    if (data.metrics && data.metrics.length > 0) {
      html += '<div class="quadrant-metrics">';
      data.metrics.forEach(metric => {
        html += `
          <div class="metric-item">
            <div class="metric-label">${metric.label}</div>
            <div class="metric-value">${metric.value}</div>
          </div>
        `;
      });
      html += '</div>';
    }

    if (data.bullets && data.bullets.length > 0) {
      html += '<ul class="quadrant-bullets">';
      data.bullets.forEach(bullet => {
        html += `<li>${bullet}</li>`;
      });
      html += '</ul>';
    }

    if (data.link) {
      html += `<p style="margin-top: 1rem;"><a href="${data.link}" target="_blank" rel="noopener" style="color: var(--blue-700); text-decoration: underline;">View detailed incident analysis →</a></p>`;
    }

    return html;
  }

  function resetQuadrants() {
    activeQuadrant = null;
    const contentPanel = document.getElementById('quadrant-content');
    const buttons = document.querySelectorAll('.quadrant-btn');

    buttons.forEach(btn => btn.classList.remove('active'));

    if (contentPanel) {
      contentPanel.classList.remove('active');
      contentPanel.innerHTML = '';
    }
  }

  function toggleQuadrant(quadrantName) {
    const contentPanel = document.getElementById('quadrant-content');
    const buttons = document.querySelectorAll('.quadrant-btn');

    if (activeQuadrant === quadrantName) {
      resetQuadrants();
      return;
    }

    activeQuadrant = quadrantName;

    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.quadrant === quadrantName);
    });

    const data = wedgeData[quadrantName] || defaultSnapshot;
    if (contentPanel) {
      contentPanel.innerHTML = renderQuadrantContent(data);
      contentPanel.classList.add('active');
    }
  }

  // Needed because index.html uses inline onclick="toggleQuadrant(...)"
  window.toggleQuadrant = toggleQuadrant;
  window.resetQuadrants = resetQuadrants;

  function initOverview() {
    const root = document.getElementById('view-overview');
    if (!root) return;
    if (AIR.state.overviewReady) return;
    AIR.state.overviewReady = true;

    const inv = AIR.data.aiInventory || [];

    safeText(document.getElementById('stat-total'), String(inv.length || 0));
    safeText(document.getElementById('stat-high'), String(inv.filter(x => x.riskTier === 'High').length));
    safeText(document.getElementById('stat-pilot'), String(inv.filter(x => x.status === 'Pilot' || x.status === 'Under assessment').length));

    const avgs = computeAverages(inv);
    const env100 = Math.round((avgs.env / 5) * 100) || 0;
    const soc100 = Math.round((avgs.soc / 5) * 100) || 0;
    const eco100 = Math.round((avgs.eco / 5) * 100) || 0;

    safeText(document.getElementById('score-env'), String(env100));
    safeText(document.getElementById('score-soc'), String(soc100));
    safeText(document.getElementById('score-eco'), String(eco100));

    setGaugeStroke(document.getElementById('gauge-env'), env100);
    setGaugeStroke(document.getElementById('gauge-soc'), soc100);
    setGaugeStroke(document.getElementById('gauge-eco'), eco100);

    // Start closed
    resetQuadrants();
  }

  AIR.modules.initOverview = initOverview;
})();
/* inventory-data.js (UPDATED)
   Data only. Exposes aiInventory on window.AIRiskNav.data.aiInventory
*/
(() => {
  'use strict';

  const aiInventory = [
  {
    id: "AI-001",
    name: "Customer Credit Scoring Engine",
    owner: "Retail Banking",
    techOwner: "Data Science Team",
    useCase: "Predict probability of default for loan applications.",
    riskTier: "High",
    status: "In production",
    lastReview: "2025-06-15",
    envScore: 2,
    socialScore: 4,
    economicScore: 5,
    dataCategory: "Highly sensitive personal & financial data",

    // AI Governance: EU AI Act (high-risk credit scoring), ISO 42001, NIST AI RMF, OECD
    aiGovFrameworks: [
      "EU Artificial Intelligence Act (high-risk: credit scoring)",
      "NIST AI RMF",
      "ISO/IEC 42001 (implementation in progress)",
      "OECD AI Principles"
    ],

    // Sustainability: climate & inclusion related
    sustainabilityFrameworks: [
      "IFRS S2 (credit exposure under climate scenarios)",
      "SDG Impact Standards (SDG 8 & 10)"
    ],

    // Risk / Corporate Governance / Ethics
    riskEthicsFrameworks: [
      "ISO 31000",
      "UK Corporate Governance Code",
      "GDPR",
      "RRI Toolkit"
    ],

    flag: "High social and economic impact; must meet EU AI Act high-risk obligations and fairness / bias safeguards.",
    notes:
      "Used for creditworthiness assessments. Quarterly fairness reviews, model risk governance, and drift monitoring in place. Alignment work with ISO/IEC 42001 design underway."
  },
  {
    id: "AI-002",
    name: "Contact Centre Chatbot",
    owner: "Customer Services",
    techOwner: "Digital Product Team",
    useCase: "Handle routine customer queries and triage to human agents.",
    riskTier: "Limited",
    status: "In production",
    lastReview: "2025-05-01",
    envScore: 3,
    socialScore: 3,
    economicScore: 4,
    dataCategory: "Customer interaction logs and FAQs",

    aiGovFrameworks: [
      "EU Artificial Intelligence Act (limited-risk transparency obligations)",
      "NIST AI RMF"
    ],
    sustainabilityFrameworks: [
      "GRI Standards (service quality indicators)"
    ],
    riskEthicsFrameworks: [
      "ISO 31000",
      "GDPR",
      "RRI Toolkit"
    ],

    flag: "Transparency to customers and escalation to humans required under EU AI Act limited-risk provisions.",
    notes:
      "Provides clear disclosure that customers are interacting with an automated system. Logs are sampled monthly for quality, tone, and hallucination risk."
  },
  {
    id: "AI-003",
    name: "Fraud Transaction Anomaly Detector",
    owner: "Risk & Compliance",
    techOwner: "Fraud Analytics Squad",
    useCase: "Identify suspicious transactions for further investigation.",
    riskTier: "High",
    status: "In production",
    lastReview: "2025-07-02",
    envScore: 2,
    socialScore: 4,
    economicScore: 5,
    dataCategory: "Financial & behavioural transaction data",

    aiGovFrameworks: [
      "EU Artificial Intelligence Act (high-risk: fraud monitoring and AML support)",
      "NIST AI RMF",
      "ISO/IEC 42001",
      "OECD AI Principles"
    ],
    sustainabilityFrameworks: [
      "IFRS S2 (financial resilience under climate-related fraud patterns)"
    ],
    riskEthicsFrameworks: [
      "ISO 31000",
      "UK Corporate Governance Code",
      "GDPR",
      "RRI Toolkit"
    ],

    flag: "High economic and social impact; false positives must be managed with human-in-the-loop and explainability.",
    notes:
      "Model performance and false positive rates are reviewed by the Model Risk Committee. EU AI Act high-risk register entry maintained for audit."
  },
  {
    id: "AI-004",
    name: "HR Candidate Screening Tool",
    owner: "Human Resources",
    techOwner: "People Analytics",
    useCase: "Pre-screen CVs for minimum job requirements.",
    riskTier: "High",
    status: "Pilot",
    lastReview: "2025-04-10",
    envScore: 2,
    socialScore: 5,
    economicScore: 3,
    dataCategory: "Personal and employment application data",

    aiGovFrameworks: [
      "EU Artificial Intelligence Act (high-risk: employment-related)",
      "NIST AI RMF",
      "ISO/IEC 42001 (design phase)",
      "OECD AI Principles"
    ],
    sustainabilityFrameworks: [
      "SDG Impact Standards (SDG 5 & 10 – fair access to work)"
    ],
    riskEthicsFrameworks: [
      "ISO 31000",
      "UK Corporate Governance Code",
      "GDPR",
      "RRI Toolkit"
    ],

    flag: "High social risk; cannot move beyond pilot until fairness, bias and explainability obligations are demonstrably met.",
    notes:
      "Pilot restricted to one business unit. External bias audit scheduled. Candidates are notified about automated pre-screening and appeals process."
  },
  {
    id: "AI-005",
    name: "Marketing Propensity Model",
    owner: "Marketing",
    techOwner: "Analytics Centre of Excellence",
    useCase: "Target customers most likely to respond to a campaign.",
    riskTier: "Limited",
    status: "In production",
    lastReview: "2025-03-21",
    envScore: 3,
    socialScore: 3,
    economicScore: 4,
    dataCategory: "Customer behaviour, channel and demographic data",

    aiGovFrameworks: [
      "EU Artificial Intelligence Act (limited-risk profiling)",
      "NIST AI RMF"
    ],
    sustainabilityFrameworks: [
      "GRI Standards (marketing communications)",
      "SDG Impact Standards (responsible consumption & production)"
    ],
    riskEthicsFrameworks: [
      "ISO 31000",
      "GDPR",
      "RRI Toolkit"
    ],

    flag: "Limited-risk AI; must respect consent, right to object, and responsible marketing principles.",
    notes:
      "Opt-out mechanisms and suppression lists enforced. Regular GDPR compliance checks and monitoring of complaints / opt-out rates."
  },
  {
    id: "AI-006",
    name: "IT Ticket Prioritisation Model",
    owner: "IT Operations",
    techOwner: "IT Service Management",
    useCase: "Prioritise incident tickets based on impact and urgency.",
    riskTier: "Minimal",
    status: "In production",
    lastReview: "2025-02-10",
    envScore: 3,
    socialScore: 2,
    economicScore: 3,
    dataCategory: "Internal operational and configuration data",

    aiGovFrameworks: [
      "EU Artificial Intelligence Act (minimal-risk: internal operations)",
      "NIST AI RMF"
    ],
    sustainabilityFrameworks: [],
    riskEthicsFrameworks: [
      "ISO 31000",
      "UK Corporate Governance Code (operational resilience)"
    ],

    flag: "Minimal-risk system; internal use only with strong manual override.",
    notes:
      "Improves response times for major incidents. Documented as minimal-risk AI within the corporate AI inventory; regular reviews focus on availability, not ethics."
  },
  {
    id: "AI-007",
    name: "Energy Optimisation for Data Centre",
    owner: "Technology Infrastructure",
    techOwner: "Cloud & Platform Team",
    useCase: "Adjust cooling and compute scheduling to reduce energy use.",
    riskTier: "Limited",
    status: "Pilot",
    lastReview: "2025-06-01",
    envScore: 5,
    socialScore: 3,
    economicScore: 4,
    dataCategory: "Infrastructure telemetry and performance metrics",

    aiGovFrameworks: [
      "EU Artificial Intelligence Act (minimal / limited-risk: infrastructure optimisation)",
      "NIST AI RMF",
      "OECD AI Principles"
    ],
    sustainabilityFrameworks: [
      "GRI Standards (305 – emissions)",
      "IFRS S2 (Scope 2 energy use)",
      "SDG Impact Standards (SDG 7 & 13)"
    ],
    riskEthicsFrameworks: [
      "ISO 31000",
      "UK Corporate Governance Code",
      "RRI Toolkit"
    ],

    flag: "Strong environmental benefit; must demonstrate that optimisation does not undermine resilience or service levels.",
    notes:
      "Pilot shows early reductions in energy consumption. Reliability and latency monitored; results will feed into IFRS S2 climate reporting."
  },
  {
    id: "AI-008",
    name: "Document Classification Assistant",
    owner: "Legal & Secretariat",
    techOwner: "Knowledge Management",
    useCase: "Tag and route contracts and legal documents.",
    riskTier: "Limited",
    status: "Under assessment",
    lastReview: "2025-05-18",
    envScore: 2,
    socialScore: 2,
    economicScore: 3,
    dataCategory: "Confidential legal and contractual documents",

    aiGovFrameworks: [
      "EU Artificial Intelligence Act (limited-risk information processing)",
      "NIST AI RMF",
      "OECD AI Principles"
    ],
    sustainabilityFrameworks: [],
    riskEthicsFrameworks: [
      "ISO 31000",
      "GDPR",
      "RRI Toolkit"
    ],

    flag: "Needs robust access controls and confidentiality safeguards before go-live.",
    notes:
      "Accuracy and security are being validated. Deployment will require DPIA and sign-off from the Data Protection Officer."
  },
  {
    id: "AI-009",
    name: "Supplier ESG Risk Scoring",
    owner: "Procurement & Sustainability",
    techOwner: "Sustainability Analytics",
    useCase: "Score suppliers on ESG and climate risk factors.",
    riskTier: "Limited",
    status: "In production",
    lastReview: "2025-07-01",
    envScore: 5,
    socialScore: 4,
    economicScore: 4,
    dataCategory: "Public ESG data and supplier disclosures",

    aiGovFrameworks: [
      "NIST AI RMF",
      "OECD AI Principles"
    ],
    sustainabilityFrameworks: [
      "GRI Standards",
      "IFRS S2",
      "SASB Standards",
      "SDG Impact Standards"
    ],
    riskEthicsFrameworks: [
      "ISO 31000",
      "UK Corporate Governance Code",
      "RRI Toolkit"
    ],

    flag: "Directly supports sustainability disclosures; methodology must align to IFRS S2 and GRI definitions.",
    notes:
      "Scores feed into board-level ESG reporting and supplier selection. Methodology reviewed annually and published to suppliers for transparency."
  },
  {
    id: "AI-010",
    name: "Legacy Collections Dialler Model",
    owner: "Collections",
    techOwner: "Legacy Systems Team",
    useCase: "Optimise outbound dialling sequences for overdue accounts.",
    riskTier: "High",
    status: "Retired",
    lastReview: "2024-12-15",
    envScore: 1,
    socialScore: 4,
    economicScore: 3,
    dataCategory: "Customer contact and arrears data",

    aiGovFrameworks: [
      "EU Artificial Intelligence Act (historic design – pre-compliance)",
      "OECD AI Principles (used to assess retirement decision)"
    ],
    sustainabilityFrameworks: [
      "SDG Impact Standards (SDG 1 & 10 – financial inclusion) – review found mis-alignment"
    ],
    riskEthicsFrameworks: [
      "ISO 31000",
      "GDPR"
    ],

    flag: "Retired due to potential unfair targeting, limited explainability and weak alignment to current responsible AI standards.",
    notes:
      "Maintained in archive for audit only. Lessons from this model are used as a negative case in the organisation’s AI training materials."
  }
];

  window.AIRiskNav = window.AIRiskNav || { data: {}, modules: {}, state: {} };
  window.AIRiskNav.data.aiInventory = aiInventory;
})();
/* esec-lens.js (UPDATED)
   - Provides:
     AIRiskNav.modules.initInventory()   (AI Inventory view)
     AIRiskNav.modules.initESEc()        (E–S–Ec Lens view)
   - Uses AIRiskNav.data.aiInventory
   - Matches IDs in index.html
*/
(() => {
  'use strict';

  window.AIRiskNav = window.AIRiskNav || { data: {}, modules: {}, state: {} };
  const AIR = window.AIRiskNav;

  // ---------- Shared helpers ----------
  function el(id) { return document.getElementById(id); }
  function safeSetText(node, value) { if (node) node.textContent = value; }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  function badgeClass(riskTier) {
    if (riskTier === 'High') return 'badge badge-high';
    if (riskTier === 'Limited') return 'badge badge-limited';
    if (riskTier === 'Minimal') return 'badge badge-minimal';
    return 'badge';
  }

  function pill(label, cls) {
    return `<span class="framework-pill ${cls || ''}">${label}</span>`;
  }

  // =====================================================
  // INVENTORY VIEW
  // =====================================================
  function initInventory() {
    const root = el('view-inventory');
    if (!root) return;
    if (AIR.state.inventoryReady) return;
    AIR.state.inventoryReady = true;

    const inv = Array.isArray(AIR.data.aiInventory) ? AIR.data.aiInventory : [];

    const statTotal = el('stat-total-inv');
    const statHigh = el('stat-high-inv');
    const statReview = el('stat-review-inv');

    const searchInput = el('search-input');
    const riskFilter = el('risk-filter');
    const statusFilter = el('status-filter');
    const ownerFilter = el('owner-filter');
    const lensFilter = el('lens-filter');

    const tbody = el('inventory-tbody');
    const detailPanel = el('detail-panel');
    const detailContent = el('detail-content');

    if (!tbody || !searchInput || !riskFilter || !statusFilter || !ownerFilter || !lensFilter) {
      // If markup changed, fail silently rather than killing the whole app
      return;
    }

    // Populate owner filter
    const owners = Array.from(new Set(inv.map(x => x.owner).filter(Boolean))).sort();
    owners.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      ownerFilter.appendChild(opt);
    });

    // Populate framework lens filter (simple: any frameworks present in that category)
    const lensOpts = [
      { value: 'all', label: 'All' },
      { value: 'aiGov', label: 'AI governance frameworks' },
      { value: 'sustainability', label: 'Sustainability frameworks' },
      { value: 'riskEthics', label: 'Risk / ethics frameworks' }
    ];
    lensOpts.forEach((o, idx) => {
      if (idx === 0) return; // "All" already in HTML? It is, but safe to add only if missing.
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      lensFilter.appendChild(opt);
    });

    let filtered = inv.slice();
    let selectedId = null;

    function updateStats(list) {
      safeSetText(statTotal, String(list.length));
      safeSetText(statHigh, String(list.filter(x => x.riskTier === 'High').length));
      safeSetText(statReview, String(list.filter(x => x.status === 'Pilot' || x.status === 'Under assessment').length));
    }

    function clearSelection() {
      selectedId = null;
      tbody.querySelectorAll('tr').forEach(tr => tr.classList.remove('selected'));
      if (detailPanel) detailPanel.classList.add('detail-hidden');
      if (detailContent) detailContent.innerHTML = '';
    }

    function renderDetails(item) {
      if (!detailPanel || !detailContent) return;
      detailPanel.classList.remove('detail-hidden');

      const aiGov = (item.aiGovFrameworks || []).map(f => pill(f, 'pill-ai')).join('');
      const sust = (item.sustainabilityFrameworks || []).map(f => pill(f, 'pill-sus')).join('');
      const risk = (item.riskEthicsFrameworks || []).map(f => pill(f, 'pill-risk')).join('');

      detailContent.innerHTML = `
        <div class="detail-grid">
          <div class="detail-row"><strong>ID</strong><span>${item.id}</span></div>
          <div class="detail-row"><strong>Name</strong><span>${item.name}</span></div>
          <div class="detail-row"><strong>Business owner</strong><span>${item.owner}</span></div>
          <div class="detail-row"><strong>Tech owner</strong><span>${item.techOwner || '—'}</span></div>
          <div class="detail-row"><strong>Status</strong><span>${item.status}</span></div>
          <div class="detail-row"><strong>Risk tier</strong><span>${item.riskTier}</span></div>
          <div class="detail-row"><strong>Last review</strong><span>${formatDate(item.lastReview)}</span></div>
          <div class="detail-row"><strong>Use case</strong><span>${item.useCase}</span></div>
          <div class="detail-row"><strong>Data category</strong><span>${item.dataCategory || '—'}</span></div>
          <div class="detail-row"><strong>E–S–Ec scores</strong>
            <span>E:${item.envScore} · S:${item.socialScore} · Ec:${item.economicScore}</span>
          </div>
          <div class="detail-row"><strong>Flag</strong><span>${item.flag || '—'}</span></div>
          <div class="detail-row"><strong>Notes</strong><span>${item.notes || '—'}</span></div>
        </div>

        <div class="detail-section">
          <h4>AI governance alignment</h4>
          <div class="pill-row">${aiGov || '<span class="muted">None recorded</span>'}</div>
        </div>

        <div class="detail-section">
          <h4>Sustainability alignment</h4>
          <div class="pill-row">${sust || '<span class="muted">None recorded</span>'}</div>
        </div>

        <div class="detail-section">
          <h4>Risk / ethics alignment</h4>
          <div class="pill-row">${risk || '<span class="muted">None recorded</span>'}</div>
        </div>
      `;
    }

    function renderTable(list) {
      tbody.innerHTML = '';

      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="muted">No systems match the current filters.</td></tr>`;
        updateStats(list);
        clearSelection();
        return;
      }

      list.forEach(item => {
        const tr = document.createElement('tr');
        tr.dataset.id = item.id;
        tr.innerHTML = `
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.owner}</td>
          <td>${item.useCase}</td>
          <td><span class="${badgeClass(item.riskTier)}">${item.riskTier}</span></td>
          <td><span class="badge badge-status">${item.status}</span></td>
        `;
        tr.addEventListener('click', () => {
          selectedId = item.id;
          tbody.querySelectorAll('tr').forEach(r => r.classList.toggle('selected', r.dataset.id === selectedId));
          renderDetails(item);
        });
        tbody.appendChild(tr);
      });

      updateStats(list);

      // Preserve selection where possible
      if (selectedId) {
        const still = list.find(x => x.id === selectedId);
        if (still) {
          const row = tbody.querySelector(`tr[data-id="${selectedId}"]`);
          if (row) row.classList.add('selected');
          renderDetails(still);
        } else {
          clearSelection();
        }
      } else {
        clearSelection();
      }
    }

    function applyFilters() {
      const q = (searchInput.value || '').trim().toLowerCase();
      const risk = riskFilter.value;
      const status = statusFilter.value;
      const owner = ownerFilter.value;
      const lens = lensFilter.value;

      filtered = inv.filter(item => {
        if (q) {
          const hay = `${item.id} ${item.name} ${item.owner} ${item.useCase}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (risk !== 'all' && item.riskTier !== risk) return false;
        if (status !== 'all' && item.status !== status) return false;
        if (owner !== 'all' && item.owner !== owner) return false;

        if (lens === 'aiGov') return (item.aiGovFrameworks || []).length > 0;
        if (lens === 'sustainability') return (item.sustainabilityFrameworks || []).length > 0;
        if (lens === 'riskEthics') return (item.riskEthicsFrameworks || []).length > 0;

        return true;
      });

      renderTable(filtered);
    }

    // Inline handler in index.html
    window.resetInventoryFilters = function resetInventoryFilters() {
      searchInput.value = '';
      riskFilter.value = 'all';
      statusFilter.value = 'all';
      ownerFilter.value = 'all';
      lensFilter.value = 'all';
      selectedId = null;
      filtered = inv.slice();
      renderTable(filtered);
    };

    searchInput.addEventListener('input', applyFilters);
    riskFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    ownerFilter.addEventListener('change', applyFilters);
    lensFilter.addEventListener('change', applyFilters);

    renderTable(filtered);
  }

  // =====================================================
  // E–S–Ec LENS VIEW
  // =====================================================
  function initESEc() {
    const root = el('view-esec');
    if (!root) return;
    if (AIR.state.esecReady) return;
    AIR.state.esecReady = true;

    const inv = Array.isArray(AIR.data.aiInventory) ? AIR.data.aiInventory : [];
    const listEl = el('esec-systems');
    const chartEl = el('esec-chart-container');
    if (!listEl || !chartEl) return;

    function renderSystemCards() {
      listEl.innerHTML = '';
      inv.forEach(item => {
        const card = document.createElement('div');
        card.className = 'system-card';
        card.innerHTML = `
          <div class="system-card-header">
            <div class="system-name">${item.name}</div>
            <div class="system-id">${item.id}</div>
          </div>
          <div class="system-meta">
            <span class="badge badge-status">${item.status}</span>
            <span class="${badgeClass(item.riskTier)}">${item.riskTier}</span>
          </div>
          <div class="system-scores">
            <div class="score-chip score-env">E <strong>${item.envScore}</strong>/5</div>
            <div class="score-chip score-soc">S <strong>${item.socialScore}</strong>/5</div>
            <div class="score-chip score-eco">Ec <strong>${item.economicScore}</strong>/5</div>
          </div>
          <div class="system-usecase">${item.useCase}</div>
        `;
        listEl.appendChild(card);
      });
    }

    // Simple portfolio bar chart (no external libs)
    function renderPortfolioChart() {
      const avg = inv.reduce((acc, x) => {
        acc.env += Number(x.envScore) || 0;
        acc.soc += Number(x.socialScore) || 0;
        acc.eco += Number(x.economicScore) || 0;
        return acc;
      }, { env: 0, soc: 0, eco: 0 });

      const n = inv.length || 1;
      const env = (avg.env / n);
      const soc = (avg.soc / n);
      const eco = (avg.eco / n);

      const toPct = v => Math.round((v / 5) * 100);

      chartEl.innerHTML = `
        <div class="chart-card">
          <h3 class="card-title">Portfolio average (1–5 mapped to %)</h3>
          <div class="bar-row">
            <div class="bar-label">Environmental</div>
            <div class="bar-track"><div class="bar-fill bar-env" style="width:${toPct(env)}%"></div></div>
            <div class="bar-value">${toPct(env)}%</div>
          </div>
          <div class="bar-row">
            <div class="bar-label">Social</div>
            <div class="bar-track"><div class="bar-fill bar-soc" style="width:${toPct(soc)}%"></div></div>
            <div class="bar-value">${toPct(soc)}%</div>
          </div>
          <div class="bar-row">
            <div class="bar-label">Economic</div>
            <div class="bar-track"><div class="bar-fill bar-eco" style="width:${toPct(eco)}%"></div></div>
            <div class="bar-value">${toPct(eco)}%</div>
          </div>
          <p class="muted" style="margin-top:.75rem;">
            Use this view for Board discussion of imbalances. Drill into Inventory for system-level evidence and framework alignment.
          </p>
        </div>
      `;
    }

    renderSystemCards();
    renderPortfolioChart();
  }

  AIR.modules.initInventory = initInventory;
  AIR.modules.initESEc = initESEc;
})();
/* risk-controls.js (UPDATED)
   - Provides:
     AIRiskNav.modules.initRisk()       (Risk & Controls view)
     AIRiskNav.modules.initEducation()  (Scenario & Learning Mode view)
   - Uses datasets extracted from your original risk-controls.js, but:
     * avoids global name collisions
     * renders into the IDs that exist in index.html
*/
(() => {
  'use strict';

  window.AIRiskNav = window.AIRiskNav || { data: {}, modules: {}, state: {} };
  const AIR = window.AIRiskNav;

  // ---- Data (unchanged from your original file) ----
  const aiSystems = {
  "AI-001": "Customer Credit Scoring Engine",
  "AI-002": "Contact Centre Chatbot",
  "AI-003": "Fraud Transaction Anomaly Detector",
  "AI-004": "HR Candidate Screening Tool",
  "AI-005": "Marketing Propensity Model",
  "AI-006": "IT Ticket Prioritisation Model",
  "AI-007": "Energy Optimisation for Data Centre",
  "AI-008": "Document Classification Assistant",
  "AI-009": "Supplier ESG Risk Scoring",
  "AI-010": "Legacy Collections Dialler Model"
};
  const incidents = [
  {
    id: "INC-001",
    title: "Fairness concerns in HR screening pilot",
    category: "Incident",
    severity: "High",
    type: "Fairness & ethics",
    date: "2025-05-12",
    systems: ["AI-004"],
    summary:
      "Early use of the HR Candidate Screening Tool revealed lower pass-through rates for candidates from certain universities and regions.",
    impact:
      "Raised risk of indirect discrimination and reputational damage, with potential legal implications if left unaddressed.",
    response:
      "Pilot restricted to one business unit, fairness metrics introduced, and an external bias audit commissioned before any scale-up.",
    residualRisk: "Medium",
    env: "low",
    soc: "high",
    eco: "med",
    strengthenedControls: true
  },
  {
    id: "INC-002",
    title: "Fraud model drift increases false positives",
    category: "Incident",
    severity: "High",
    type: "Operational resilience",
    date: "2025-03-20",
    systems: ["AI-003"],
    summary:
      "A tightening of fraud thresholds after a new attack pattern led to a surge in false positives and blocked transactions.",
    impact:
      "Short-term fraud losses were contained but complaints increased sharply and some customers moved providers.",
    response:
      "Thresholds adjusted, manual review expanded temporarily and new drift-monitoring alerts added to the control framework.",
    residualRisk: "Medium",
    env: "low",
    soc: "high",
    eco: "high",
    strengthenedControls: true
  },
  {
    id: "INC-003",
    title: "Opaque credit decisions trigger complaints",
    category: "Incident",
    severity: "Medium",
    type: "Conduct & culture",
    date: "2025-04-05",
    systems: ["AI-001"],
    summary:
      "Customers reported confusion about declined credit applications, with limited explanation provided through existing processes.",
    impact:
      "Increased complaints and potential scrutiny under EU AI Act and GDPR transparency expectations.",
    response:
      "Plain-language explanation templates and appeal routes were introduced, and documentation was aligned with AI inventory records.",
    residualRisk: "Medium",
    env: "low",
    soc: "high",
    eco: "med",
    strengthenedControls: true
  },
  {
    id: "INC-004",
    title: "Chatbot gives inconsistent arrears guidance",
    category: "Incident",
    severity: "Medium",
    type: "Conduct & culture",
    date: "2025-02-10",
    systems: ["AI-002"],
    summary:
      "The Contact Centre Chatbot provided inconsistent answers to customers in financial difficulty about payment holidays and complaint routes.",
    impact:
      "Trust in digital channels was affected and vulnerable customers risked receiving poorer outcomes than via phone-based support.",
    response:
      "Sensitive topics were routed to humans by default, content was rewritten with compliance review and hallucination monitoring was added.",
    residualRisk: "Low",
    env: "low",
    soc: "high",
    eco: "med",
    strengthenedControls: true
  },
  {
    id: "INC-005",
    title: "Telemetry gaps understate AI energy usage",
    category: "Incident",
    severity: "Medium",
    type: "Sustainability reporting",
    date: "2025-06-01",
    systems: ["AI-007"],
    summary:
      "Energy monitoring for some GPU-intensive optimisation workloads was incomplete, leading to under-reporting of emissions.",
    impact:
      "Risk that climate disclosures under IFRS S2 and GRI were not fully accurate, undermining confidence in net-zero claims.",
    response:
      "Telemetry coverage was extended, vendor data cross-checked and sustainability teams integrated AI workloads into assurance plans.",
    residualRisk: "Medium",
    env: "high",
    soc: "low",
    eco: "med",
    strengthenedControls: true
  },
  {
    id: "NM-001",
    title: "Near miss: misrouted privileged legal documents",
    category: "Near miss",
    severity: "Medium",
    type: "Data & privacy",
    date: "2025-05-08",
    systems: ["AI-008"],
    summary:
      "Testing of the Document Classification Assistant identified occasional misclassification of privileged legal documents before go-live.",
    impact:
      "If unaddressed, this could have led to confidentiality breaches and regulatory findings under data protection and professional standards.",
    response:
      "Additional rule-based checks were added for highly confidential documents and the deployment was postponed pending further assurance.",
    residualRisk: "Low",
    env: "low",
    soc: "med",
    eco: "med",
    strengthenedControls: true
  },
  {
    id: "NM-002",
    title: "Near miss: collections dialler flagged as unfair",
    category: "Near miss",
    severity: "Medium",
    type: "Fairness & ethics",
    date: "2024-11-15",
    systems: ["AI-010"],
    summary:
      "Internal review of the Legacy Collections Dialler Model highlighted limited explainability and targeting concerns, prompting deeper investigation.",
    impact:
      "Board and executive teams recognised that historic practice may not align with current responsible AI expectations.",
    response:
      "The model was retired and documented as a negative case study for AI training; data retention and remediation options are under review.",
    residualRisk: "Medium",
    env: "low",
    soc: "high",
    eco: "med",
    strengthenedControls: true
  },
  {
    id: "NM-003",
    title: "Near miss: supplier ESG scoring challenge",
    category: "Near miss",
    severity: "Medium",
    type: "Sustainability reporting",
    date: "2025-07-03",
    systems: ["AI-009"],
    summary:
      "A strategic supplier challenged its ESG score, revealing heavy reliance on proxy data and inconsistent disclosure assumptions.",
    impact:
      "Potential misalignment between reported supply-chain climate risk and underlying reality; risk of misinformed procurement decisions.",
    response:
      "Methodology was revised, proxy use disclosed and a process introduced for suppliers to review and challenge AI-derived scores.",
    residualRisk: "Medium",
    env: "high",
    soc: "med",
    eco: "med",
    strengthenedControls: true
  },
  {
    id: "NM-004",
    title: "Near miss: IT ticket model misroutes major incident",
    category: "Near miss",
    severity: "Low",
    type: "Operational resilience",
    date: "2025-01-05",
    systems: ["AI-006"],
    summary:
      "An internal review of incident logs showed that one major outage was initially routed as a low-priority ticket by the IT Ticket Prioritisation Model.",
    impact:
      "The issue was caught by human override before significant customer impact, but highlighted a gap in training data for newer incident types.",
    response:
      "Training data was updated, major-incident rules were strengthened and critical tickets now bypass the model during early triage.",
    residualRisk: "Low",
    env: "low",
    soc: "med",
    eco: "med",
    strengthenedControls: true
  }
];
  const questionTemplates = {
  climateStress: {
    beginner: {
      env: [
        "Are the climate scenarios and emissions assumptions clearly documented and independently reviewed?",
        "How are climate-related environmental assumptions translated into credit or capital decision rules?"
      ],
      soc: [
        "Could climate-adjusted decisions disproportionately affect certain regions or customer groups?",
        "Is there a clear process for affected customers or communities to challenge scenario-based decisions?"
      ],
      eco: [
        "How sensitive are key financial metrics to AI-generated climate stress tests?",
        "Do Board packs show a clear link between stress-test outputs and lending or portfolio strategy changes?"
      ],
      gov: [
        "Which committee owns oversight of climate-augmented models across the business?",
        "Are roles and responsibilities for validating climate data, models and disclosures clearly assigned?"
      ]
    },
    expert: {
      env: [
        "Do scenario designs align with the latest science-based pathways and internal net-zero commitments?",
        "Are limitations of the AI models explicitly disclosed in climate and risk reports?"
      ],
      soc: [
        "Has distributional impact analysis been run to identify groups over-exposed to climate-driven constraints?",
        "Are trade-offs between financial resilience and financial inclusion transparently discussed?"
      ],
      eco: [
        "How are scenario outputs reflected in risk appetite, capital planning and IFRS S2 disclosures?",
        "Are reverse stress tests used to explore tail scenarios where climate AI models may fail?"
      ],
      gov: [
        "Does the AI governance framework explicitly integrate climate models and decision points?",
        "Have external assurance providers reviewed both the model and the surrounding governance?"
      ]
    }
  },

  hrBias: {
    beginner: {
      env: [
        "Do recruitment and work-location assumptions avoid unnecessary travel or environmental burdens?",
        "Are remote or hybrid options considered when defining 'suitable candidates'?"
      ],
      soc: [
        "How has the screening tool been tested for bias across gender, ethnicity, disability and socio-economic background?",
        "Is there a clear, accessible route for candidates to challenge an automated screening outcome?"
      ],
      eco: [
        "What efficiency gains are expected and how are they balanced against potential social harm or legal risk?",
        "Could reputational damage from biased outcomes outweigh operational benefits?"
      ],
      gov: [
        "Has the pilot been formally approved by an ethics or risk committee?",
        "Which Board committee receives updates on AI use in HR and recruitment?"
      ]
    },
    expert: {
      env: [
        "Are sustainability and EDI objectives aligned in workforce planning, not pulling in opposite directions?",
        "Do remote-first policies interact with AI screening in ways that may create new inequities?"
      ],
      soc: [
        "Are intersectional fairness metrics monitored over time, not just at a single launch point?",
        "Has an external audit or challenge review been commissioned before scaling beyond pilot?"
      ],
      eco: [
        "Are analyses performed on potential legal costs, remediation and brand damage from biased decisions?",
        "Is there a contingency plan if the tool must be paused or rolled back at short notice?"
      ],
      gov: [
        "How is HR AI integrated into the wider AI risk register and Board reporting?",
        "Are staff and unions consulted about automated screening and decision support?"
      ]
    }
  },

  fraudDrift: {
    beginner: {
      env: [
        "Could more efficient model architectures reduce compute and monitoring load for fraud detection?",
        "Are data retention and logging policies proportionate to both fraud control and environmental goals?"
      ],
      soc: [
        "Are certain customer groups disproportionately affected by false positives or blocked transactions?",
        "Is it easy for customers to get errors fixed and regain access when fraud controls misfire?"
      ],
      eco: [
        "What is the estimated revenue and churn impact of current false positive rates?",
        "Is there a clear trigger for pausing or rolling back the model when drift is detected?"
      ],
      gov: [
        "Who has the authority to make emergency changes to fraud models when issues arise?",
        "Are fraud model incidents logged and escalated through formal risk and incident channels?"
      ]
    },
    expert: {
      env: [
        "Can model compression or architecture changes support both resilience and lower carbon intensity?",
        "Is there an explicit link between data retention horizons and sustainability objectives?"
      ],
      soc: [
        "Is complaints data analysed regularly for patterns of systemic unfairness?",
        "Do vulnerable customers receive additional protections when fraud controls are tightened?"
      ],
      eco: [
        "Are trade-offs between fraud losses and customer attrition quantified and discussed at Board level?",
        "How quickly can model parameters be tuned or rules adjusted without undermining control effectiveness?"
      ],
      gov: [
        "Does the risk committee receive regular metrics on false positives, overrides and drift alerts?",
        "Is independent validation of fraud models clearly separated from development teams?"
      ]
    }
  },

  chatbot: {
    beginner: {
      env: [
        "Is digital self-service positioned as part of a sustainable channel strategy, not the only option?",
        "Are there triggers where the system promotes lower-carbon options (e.g. digital statements) without coercion?"
      ],
      soc: [
        "Does the chatbot clearly disclose that it is an automated system?",
        "Is there a simple route for customers, especially vulnerable ones, to escalate to a human?"
      ],
      eco: [
        "What business metrics does the chatbot optimise for (call deflection, satisfaction, complaints)?",
        "Are any financial incentives encouraging over-automation at the expense of quality or fairness?"
      ],
      gov: [
        "Who owns content quality and hallucination risk in chatbot responses?",
        "Are scripts and training data reviewed regularly for harmful or misleading patterns?"
      ]
    },
    expert: {
      env: [
        "Could channel shifts driven by the chatbot change the organisation’s environmental footprint?",
        "Are digital inclusion and sustainability strategies aligned in customer service design?"
      ],
      soc: [
        "Is sentiment and complaint data monitored to detect where chatbot behaviour damages trust?",
        "Do governance processes ensure accessible design for disabled or neurodivergent users?"
      ],
      eco: [
        "Are scenario analyses run where chatbot errors lead to financial loss or regulatory challenge?",
        "Is there a defined risk appetite for automation error rates vs cost savings?"
      ],
      gov: [
        "Is the chatbot included in the AI inventory with clear risk tiering and controls?",
        "Do Board reports explicitly cover automation risks in customer support?"
      ]
    }
  },

  creditTransparency: {
    beginner: {
      env: [
        "Do credit policies consider climate-sensitive sectors or regions in a transparent way?",
        "Are environment-related limits or exclusions explained clearly to affected customers?"
      ],
      soc: [
        "How are customers informed about automated elements in credit decisions?",
        "Is there an accessible appeals process where customers can request human review?"
      ],
      eco: [
        "How do model changes affect approval rates, loss rates and revenue?",
        "Are there safeguards against reinforcing historical exclusion patterns?"
      ],
      gov: [
        "Does the Board receive regular updates on fairness and complaints related to credit decisions?",
        "Are responsibilities for model governance and customer fairness clearly assigned?"
      ]
    },
    expert: {
      env: [
        "How do climate and transition risks feed into credit models without masking fairness issues?",
        "Are local environmental exposures reflected consistently across the portfolio?"
      ],
      soc: [
        "Are distributional effects of credit policy changes analysed across demographic segments?",
        "Has any external scrutiny or regulator guidance on algorithmic credit been addressed?"
      ],
      eco: [
        "Do Board-level dashboards connect fairness indicators with financial outcomes?",
        "Are alternative strategies considered where financial and fairness goals can both improve?"
      ],
      gov: [
        "Is AI-driven credit scoring mapped explicitly to EU AI Act high-risk obligations?",
        "Do independent assurance functions review both model performance and customer fairness data?"
      ]
    }
  },

  energyOptimisation: {
    beginner: {
      env: [
        "How are energy and emissions savings from optimisation measured and reported?",
        "Is there a documented threshold beyond which optimisation should not go?"
      ],
      soc: [
        "Could performance degradation affect critical services used by vulnerable customers or staff?",
        "Is there a clear channel for staff to report issues linked to the optimiser?"
      ],
      eco: [
        "What is the financial value of energy savings and how volatile is it?",
        "Have potential outage costs been weighed against optimisation benefits?"
      ],
      gov: [
        "Who signs off changes to optimisation settings and safeguards?",
        "Is the optimiser included in operational resilience and disaster recovery tests?"
      ]
    },
    expert: {
      env: [
        "Are emissions factors updated regularly to avoid under- or over-stating carbon benefits?",
        "Could optimisation outputs support external climate commitments and IFRS S2 disclosures?"
      ],
      soc: [
        "Is service quality monitored for equity across regions and user groups when optimisation changes are made?",
        "Do staff understand when and how to override the optimiser safely?"
      ],
      eco: [
        "Are stress scenarios run where optimisation fails during peak demand events?",
        "How quickly can the organisation revert to a safe configuration if issues arise?"
      ],
      gov: [
        "Is this AI captured in the register of critical systems reviewed by the Board?",
        "Does internal audit test governance around AI-enabled optimisation decisions?"
      ]
    }
  },

  legacyDialler: {
    beginner: {
      env: [
        "Does decommissioning the legacy model enable consolidation of older, less efficient infrastructure?",
        "Are there environmental benefits from retiring associated systems or data centres?"
      ],
      soc: [
        "What is known about how different customer segments were treated by the legacy dialler?",
        "Have affected customers been identified and, where appropriate, remediated or contacted?"
      ],
      eco: [
        "Did the dialler materially impact collections performance, and what has changed since retirement?",
        "Could redesigned strategies achieve better outcomes with lower social risk?"
      ],
      gov: [
        "Is the retired model logged as a case study in AI training materials?",
        "Were governance gaps identified that must be closed before new collections tools go live?"
      ]
    },
    expert: {
      env: [
        "Can rationalisation of legacy technology contribute to broader sustainability and efficiency goals?",
        "Was there duplication of compute or infrastructure solely to support this model?"
      ],
      soc: [
        "Is long-term customer impact from legacy AI systematically reviewed?",
        "Are consumer advocates or regulators engaged when reflecting on historic harms?"
      ],
      eco: [
        "Are risk-adjusted returns being re-estimated without the dialler’s influence?",
        "Could regulatory scrutiny of historic practices still arise, and is the organisation prepared?"
      ],
      gov: [
        "Is there a formal pattern for how retired AI models are documented, archived and reviewed?",
        "Does the Board receive periodic retrospectives on retired AI systems and lessons learned?"
      ]
    }
  },

  supplierESG: {
    beginner: {
      env: [
        "Are environmental metrics consistently defined across suppliers and sectors?",
        "How are data gaps or proxy estimates handled and disclosed?"
      ],
      soc: [
        "Do scoring methods reflect social context in different regions, including labour standards and local regulation?",
        "Is there a transparent appeals process for suppliers to challenge their ESG data?"
      ],
      eco: [
        "Could sudden changes in scores disrupt critical supply chains or increase costs?",
        "Are engagement plans considered before exiting suppliers on ESG grounds?"
      ],
      gov: [
        "Who owns the methodology for supplier ESG scoring and how often is it reviewed?",
        "Are suppliers informed about how AI is used in ESG assessments?"
      ]
    },
    expert: {
      env: [
        "Are climate and environmental inputs aligned with science-based targets and sector pathways?",
        "How are Scope 3 emission estimates validated, challenged and improved over time?"
      ],
      soc: [
        "Has the organisation considered unintended consequences for communities if suppliers are exited quickly?",
        "Is there evidence of regional or market bias in ESG scores due to data availability?"
      ],
      eco: [
        "Do Board papers link supplier ESG risk to financial resilience and concentration risk?",
        "Are scenario analyses run on supply-chain disruption driven by ESG decisions?"
      ],
      gov: [
        "Is ESG scoring aligned with broader human rights and sustainability policies?",
        "Do assurance providers review AI components of ESG scoring, not just manual metrics?"
      ]
    }
  },

  integratedTradeoff: {
    beginner: {
      env: [
        "When a model improves performance, does the Board also see how it affects energy use or emissions?",
        "Are climate or resource implications factored into decisions to scale new AI systems?"
      ],
      soc: [
        "Who benefits and who may be disadvantaged when new AI models are deployed?",
        "Is there any early evidence that certain groups experience more friction, complaints or harm?"
      ],
      eco: [
        "Does the business case for new models include downside scenarios for incidents, fines or remediation?",
        "Are there clear triggers for pausing deployment if trade-offs become unacceptable?"
      ],
      gov: [
        "How are trade-offs documented and escalated to the Board?",
        "Do scenario reviews integrate Environmental, Social and Economic dimensions together, not in silos?"
      ]
    },
    expert: {
      env: [
        "Are portfolio-level metrics available showing cumulative environmental impact of AI systems?",
        "Is the organisation exploring design choices that improve E, S and Ec simultaneously, not sequentially?"
      ],
      soc: [
        "Are lived-experience or stakeholder panels involved when evaluating high-impact trade-offs?",
        "Is there evidence that Board decisions on AI align with the organisation’s public values and commitments?"
      ],
      eco: [
        "Are trade-off scenarios compared against alternative strategies with different risk/return profiles?",
        "Do AI investments explicitly reference risk appetite and capital allocation frameworks?"
      ],
      gov: [
        "Is there a documented method for resolving tensions between E, S and Ec objectives?",
        "Do Board minutes show how competing objectives were considered and resolved in practice?"
      ]
    }
  }
};
  const scenarios = [
  // ENVIRONMENTAL (4)
  {
    id: "E1",
    title: "LLM retraining spikes data-centre energy use",
    tagline:
      "A major retraining of language models drives a sharp increase in energy consumption and emissions.",
    cluster: "Environmental",
    primaryLens: "env",
    riskBand: "High",
    systems: ["AI-007", "AI-001"],
    scores: { env: 5, soc: 3, eco: 4 },
    whatHappened:
      "The organisation schedules full retraining of its large language models and credit-scoring models in a short window. Energy use, emissions and cloud costs rise significantly for the quarter.",
    whyItMatters:
      "Environmental exposure increases just as climate commitments and IFRS S2 reporting expectations tighten. The Board must understand how AI compute choices interact with net-zero plans.",
    whoAffected:
      "Technology teams, sustainability teams and external stakeholders who scrutinise climate disclosures, including investors and regulators.",
    interpretation:
      "Environmental risk spikes due to concentrated compute demand; social risk is moderate; economic risk rises through higher opex. The scenario teaches how model lifecycle decisions shape E–S–Ec exposure.",
    teachingMoment:
      "Survey results showed Environmental interpretation is hardest. This case illustrates how seemingly technical retraining choices can materially shift environmental and financial profiles.",
    signals: [
      "Quarter-on-quarter jump in data-centre or cloud energy usage.",
      "Increased climate footprint reported in emissions data.",
      "Pressure from sustainability and finance teams about AI compute plans."
    ],
    frameworks: [
      {
        label: "IFRS S2 – climate disclosures",
        summary: "Requires transparent reporting of climate-related risks, metrics and scenario resilience."
      },
      {
        label: "GRI 305 – emissions",
        summary: "Guides how organisations measure and report greenhouse gas emissions."
      },
      {
        label: "ISO/IEC 42001 – AI management",
        summary: "Links AI lifecycle decisions, such as retraining, to risk and control processes."
      }
    ],
    questionTemplate: "climateStress"
  },
  {
    id: "E2",
    title: "Heatwave stresses water-cooled data centre",
    tagline:
      "A regional heatwave exposes dependencies on water-intensive cooling for AI workloads.",
    cluster: "Environmental",
    primaryLens: "env",
    riskBand: "Medium",
    systems: ["AI-007"],
    scores: { env: 4, soc: 3, eco: 3 },
    whatHappened:
      "During an extended heatwave, water-cooled facilities struggle to maintain performance for AI optimisation and analytics workloads. Contingency cooling is activated, increasing both water and energy use.",
    whyItMatters:
      "The incident reveals environmental dependencies that were not fully captured in risk registers, connecting climate risk, resource use and operational resilience.",
    whoAffected:
      "Operations teams, sustainability reporting functions and downstream services that rely on the data centre for critical processing.",
    interpretation:
      "Environmental exposure is high because of water scarcity and energy use; economic and social exposure are moderate, driven by resilience and potential service disruption.",
    teachingMoment:
      "This scenario links climate physical risk to AI infrastructure, reinforcing that Environmental risk is not abstract but tied to concrete dependencies like water and cooling.",
    signals: [
      "Unusual activation of contingency cooling systems.",
      "Local authorities issuing drought or water restriction guidance.",
      "Performance or availability incidents coinciding with extreme weather."
    ],
    frameworks: [
      {
        label: "IFRS S2 – physical climate risk",
        summary: "Encourages disclosure of how physical climate events affect operations and assets."
      },
      {
        label: "ISO 31000 – risk management",
        summary: "Supports integrating climate-linked infrastructure dependencies into risk registers."
      }
    ],
    questionTemplate: "energyOptimisation"
  },
  {
    id: "E3",
    title: "Telemetry gaps mis-state AI energy footprint",
    tagline:
      "Incomplete monitoring underestimates the energy and emissions associated with AI workloads.",
    cluster: "Environmental",
    primaryLens: "env",
    riskBand: "Medium",
    systems: ["AI-007"],
    scores: { env: 4, soc: 2, eco: 3 },
    whatHappened:
      "The organisation discovers that some GPU-intensive AI workloads were not fully captured in energy dashboards, leading to under-reporting of emissions.",
    whyItMatters:
      "Understated emissions compromise credibility of climate disclosures and net-zero claims, risking reputational and regulatory scrutiny.",
    whoAffected:
      "Sustainability teams, internal audit, investors and regulators who rely on accurate emissions data.",
    interpretation:
      "Environmental risk is high because reported metrics diverge from reality; economic risk is moderate through potential restatement and assurance costs.",
    teachingMoment:
      "Boards often see clean charts but not the telemetry behind them. This scenario underlines the need for assurance over AI-related environmental metrics.",
    signals: [
      "Inconsistencies between vendor and internal energy reports.",
      "Audit findings about data completeness in emissions calculations.",
      "Difficulty reconciling AI workload growth with flat emissions figures."
    ],
    frameworks: [
      {
        label: "GRI 305 – data quality",
        summary: "Emphasises reliable measurement methods and transparent assumptions."
      },
      {
        label: "IFRS S2 – metrics and targets",
        summary: "Requires robust metrics to support climate-related disclosures."
      }
    ],
    questionTemplate: "energyOptimisation"
  },
  {
    id: "E4",
    title: "Model tuning increases inference energy per transaction",
    tagline:
      "A performance-optimised model runs faster but consumes more energy per decision.",
    cluster: "Environmental",
    primaryLens: "env",
    riskBand: "Medium",
    systems: ["AI-001", "AI-003"],
    scores: { env: 4, soc: 3, eco: 4 },
    whatHappened:
      "To reduce latency, engineers deploy a larger, more complex model for fraud and credit decisions. Individual inferences become more energy-intensive.",
    whyItMatters:
      "The organisation achieves performance gains but increases environmental impact per transaction, challenging the idea that optimisation is always beneficial.",
    whoAffected:
      "Customers who experience smoother services, sustainability teams responsible for climate metrics and technology budget owners.",
    interpretation:
      "Economic and environmental exposure both rise; social exposure is moderate. The scenario teaches Boards to question single-metric optimisation.",
    teachingMoment:
      "This scenario is designed to surface E–S–Ec trade-offs that are often hidden inside technical optimisation decisions.",
    signals: [
      "Improved latency and satisfaction scores alongside rising energy usage.",
      "Tension between technology, finance and sustainability objectives.",
      "Lack of design-stage discussion of energy implications."
    ],
    frameworks: [
      {
        label: "ISO/IEC 42001 – design controls",
        summary: "Encourages considering sustainability in AI design and optimisation choices."
      },
      {
        label: "NIST AI RMF – trade-off analysis",
        summary: "Supports structured evaluation of competing system objectives."
      }
    ],
    questionTemplate: "integratedTradeoff"
  },

  // SOCIAL (4)
  {
    id: "S1",
    title: "Bias signals in HR screening pilot",
    tagline:
      "An AI CV-screening pilot shows patterns that may disadvantage certain groups.",
    cluster: "Social",
    primaryLens: "soc",
    riskBand: "High",
    systems: ["AI-004"],
    scores: { env: 2, soc: 5, eco: 3 },
    whatHappened:
      "Early analysis of the HR screening pilot suggests lower pass-through rates for candidates from specific universities and regions.",
    whyItMatters:
      "The system may entrench historical bias and damage trust in recruitment, with legal and reputational implications.",
    whoAffected:
      "Prospective candidates, particularly from under-represented backgrounds, HR teams and hiring managers.",
    interpretation:
      "Social exposure is very high; economic exposure is moderate; environmental exposure is low. The scenario teaches Boards to interrogate fairness metrics before scaling pilots.",
    teachingMoment:
      "Survey responses showed strong demand for examples and case studies. This scenario uses a realistic HR context to make fairness risks concrete.",
    signals: [
      "Uneven pass-through rates across demographic segments.",
      "Concerns raised by HR, staff networks or candidates.",
      "Unclear communication about the role of automation in screening."
    ],
    frameworks: [
      {
        label: "EU AI Act – employment high-risk",
        summary: "Classifies many AI recruitment tools as high-risk, requiring strong governance."
      },
      {
        label: "GDPR – automated decisions",
        summary: "Triggers transparency and contestability rights where automated screening is used."
      }
    ],
    questionTemplate: "hrBias"
  },
  {
    id: "S2",
    title: "Fraud model shows demographic disparities",
    tagline:
      "An anomaly detector flags a higher proportion of transactions for certain groups.",
    cluster: "Social",
    primaryLens: "soc",
    riskBand: "High",
    systems: ["AI-003"],
    scores: { env: 2, soc: 4, eco: 5 },
    whatHappened:
      "Monitoring reveals that card blocks and secondary checks are more frequent for customers in certain postcodes and age bands.",
    whyItMatters:
      "The system may be amplifying existing inequalities, with significant impact on customer trust and retention.",
    whoAffected:
      "Customers whose payments are disrupted, contact centre staff handling complaints and compliance teams.",
    interpretation:
      "Social and economic exposure are both high. This scenario links fairness concerns to financial and conduct risk.",
    teachingMoment:
      "It demonstrates why Boards must see fairness metrics and incident patterns alongside traditional fraud KPIs.",
    signals: [
      "Complaint volumes rising for specific customer segments.",
      "Regional spikes in false positives or blocked transactions.",
      "Difficulties explaining decisions when customers query them."
    ],
    frameworks: [
      {
        label: "NIST AI RMF – monitoring",
        summary: "Emphasises continuous monitoring for drift and unequal impact."
      },
      {
        label: "ISO 31000 – conduct risk",
        summary: "Supports consideration of customer harm within risk management."
      }
    ],
    questionTemplate: "fraudDrift"
  },
  {
    id: "S3",
    title: "Customer chatbot gives misleading guidance",
    tagline:
      "A customer-facing chatbot provides incomplete or misleading answers to vulnerable users.",
    cluster: "Social",
    primaryLens: "soc",
    riskBand: "Medium",
    systems: ["AI-002"],
    scores: { env: 3, soc: 4, eco: 3 },
    whatHappened:
      "Post-incident review shows that customers in distress received inconsistent advice about arrears or complaint routes via the chatbot.",
    whyItMatters:
      "Automated channels may be increasing friction for people who most need reliable, empathetic support.",
    whoAffected:
      "Vulnerable customers, customer service staff, complaints and regulatory teams.",
    interpretation:
      "Social exposure is high; economic exposure is moderate through remediation and complaint handling; environmental exposure is low.",
    teachingMoment:
      "This scenario blends survey preferences for case studies and interactive learning by focusing on a tangible, human-impact issue.",
    signals: [
      "Spikes in complaints referencing chatbot conversations.",
      "Evidence of customers going in circles without reaching a human agent.",
      "Regulator or ombudsman interest in digital channel behaviour."
    ],
    frameworks: [
      {
        label: "EU AI Act – limited-risk transparency",
        summary: "Requires clear disclosure when users interact with AI systems in many contexts."
      },
      {
        label: "Consumer protection law",
        summary: "Expects fair, clear and not misleading communication with customers."
      }
    ],
    questionTemplate: "chatbot"
  },
  {
    id: "S4",
    title: "Opaque credit decisions trigger complaints",
    tagline:
      "Customers struggle to understand why credit applications were declined.",
    cluster: "Social",
    primaryLens: "soc",
    riskBand: "Medium",
    systems: ["AI-001"],
    scores: { env: 2, soc: 4, eco: 4 },
    whatHappened:
      "Complaints and social media posts highlight confusion about credit decisions. Documentation for the scoring model is highly technical and not customer-facing.",
    whyItMatters:
      "Lack of transparency undermines trust and may breach expectations around explainability and fairness.",
    whoAffected:
      "Applicants for credit, customer support teams and reputation managers.",
    interpretation:
      "Social and economic exposure rise together: the scenario connects fairness to revenue and trust.",
    teachingMoment:
      "This example supports learning about EU AI Act high-risk requirements and GDPR rights regarding automated decisions.",
    signals: [
      "Increase in credit-related complaints citing 'unfair' or 'unclear' decisions.",
      "Low usage of appeals processes, suggesting barriers to challenge.",
      "Difficulty mapping technical documentation to customer-facing language."
    ],
    frameworks: [
      {
        label: "EU AI Act – credit scoring high-risk",
        summary: "Requires risk management, transparency and human oversight for high-risk systems."
      },
      {
        label: "GDPR – profiling transparency",
        summary: "Supports rights to meaningful information about automated decisions."
      }
    ],
    questionTemplate: "creditTransparency"
  },

  // ECONOMIC (4)
  {
    id: "Ec1",
    title: "Downturn stresses credit portfolio",
    tagline:
      "Macro-economic deterioration exposes weaknesses in AI credit risk models.",
    cluster: "Economic",
    primaryLens: "eco",
    riskBand: "High",
    systems: ["AI-001"],
    scores: { env: 3, soc: 3, eco: 5 },
    whatHappened:
      "Economic conditions worsen faster than expected. Default rates exceed model scenarios, challenging the reliability of AI-driven risk estimates.",
    whyItMatters:
      "Capital planning, risk appetite and IFRS S2 scenario narratives may all need to be revisited.",
    whoAffected:
      "Risk committees, finance teams, investors and customers whose access to credit may tighten.",
    interpretation:
      "Economic exposure is very high; social and environmental exposures are secondary but present via access-to-credit and transition finance decisions.",
    teachingMoment:
      "This scenario reinforces that AI is not a crystal ball and Boards must challenge underlying assumptions and scenario coverage.",
    signals: [
      "Observed defaults systematically higher than model projections.",
      "Frequent model recalibrations or overrides.",
      "Tension between frontline pressure to lend and risk appetite."
    ],
    frameworks: [
      {
        label: "IFRS 9 / IFRS S2 – credit losses & climate",
        summary: "Connects expected credit losses with climate and macro scenarios."
      },
      {
        label: "ISO 31000 – risk appetite",
        summary: "Supports aligning AI-driven risk estimates with Board risk appetite."
      }
    ],
    questionTemplate: "climateStress"
  },
  {
    id: "Ec2",
    title: "Fraud attack wave increases false positives",
    tagline:
      "A new fraud pattern triggers conservative model updates, blocking many legitimate transactions.",
    cluster: "Economic",
    primaryLens: "eco",
    riskBand: "High",
    systems: ["AI-003"],
    scores: { env: 2, soc: 4, eco: 5 },
    whatHappened:
      "To respond to new attack patterns, thresholds are tightened, causing a surge in false positives and customer disruption.",
    whyItMatters:
      "Losses may be reduced but at the cost of customer experience, complaints and lost revenue.",
    whoAffected:
      "Customers, fraud operations teams, merchants and senior leaders focused on growth.",
    interpretation:
      "Economic and social exposures both rise. The case illustrates trade-offs between fraud control and relationship damage.",
    teachingMoment:
      "The scenario makes explicit the need to consider social and economic metrics together when tuning high-risk models.",
    signals: [
      "Spike in blocked transactions and manual review workload.",
      "Change in fraud rules or thresholds with limited consultation.",
      "Increased complaints about 'embarrassing' payment declines."
    ],
    frameworks: [
      {
        label: "NIST AI RMF – measurement & monitoring",
        summary: "Promotes balanced performance and harm-focused metrics."
      },
      {
        label: "UK Corporate Governance Code – operational resilience",
        summary: "Expects Boards to oversee resilience and customer impact of key controls."
      }
    ],
    questionTemplate: "fraudDrift"
  },
  {
    id: "Ec3",
    title: "IT ticket model misroutes critical incidents",
    tagline:
      "Automation in IT service management increases resolution time for some critical tickets.",
    cluster: "Economic",
    primaryLens: "eco",
    riskBand: "Medium",
    systems: ["AI-006"],
    scores: { env: 3, soc: 3, eco: 4 },
    whatHappened:
      "An AI model prioritises tickets based on historical impact. New types of incidents are misclassified and routed incorrectly.",
    whyItMatters:
      "Service outages last longer, affecting customer channels and internal productivity.",
    whoAffected:
      "IT teams, internal users, external customers and potentially regulators if outages hit critical services.",
    interpretation:
      "Economic exposure is high due to downtime and lost productivity; social exposure is moderate through customer frustration.",
    teachingMoment:
      "This case helps Boards see that even 'minimal-risk' tools can create material operational and financial risk.",
    signals: [
      "Increase in incident duration for specific ticket types.",
      "Workarounds emerging where staff bypass the automated system.",
      "Root-cause reviews citing misclassification or outdated training data."
    ],
    frameworks: [
      {
        label: "ISO 20000 / ITIL",
        summary: "Frames expectations around service management and incident handling."
      },
      {
        label: "ISO 31000 – operational risk",
        summary: "Encourages treatment of automation errors as part of operational risk."
      }
    ],
    questionTemplate: "fraudDrift"
  },
  {
    id: "Ec4",
    title: "Supplier ESG scores mis-state climate risk",
    tagline:
      "AI-assisted ESG scoring over-penalises some suppliers and underestimates others.",
    cluster: "Economic",
    primaryLens: "eco",
    riskBand: "Medium",
    systems: ["AI-009"],
    scores: { env: 5, soc: 4, eco: 4 },
    whatHappened:
      "A scoring model relies heavily on incomplete or proxy data. Some strategic suppliers receive poor scores, while others with limited disclosure appear low-risk.",
    whyItMatters:
      "Procurement decisions and climate disclosures may be based on misleading risk signals, affecting both resilience and reputation.",
    whoAffected:
      "Suppliers, procurement teams, sustainability teams and the Board via reported ESG metrics.",
    interpretation:
      "Environmental and economic exposures are both high; social exposure arises through knock-on effects on workers and communities.",
    teachingMoment:
      "This scenario connects supplier scoring directly to IFRS S2 and GRI reporting, making the frameworks feel concrete.",
    signals: [
      "Supplier disputes about scores and underlying data.",
      "Large differences between internal assessments and third-party ratings.",
      "Difficulty explaining ESG scores to external stakeholders."
    ],
    frameworks: [
      {
        label: "IFRS S2 – value chain risk",
        summary: "Highlights climate-related risks within the supply chain."
      },
      {
        label: "GRI Standards – supplier ESG metrics",
        summary: "Guides consistent reporting on supplier environmental and social performance."
      }
    ],
    questionTemplate: "supplierESG"
  },

  // INTEGRATED E–S–Ec (4)
  {
    id: "I1",
    title: "New credit model improves accuracy but increases carbon and fairness risk",
    tagline:
      "A high-performing model improves default prediction but consumes more energy and shows fairness concerns.",
    cluster: "Integrated E–S–Ec",
    primaryLens: "mixed",
    riskBand: "High",
    systems: ["AI-001"],
    scores: { env: 4, soc: 4, eco: 5 },
    whatHappened:
      "A new model significantly reduces credit losses but is more computationally intensive and shows emerging fairness disparities.",
    whyItMatters:
      "The organisation faces a classic trade-off: strong financial performance versus environmental footprint and social equity.",
    whoAffected:
      "Customers, sustainability teams, regulators and risk committees.",
    interpretation:
      "All three E–S–Ec dimensions move at once, forcing Boards to confront trade-offs rather than viewing risks in isolation.",
    teachingMoment:
      "This integrated scenario addresses survey responses where participants found all three dimensions equally challenging.",
    signals: [
      "Improved loss metrics but rising complaints or fairness indicators.",
      "Higher energy and compute costs associated with the new model.",
      "Difficult discussions about whether to slow or accelerate rollout."
    ],
    frameworks: [
      {
        label: "EU AI Act – high-risk credit scoring",
        summary: "Requires robust governance, fairness and transparency for credit models."
      },
      {
        label: "IFRS S2 – climate-linked credit exposure",
        summary: "Connects climate considerations to lending and capital decisions."
      }
    ],
    questionTemplate: "integratedTradeoff"
  },
  {
    id: "I2",
    title: "Legacy dialler retired and logged as a learning case",
    tagline:
      "A legacy collections model is switched off due to fairness concerns, with mixed economic impact.",
    cluster: "Integrated E–S–Ec",
    primaryLens: "mixed",
    riskBand: "Medium",
    systems: ["AI-010"],
    scores: { env: 2, soc: 4, eco: 3 },
    whatHappened:
      "The organisation retires an old dialler model after internal review highlights limited explainability and potential unfair targeting.",
    whyItMatters:
      "Retirement reduces ongoing risk but raises questions about historical harm, technical debt and future design standards.",
    whoAffected:
      "Customers previously contacted via the dialler, collections teams, compliance and audit.",
    interpretation:
      "Social exposure remains elevated due to historical decisions; environmental and economic exposure may reduce as legacy systems are decommissioned.",
    teachingMoment:
      "The case encourages Boards to treat retired models as learning assets rather than disappearing history.",
    signals: [
      "Audit findings about weak documentation or monitoring.",
      "Evidence of discomfort from staff about past practices.",
      "Opportunities to consolidate legacy systems and data stores."
    ],
    frameworks: [
      {
        label: "OECD AI Principles – accountability",
        summary: "Encourages learning from past AI deployments and addressing harms."
      },
      {
        label: "GDPR – data minimisation",
        summary: "Supports deleting or archiving legacy data appropriately after retirement."
      }
    ],
    questionTemplate: "legacyDialler"
  },
  {
    id: "I3",
    title: "Document classifier in pipeline reveals early E–S–Ec risks",
    tagline:
      "A pilot document classifier shows potential confidentiality and bias issues before go-live.",
    cluster: "Integrated E–S–Ec",
    primaryLens: "mixed",
    riskBand: "Medium",
    systems: ["AI-008"],
    scores: { env: 3, soc: 4, eco: 3 },
    whatHappened:
      "Testing reveals that some sensitive legal documents are misclassified and that the model struggles with certain languages and formats.",
    whyItMatters:
      "There is a risk of misrouting confidential information and creating unequal service across regions.",
    whoAffected:
      "Legal teams, information security, staff relying on accurate routing and potentially clients.",
    interpretation:
      "Social and governance exposures are prominent, with economic and environmental implications through rework and extra processing.",
    teachingMoment:
      "This scenario demonstrates why pipeline systems need structured E–S–Ec review before they move into production.",
    signals: [
      "Test data shows misclassification of privileged or sensitive documents.",
      "Performance varies significantly by language or region.",
      "Questions from legal and security teams about residual risk."
    ],
    frameworks: [
      {
        label: "ISO 27001 – information security",
        summary: "Frames expectations for handling confidential information."
      },
      {
        label: "ISO/IEC 42001 – design-time controls",
        summary: "Encourages early-stage risk assessment for AI use cases."
      }
    ],
    questionTemplate: "integratedTradeoff"
  },
  {
    id: "I4",
    title: "Supplier ESG scoring changes reshape portfolio risk",
    tagline:
      "Updated ESG models improve environmental metrics but create new economic concentration risks.",
    cluster: "Integrated E–S–Ec",
    primaryLens: "mixed",
    riskBand: "Medium",
    systems: ["AI-009"],
    scores: { env: 5, soc: 4, eco: 4 },
    whatHappened:
      "Improved ESG scoring leads to rapid disengagement from some suppliers and deeper reliance on a smaller number of 'green leaders'.",
    whyItMatters:
      "Environmental metrics strengthen, but business continuity and bargaining power may be weakened.",
    whoAffected:
      "Suppliers, communities, procurement teams, customers and investors tracking ESG performance.",
    interpretation:
      "Environmental scores improve while economic and social risks shift, illustrating portfolio-level trade-offs.",
    teachingMoment:
      "This scenario aligns with literature on unintended consequences of ESG optimisation and highlights the need for integrated Board oversight.",
    signals: [
      "Rapid changes in supplier mix driven by ESG scores.",
      "Concerns from risk teams about concentration or geographic exposure.",
      "Diverging narratives between sustainability and procurement teams."
    ],
    frameworks: [
      {
        label: "IFRS S2 – supply chain dependencies",
        summary: "Requires visibility of climate-related risks in the value chain."
      },
      {
        label: "OECD Due Diligence – responsible business",
        summary: "Supports thoughtful transitions rather than abrupt exits from suppliers."
      }
    ],
    questionTemplate: "supplierESG"
  }
];
  const glossaryEntries = [
  {
    term: "High-risk AI (EU AI Act)",
    definition:
      "Systems that can significantly affect fundamental rights or safety, such as credit scoring or employment screening, requiring strict governance and oversight."
  },
  {
    term: "E–S–Ec lens",
    definition:
      "An integrated view across Environmental, Social and Economic dimensions to avoid siloed decision-making and surface trade-offs."
  },
  {
    term: "Stress testing",
    definition:
      "Exploring how portfolios or systems behave under severe but plausible scenarios, often used for climate and economic risk."
  },
  {
    term: "Drift",
    definition:
      "When model performance degrades over time because real-world data no longer resembles the training data."
  },
  {
    term: "Fairness audit",
    definition:
      "A structured review of model outputs across groups to identify potential discrimination or unequal impacts."
  },
  {
    term: "Scope 3 emissions",
    definition:
      "Indirect emissions that occur in the value chain, such as from suppliers and customers, often material for AI-heavy organisations."
  },
  {
    term: "Technical debt",
    definition:
      "Design or implementation shortcuts that create future cost and risk when systems need to be changed or audited."
  },
  {
    term: "Operational resilience",
    definition:
      "The ability to prevent, adapt and recover from disruption while continuing to provide critical services."
  }
];

  AIR.data.aiSystems = aiSystems;
  AIR.data.incidents = incidents;
  AIR.data.questionTemplates = questionTemplates;
  AIR.data.scenarios = scenarios;
  AIR.data.glossaryEntries = glossaryEntries;

  // ---- Helpers ----
  function el(id) { return document.getElementById(id); }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
  }

  function impactBadge(level) {
    if (level === 'high') return 'impact-high';
    if (level === 'med') return 'impact-med';
    return 'impact-low';
  }

  // =====================================================
  // RISK VIEW
  // =====================================================
  /* risk-controls.js — Integrated Risk & Controls + Education Mode (front-end only)
   - Keeps data content exactly (incidents, scenarios, question templates, glossary) from the pens
   - Does NOT modify core header/footer behaviour (app-core.js)
   - Renders required UI into existing containers if markup differs between pens and integrated shell
*/

(() => {
  'use strict';

  // =========================
  // Shared data (from pens)
  // =========================

  // ---- AI systems map (aligned with Inventory) ----
  const aiSystems = {
    "AI-001": "Customer Credit Scoring Engine",
    "AI-002": "Contact Centre Chatbot",
    "AI-003": "Fraud Transaction Anomaly Detector",
    "AI-004": "HR Candidate Screening Tool",
    "AI-005": "Marketing Propensity Model",
    "AI-006": "IT Ticket Prioritisation Model",
    "AI-007": "Energy Optimisation for Data Centre",
    "AI-008": "Document Classification Assistant",
    "AI-009": "Supplier ESG Risk Scoring",
    "AI-010": "Legacy Collections Dialler Model"
  };

  // ---- Incident dataset ----
  // category: "Incident" | "Near miss"
  // severity: "High" | "Medium" | "Low"
  // type: Data & privacy | Fairness & ethics | Operational resilience | Sustainability reporting | Conduct & culture
  // impacts: env/soc/eco: 'high'|'med'|'low'
  const incidents = [
    {
      id: "INC-001",
      title: "Fairness concerns in HR screening pilot",
      category: "Incident",
      severity: "High",
      type: "Fairness & ethics",
      date: "2025-05-12",
      systems: ["AI-004"],
      summary:
        "Early use of the HR Candidate Screening Tool revealed lower pass-through rates for candidates from certain universities and regions.",
      impact:
        "Raised risk of indirect discrimination and reputational damage, with potential legal implications if left unaddressed.",
      response:
        "Pilot restricted to one business unit, fairness metrics introduced, and an external bias audit commissioned before any scale-up.",
      residualRisk: "Medium",
      env: "low",
      soc: "high",
      eco: "med",
      strengthenedControls: true
    },
    {
      id: "INC-002",
      title: "Fraud model drift increases false positives",
      category: "Incident",
      severity: "High",
      type: "Operational resilience",
      date: "2025-03-20",
      systems: ["AI-003"],
      summary:
        "A tightening of fraud thresholds after a new attack pattern led to a surge in false positives and blocked transactions.",
      impact:
        "Short-term fraud losses were contained but complaints increased sharply and some customers moved providers.",
      response:
        "Thresholds adjusted, manual review expanded temporarily and new drift-monitoring alerts added to the control framework.",
      residualRisk: "Medium",
      env: "low",
      soc: "high",
      eco: "high",
      strengthenedControls: true
    },
    {
      id: "INC-003",
      title: "Opaque credit decisions trigger complaints",
      category: "Incident",
      severity: "Medium",
      type: "Conduct & culture",
      date: "2025-04-05",
      systems: ["AI-001"],
      summary:
        "Customers reported confusion about declined credit applications, with limited explanation provided through existing processes.",
      impact:
        "Increased complaints and potential scrutiny under EU AI Act and GDPR transparency expectations.",
      response:
        "Plain-language explanation templates and appeal routes were introduced, and documentation was aligned with AI inventory records.",
      residualRisk: "Medium",
      env: "low",
      soc: "high",
      eco: "med",
      strengthenedControls: true
    },
    {
      id: "INC-004",
      title: "Chatbot gives inconsistent arrears guidance",
      category: "Incident",
      severity: "Medium",
      type: "Conduct & culture",
      date: "2025-02-10",
      systems: ["AI-002"],
      summary:
        "The Contact Centre Chatbot provided inconsistent answers to customers in financial difficulty about payment holidays and complaint routes.",
      impact:
        "Trust in digital channels was affected and vulnerable customers risked receiving poorer outcomes than via phone-based support.",
      response:
        "Sensitive topics were routed to humans by default, content was rewritten with compliance review and hallucination monitoring was added.",
      residualRisk: "Low",
      env: "low",
      soc: "high",
      eco: "med",
      strengthenedControls: true
    },
    {
      id: "INC-005",
      title: "Telemetry gaps understate AI energy usage",
      category: "Incident",
      severity: "Medium",
      type: "Sustainability reporting",
      date: "2025-06-01",
      systems: ["AI-007"],
      summary:
        "Energy monitoring for some GPU-intensive optimisation workloads was incomplete, leading to under-reporting of emissions.",
      impact:
        "Risk that climate disclosures under IFRS S2 and GRI were not fully accurate, undermining confidence in net-zero claims.",
      response:
        "Telemetry coverage was extended, vendor data cross-checked and sustainability teams integrated AI workloads into assurance plans.",
      residualRisk: "Medium",
      env: "high",
      soc: "low",
      eco: "med",
      strengthenedControls: true
    },
    {
      id: "NM-001",
      title: "Near miss: misrouted privileged legal documents",
      category: "Near miss",
      severity: "Medium",
      type: "Data & privacy",
      date: "2025-05-08",
      systems: ["AI-008"],
      summary:
        "Testing of the Document Classification Assistant identified occasional misclassification of privileged legal documents before go-live.",
      impact:
        "If unaddressed, this could have led to confidentiality breaches and regulatory findings under data protection and professional standards.",
      response:
        "Additional rule-based checks were added for highly confidential documents and the deployment was postponed pending further assurance.",
      residualRisk: "Low",
      env: "low",
      soc: "med",
      eco: "med",
      strengthenedControls: true
    },
    {
      id: "NM-002",
      title: "Near miss: collections dialler flagged as unfair",
      category: "Near miss",
      severity: "Medium",
      type: "Fairness & ethics",
      date: "2024-11-15",
      systems: ["AI-010"],
      summary:
        "Internal review of the Legacy Collections Dialler Model highlighted limited explainability and targeting concerns, prompting deeper investigation.",
      impact:
        "Board and executive teams recognised that historic practice may not align with current responsible AI expectations.",
      response:
        "The model was retired and documented as a negative case study for AI training; data retention and remediation options are under review.",
      residualRisk: "Medium",
      env: "low",
      soc: "high",
      eco: "med",
      strengthenedControls: true
    },
    {
      id: "NM-003",
      title: "Near miss: supplier ESG scoring challenge",
      category: "Near miss",
      severity: "Medium",
      type: "Sustainability reporting",
      date: "2025-07-03",
      systems: ["AI-009"],
      summary:
        "A strategic supplier challenged its ESG score, revealing heavy reliance on proxy data and inconsistent disclosure assumptions.",
      impact:
        "Potential misalignment between reported supply-chain climate risk and underlying reality; risk of misinformed procurement decisions.",
      response:
        "Methodology was revised, proxy use disclosed and a process introduced for suppliers to review and challenge AI-derived scores.",
      residualRisk: "Medium",
      env: "high",
      soc: "med",
      eco: "med",
      strengthenedControls: true
    },
    {
      id: "NM-004",
      title: "Near miss: IT ticket model misroutes major incident",
      category: "Near miss",
      severity: "Low",
      type: "Operational resilience",
      date: "2025-01-05",
      systems: ["AI-006"],
      summary:
        "An internal review of incident logs showed that one major outage was initially routed as a low-priority ticket by the IT Ticket Prioritisation Model.",
      impact:
        "The issue was caught by human override before significant customer impact, but highlighted a gap in training data for newer incident types.",
      response:
        "Training data was updated, major-incident rules were strengthened and critical tickets now bypass the model during early triage.",
      residualRisk: "Low",
      env: "low",
      soc: "med",
      eco: "med",
      strengthenedControls: true
    }
  ];

  // ---- Question templates (reused across scenarios) ----
  const questionTemplates = {
    climateStress: {
      beginner: {
        env: [
          "Are the climate scenarios and emissions assumptions clearly documented and independently reviewed?",
          "How are climate-related environmental assumptions translated into credit or capital decision rules?"
        ],
        soc: [
          "Could climate-adjusted decisions disproportionately affect certain regions or customer groups?",
          "Is there a clear process for affected customers or communities to challenge scenario-based decisions?"
        ],
        eco: [
          "How sensitive are key financial metrics to AI-generated climate stress tests?",
          "Do Board packs show a clear link between stress-test outputs and lending or portfolio strategy changes?"
        ],
        gov: [
          "Which committee owns oversight of climate-augmented models across the business?",
          "Are roles and responsibilities for validating climate data, models and disclosures clearly assigned?"
        ]
      },
      expert: {
        env: [
          "Do scenario designs align with the latest science-based pathways and internal net-zero commitments?",
          "Are limitations of the AI models explicitly disclosed in climate and risk reports?"
        ],
        soc: [
          "Has distributional impact analysis been run to identify groups over-exposed to climate-driven constraints?",
          "Are trade-offs between financial resilience and financial inclusion transparently discussed?"
        ],
        eco: [
          "How are scenario outputs reflected in risk appetite, capital planning and IFRS S2 disclosures?",
          "Are reverse stress tests used to explore tail scenarios where climate AI models may fail?"
        ],
        gov: [
          "Does the AI governance framework explicitly integrate climate models and decision points?",
          "Have external assurance providers reviewed both the model and the surrounding governance?"
        ]
      }
    },

    hrBias: {
      beginner: {
        env: [
          "Do recruitment and work-location assumptions avoid unnecessary travel or environmental burdens?",
          "Are remote or hybrid options considered when defining 'suitable candidates'?"
        ],
        soc: [
          "How has the screening tool been tested for bias across gender, ethnicity, disability and socio-economic background?",
          "Is there a clear, accessible route for candidates to challenge an automated screening outcome?"
        ],
        eco: [
          "What efficiency gains are expected and how are they balanced against potential social harm or legal risk?",
          "Could reputational damage from biased outcomes outweigh operational benefits?"
        ],
        gov: [
          "Has the pilot been formally approved by an ethics or risk committee?",
          "Which Board committee receives updates on AI use in HR and recruitment?"
        ]
      },
      expert: {
        env: [
          "Are sustainability and EDI objectives aligned in workforce planning, not pulling in opposite directions?",
          "Do remote-first policies interact with AI screening in ways that may create new inequities?"
        ],
        soc: [
          "Are intersectional fairness metrics monitored over time, not just at a single launch point?",
          "Has an external audit or challenge review been commissioned before scaling beyond pilot?"
        ],
        eco: [
          "Are analyses performed on potential legal costs, remediation and brand damage from biased decisions?",
          "Is there a contingency plan if the tool must be paused or rolled back at short notice?"
        ],
        gov: [
          "How is HR AI integrated into the wider AI risk register and Board reporting?",
          "Are staff and unions consulted about automated screening and decision support?"
        ]
      }
    },

    fraudDrift: {
      beginner: {
        env: [
          "Could more efficient model architectures reduce compute and monitoring load for fraud detection?",
          "Are data retention and logging policies proportionate to both fraud control and environmental goals?"
        ],
        soc: [
          "Are certain customer groups disproportionately affected by false positives or blocked transactions?",
          "Is it easy for customers to get errors fixed and regain access when fraud controls misfire?"
        ],
        eco: [
          "What is the estimated revenue and churn impact of current false positive rates?",
          "Is there a clear trigger for pausing or rolling back the model when drift is detected?"
        ],
        gov: [
          "Who has the authority to make emergency changes to fraud models when issues arise?",
          "Are fraud model incidents logged and escalated through formal risk and incident channels?"
        ]
      },
      expert: {
        env: [
          "Can model compression or architecture changes support both resilience and lower carbon intensity?",
          "Is there an explicit link between data retention horizons and sustainability objectives?"
        ],
        soc: [
          "Is complaints data analysed regularly for patterns of systemic unfairness?",
          "Do vulnerable customers receive additional protections when fraud controls are tightened?"
        ],
        eco: [
          "Are trade-offs between fraud losses and customer attrition quantified and discussed at Board level?",
          "How quickly can model parameters be tuned or rules adjusted without undermining control effectiveness?"
        ],
        gov: [
          "Does the risk committee receive regular metrics on false positives, overrides and drift alerts?",
          "Is independent validation of fraud models clearly separated from development teams?"
        ]
      }
    },

    chatbot: {
      beginner: {
        env: [
          "Is digital self-service positioned as part of a sustainable channel strategy, not the only option?",
          "Are there triggers where the system promotes lower-carbon options (e.g. digital statements) without coercion?"
        ],
        soc: [
          "Does the chatbot clearly disclose that it is an automated system?",
          "Is there a simple route for customers, especially vulnerable ones, to escalate to a human?"
        ],
        eco: [
          "What business metrics does the chatbot optimise for (call deflection, satisfaction, complaints)?",
          "Are any financial incentives encouraging over-automation at the expense of quality or fairness?"
        ],
        gov: [
          "Who owns content quality and hallucination risk in chatbot responses?",
          "Are scripts and training data reviewed regularly for harmful or misleading patterns?"
        ]
      },
      expert: {
        env: [
          "Could channel shifts driven by the chatbot change the organisation’s environmental footprint?",
          "Are digital inclusion and sustainability strategies aligned in customer service design?"
        ],
        soc: [
          "Is sentiment and complaint data monitored to detect where chatbot behaviour damages trust?",
          "Do governance processes ensure accessible design for disabled or neurodivergent users?"
        ],
        eco: [
          "Are scenario analyses run where chatbot errors lead to financial loss or regulatory challenge?",
          "Is there a defined risk appetite for automation error rates vs cost savings?"
        ],
        gov: [
          "Is the chatbot included in the AI inventory with clear risk tiering and controls?",
          "Do Board reports explicitly cover automation risks in customer support?"
        ]
      }
    },

    creditTransparency: {
      beginner: {
        env: [
          "Do credit policies consider climate-sensitive sectors or regions in a transparent way?",
          "Are environment-related limits or exclusions explained clearly to affected customers?"
        ],
        soc: [
          "How are customers informed about automated elements in credit decisions?",
          "Is there an accessible appeals process where customers can request human review?"
        ],
        eco: [
          "How do model changes affect approval rates, loss rates and revenue?",
          "Are there safeguards against reinforcing historical exclusion patterns?"
        ],
        gov: [
          "Does the Board receive regular updates on fairness and complaints related to credit decisions?",
          "Are responsibilities for model governance and customer fairness clearly assigned?"
        ]
      },
      expert: {
        env: [
          "How do climate and transition risks feed into credit models without masking fairness issues?",
          "Are local environmental exposures reflected consistently across the portfolio?"
        ],
        soc: [
          "Are distributional effects of credit policy changes analysed across demographic segments?",
          "Has any external scrutiny or regulator guidance on algorithmic credit been addressed?"
        ],
        eco: [
          "Do Board-level dashboards connect fairness indicators with financial outcomes?",
          "Are alternative strategies considered where financial and fairness goals can both improve?"
        ],
        gov: [
          "Is AI-driven credit scoring mapped explicitly to EU AI Act high-risk obligations?",
          "Do independent assurance functions review both model performance and customer fairness data?"
        ]
      }
    },

    energyOptimisation: {
      beginner: {
        env: [
          "How are energy and emissions savings from optimisation measured and reported?",
          "Is there a documented threshold beyond which optimisation should not go?"
        ],
        soc: [
          "Could performance degradation affect critical services used by vulnerable customers or staff?",
          "Is there a clear channel for staff to report issues linked to the optimiser?"
        ],
        eco: [
          "What is the financial value of energy savings and how volatile is it?",
          "Have potential outage costs been weighed against optimisation benefits?"
        ],
        gov: [
          "Who signs off changes to optimisation settings and safeguards?",
          "Is the optimiser included in operational resilience and disaster recovery tests?"
        ]
      },
      expert: {
        env: [
          "Are emissions factors updated regularly to avoid under- or over-stating carbon benefits?",
          "Could optimisation outputs support external climate commitments and IFRS S2 disclosures?"
        ],
        soc: [
          "Is service quality monitored for equity across regions and user groups when optimisation changes are made?",
          "Do staff understand when and how to override the optimiser safely?"
        ],
        eco: [
          "Are stress scenarios run where optimisation fails during peak demand events?",
          "How quickly can the organisation revert to a safe configuration if issues arise?"
        ],
        gov: [
          "Is this AI captured in the register of critical systems reviewed by the Board?",
          "Does internal audit test governance around AI-enabled optimisation decisions?"
        ]
      }
    },

    legacyDialler: {
      beginner: {
        env: [
          "Does decommissioning the legacy model enable consolidation of older, less efficient infrastructure?",
          "Are there environmental benefits from retiring associated systems or data centres?"
        ],
        soc: [
          "What is known about how different customer segments were treated by the legacy dialler?",
          "Have affected customers been identified and, where appropriate, remediated or contacted?"
        ],
        eco: [
          "Did the dialler materially impact collections performance, and what has changed since retirement?",
          "Could redesigned strategies achieve better outcomes with lower social risk?"
        ],
        gov: [
          "Is the retired model logged as a case study in AI training materials?",
          "Were governance gaps identified that must be closed before new collections tools go live?"
        ]
      },
      expert: {
        env: [
          "Can rationalisation of legacy technology contribute to broader sustainability and efficiency goals?",
          "Was there duplication of compute or infrastructure solely to support this model?"
        ],
        soc: [
          "Is long-term customer impact from legacy AI systematically reviewed?",
          "Are consumer advocates or regulators engaged when reflecting on historic harms?"
        ],
        eco: [
          "Are risk-adjusted returns being re-estimated without the dialler’s influence?",
          "Could regulatory scrutiny of historic practices still arise, and is the organisation prepared?"
        ],
        gov: [
          "Is there a formal pattern for how retired AI models are documented, archived and reviewed?",
          "Does the Board receive periodic retrospectives on retired AI systems and lessons learned?"
        ]
      }
    },

    supplierESG: {
      beginner: {
        env: [
          "Are environmental metrics consistently defined across suppliers and sectors?",
          "How are data gaps or proxy estimates handled and disclosed?"
        ],
        soc: [
          "Do scoring methods reflect social context in different regions, including labour standards and local regulation?",
          "Is there a transparent appeals process for suppliers to challenge their ESG data?"
        ],
        eco: [
          "Could sudden changes in scores disrupt critical supply chains or increase costs?",
          "Are engagement plans considered before exiting suppliers on ESG grounds?"
        ],
        gov: [
          "Who owns the methodology for supplier ESG scoring and how often is it reviewed?",
          "Are suppliers informed about how AI is used in ESG assessments?"
        ]
      },
      expert: {
        env: [
          "Are climate and environmental inputs aligned with science-based targets and sector pathways?",
          "How are Scope 3 emission estimates validated, challenged and improved over time?"
        ],
        soc: [
          "Has the organisation considered unintended consequences for communities if suppliers are exited quickly?",
          "Is there evidence of regional or market bias in ESG scores due to data availability?"
        ],
        eco: [
          "Do Board papers link supplier ESG risk to financial resilience and concentration risk?",
          "Are scenario analyses run on supply-chain disruption driven by ESG decisions?"
        ],
        gov: [
          "Is ESG scoring aligned with broader human rights and sustainability policies?",
          "Do assurance providers review AI components of ESG scoring, not just manual metrics?"
        ]
      }
    },

    integratedTradeoff: {
      beginner: {
        env: [
          "When a model improves performance, does the Board also see how it affects energy use or emissions?",
          "Are climate or resource implications factored into decisions to scale new AI systems?"
        ],
        soc: [
          "Who benefits and who may be disadvantaged when new AI models are deployed?",
          "Is there any early evidence that certain groups experience more friction, complaints or harm?"
        ],
        eco: [
          "Does the business case for new models include downside scenarios for incidents, fines or remediation?",
          "Are there clear triggers for pausing deployment if trade-offs become unacceptable?"
        ],
        gov: [
          "How are trade-offs documented and escalated to the Board?",
          "Do scenario reviews integrate Environmental, Social and Economic dimensions together, not in silos?"
        ]
      },
      expert: {
        env: [
          "Are portfolio-level metrics available showing cumulative environmental impact of AI systems?",
          "Is the organisation exploring design choices that improve E, S and Ec simultaneously, not sequentially?"
        ],
        soc: [
          "Are lived-experience or stakeholder panels involved when evaluating high-impact trade-offs?",
          "Is there evidence that Board decisions on AI align with the organisation’s public values and commitments?"
        ],
        eco: [
          "Are trade-off scenarios compared against alternative strategies with different risk/return profiles?",
          "Do AI investments explicitly reference risk appetite and capital allocation frameworks?"
        ],
        gov: [
          "Is there a documented method for resolving tensions between E, S and Ec objectives?",
          "Do Board minutes show how competing objectives were considered and resolved in practice?"
        ]
      }
    }
  };

  // ---- Scenarios (16) ----
// cluster: 'Environmental' | 'Social' | 'Economic' | 'Integrated E–S–Ec'
// primaryLens: 'env' | 'soc' | 'eco' | 'mixed'
const scenarios = [
  // ENVIRONMENTAL (4)
  {
    id: "E1",
    title: "LLM retraining spikes data-centre energy use",
    tagline:
      "A major retraining of language models drives a sharp increase in energy consumption and emissions.",
    cluster: "Environmental",
    primaryLens: "env",
    riskBand: "High",
    systems: ["AI-007", "AI-001"],
    scores: { env: 5, soc: 3, eco: 4 },
    whatHappened:
      "The organisation schedules full retraining of its large language models and credit-scoring models in a short window. Energy use, emissions and cloud costs rise significantly for the quarter.",
    whyItMatters:
      "Environmental exposure increases just as climate commitments and IFRS S2 reporting expectations tighten. The Board must understand how AI compute choices interact with net-zero plans.",
    whoAffected:
      "Technology teams, sustainability teams and external stakeholders who scrutinise climate disclosures, including investors and regulators.",
    interpretation:
      "Environmental risk spikes due to concentrated compute demand; social risk is moderate; economic risk rises through higher opex. The scenario teaches how model lifecycle decisions shape E–S–Ec exposure.",
    teachingMoment:
      "Survey results showed Environmental interpretation is hardest. This case illustrates how seemingly technical retraining choices can materially shift environmental and financial profiles.",
    signals: [
      "Quarter-on-quarter jump in data-centre or cloud energy usage.",
      "Increased climate footprint reported in emissions data.",
      "Pressure from sustainability and finance teams about AI compute plans."
    ],
    frameworks: [
      {
        label: "IFRS S2 – climate disclosures",
        summary: "Requires transparent reporting of climate-related risks, metrics and scenario resilience."
      },
      {
        label: "GRI 305 – emissions",
        summary: "Guides how organisations measure and report greenhouse gas emissions."
      },
      {
        label: "ISO/IEC 42001 – AI management",
        summary: "Links AI lifecycle decisions, such as retraining, to risk and control processes."
      }
    ],
    questionTemplate: "climateStress"
  },
  {
    id: "E2",
    title: "Heatwave stresses water-cooled data centre",
    tagline:
      "A regional heatwave exposes dependencies on water-intensive cooling for AI workloads.",
    cluster: "Environmental",
    primaryLens: "env",
    riskBand: "Medium",
    systems: ["AI-007"],
    scores: { env: 4, soc: 3, eco: 3 },
    whatHappened:
      "During an extended heatwave, water-cooled facilities struggle to maintain performance for AI optimisation and analytics workloads. Contingency cooling is activated, increasing both water and energy use.",
    whyItMatters:
      "The incident reveals environmental dependencies that were not fully captured in risk registers, connecting climate risk, resource use and operational resilience.",
    whoAffected:
      "Operations teams, sustainability reporting functions and downstream services that rely on the data centre for critical processing.",
    interpretation:
      "Environmental exposure is high because of water scarcity and energy use; economic and social exposure are moderate, driven by resilience and potential service disruption.",
    teachingMoment:
      "This scenario links climate physical risk to AI infrastructure, reinforcing that Environmental risk is not abstract but tied to concrete dependencies like water and cooling.",
    signals: [
      "Unusual activation of contingency cooling systems.",
      "Local authorities issuing drought or water restriction guidance.",
      "Performance or availability incidents coinciding with extreme weather."
    ],
    frameworks: [
      {
        label: "IFRS S2 – physical climate risk",
        summary: "Encourages disclosure of how physical climate events affect operations and assets."
      },
      {
        label: "ISO 31000 – risk management",
        summary: "Supports integrating climate-linked infrastructure dependencies into risk registers."
      }
    ],
    questionTemplate: "energyOptimisation"
  },
  {
    id: "E3",
    title: "Telemetry gaps mis-state AI energy footprint",
    tagline:
      "Incomplete monitoring underestimates the energy and emissions associated with AI workloads.",
    cluster: "Environmental",
    primaryLens: "env",
    riskBand: "Medium",
    systems: ["AI-007"],
    scores: { env: 4, soc: 2, eco: 3 },
    whatHappened:
      "The organisation discovers that some GPU-intensive AI workloads were not fully captured in energy dashboards, leading to under-reporting of emissions.",
    whyItMatters:
      "Understated emissions compromise credibility of climate disclosures and net-zero claims, risking reputational and regulatory scrutiny.",
    whoAffected:
      "Sustainability teams, internal audit, investors and regulators who rely on accurate emissions data.",
    interpretation:
      "Environmental risk is high because reported metrics diverge from reality; economic risk is moderate through potential restatement and assurance costs.",
    teachingMoment:
      "Boards often see clean charts but not the telemetry behind them. This scenario underlines the need for assurance over AI-related environmental metrics.",
    signals: [
      "Inconsistencies between vendor and internal energy reports.",
      "Audit findings about data completeness in emissions calculations.",
      "Difficulty reconciling AI workload growth with flat emissions figures."
    ],
    frameworks: [
      {
        label: "GRI 305 – data quality",
        summary: "Emphasises reliable measurement methods and transparent assumptions."
      },
      {
        label: "IFRS S2 – metrics and targets",
        summary: "Requires robust metrics to support climate-related disclosures."
      }
    ],
    questionTemplate: "energyOptimisation"
  },
  {
    id: "E4",
    title: "Model tuning increases inference energy per transaction",
    tagline:
      "A performance-optimised model runs faster but consumes more energy per decision.",
    cluster: "Environmental",
    primaryLens: "env",
    riskBand: "Medium",
    systems: ["AI-001", "AI-003"],
    scores: { env: 4, soc: 3, eco: 4 },
    whatHappened:
      "To reduce latency, engineers deploy a larger, more complex model for fraud and credit decisions. Individual inferences become more energy-intensive.",
    whyItMatters:
      "The organisation achieves performance gains but increases environmental impact per transaction, challenging the idea that optimisation is always beneficial.",
    whoAffected:
      "Customers who experience smoother services, sustainability teams responsible for climate metrics and technology budget owners.",
    interpretation:
      "Economic and environmental exposure both rise; social exposure is moderate. The scenario teaches Boards to question single-metric optimisation.",
    teachingMoment:
      "This scenario is designed to surface E–S–Ec trade-offs that are often hidden inside technical optimisation decisions.",
    signals: [
      "Improved latency and satisfaction scores alongside rising energy usage.",
      "Tension between technology, finance and sustainability objectives.",
      "Lack of design-stage discussion of energy implications."
    ],
    frameworks: [
      {
        label: "ISO/IEC 42001 – design controls",
        summary: "Encourages considering sustainability in AI design and optimisation choices."
      },
      {
        label: "NIST AI RMF – trade-off analysis",
        summary: "Supports structured evaluation of competing system objectives."
      }
    ],
    questionTemplate: "integratedTradeoff"
  },

  // SOCIAL (4)
  {
    id: "S1",
    title: "Bias signals in HR screening pilot",
    tagline:
      "An AI CV-screening pilot shows patterns that may disadvantage certain groups.",
    cluster: "Social",
    primaryLens: "soc",
    riskBand: "High",
    systems: ["AI-004"],
    scores: { env: 2, soc: 5, eco: 3 },
    whatHappened:
      "Early analysis of the HR screening pilot suggests lower pass-through rates for candidates from specific universities and regions.",
    whyItMatters:
      "The system may entrench historical bias and damage trust in recruitment, with legal and reputational implications.",
    whoAffected:
      "Prospective candidates, particularly from under-represented backgrounds, HR teams and hiring managers.",
    interpretation:
      "Social exposure is very high; economic exposure is moderate; environmental exposure is low. The scenario teaches Boards to interrogate fairness metrics before scaling pilots.",
    teachingMoment:
      "Survey responses showed strong demand for examples and case studies. This scenario uses a realistic HR context to make fairness risks concrete.",
    signals: [
      "Uneven pass-through rates across demographic segments.",
      "Concerns raised by HR, staff networks or candidates.",
      "Unclear communication about the role of automation in screening."
    ],
    frameworks: [
      {
        label: "EU AI Act – employment high-risk",
        summary: "Classifies many AI recruitment tools as high-risk, requiring strong governance."
      },
      {
        label: "GDPR – automated decisions",
        summary: "Triggers transparency and contestability rights where automated screening is used."
      }
    ],
    questionTemplate: "hrBias"
  },
  {
    id: "S2",
    title: "Fraud model shows demographic disparities",
    tagline:
      "An anomaly detector flags a higher proportion of transactions for certain groups.",
    cluster: "Social",
    primaryLens: "soc",
    riskBand: "High",
    systems: ["AI-003"],
    scores: { env: 2, soc: 4, eco: 5 },
    whatHappened:
      "Monitoring reveals that card blocks and secondary checks are more frequent for customers in certain postcodes and age bands.",
    whyItMatters:
      "The system may be amplifying existing inequalities, with significant impact on customer trust and retention.",
    whoAffected:
      "Customers whose payments are disrupted, contact centre staff handling complaints and compliance teams.",
    interpretation:
      "Social and economic exposure are both high. This scenario links fairness concerns to financial and conduct risk.",
    teachingMoment:
      "It demonstrates why Boards must see fairness metrics and incident patterns alongside traditional fraud KPIs.",
    signals: [
      "Complaint volumes rising for specific customer segments.",
      "Regional spikes in false positives or blocked transactions.",
      "Difficulties explaining decisions when customers query them."
    ],
    frameworks: [
      {
        label: "NIST AI RMF – monitoring",
        summary: "Emphasises continuous monitoring for drift and unequal impact."
      },
      {
        label: "ISO 31000 – conduct risk",
        summary: "Supports consideration of customer harm within risk management."
      }
    ],
    questionTemplate: "fraudDrift"
  },
  {
    id: "S3",
    title: "Customer chatbot gives misleading guidance",
    tagline:
      "A customer-facing chatbot provides incomplete or misleading answers to vulnerable users.",
    cluster: "Social",
    primaryLens: "soc",
    riskBand: "Medium",
    systems: ["AI-002"],
    scores: { env: 3, soc: 4, eco: 3 },
    whatHappened:
      "Post-incident review shows that customers in distress received inconsistent advice about arrears or complaint routes via the chatbot.",
    whyItMatters:
      "Automated channels may be increasing friction for people who most need reliable, empathetic support.",
    whoAffected:
      "Vulnerable customers, customer service staff, complaints and regulatory teams.",
    interpretation:
      "Social exposure is high; economic exposure is moderate through remediation and complaint handling; environmental exposure is low.",
    teachingMoment:
      "This scenario blends survey preferences for case studies and interactive learning by focusing on a tangible, human-impact issue.",
    signals: [
      "Spikes in complaints referencing chatbot conversations.",
      "Evidence of customers going in circles without reaching a human agent.",
      "Regulator or ombudsman interest in digital channel behaviour."
    ],
    frameworks: [
      {
        label: "EU AI Act – limited-risk transparency",
        summary: "Requires clear disclosure when users interact with AI systems in many contexts."
      },
      {
        label: "Consumer protection law",
        summary: "Expects fair, clear and not misleading communication with customers."
      }
    ],
    questionTemplate: "chatbot"
  },
  {
    id: "S4",
    title: "Opaque credit decisions trigger complaints",
    tagline:
      "Customers struggle to understand why credit applications were declined.",
    cluster: "Social",
    primaryLens: "soc",
    riskBand: "Medium",
    systems: ["AI-001"],
    scores: { env: 2, soc: 4, eco: 4 },
    whatHappened:
      "Complaints and social media posts highlight confusion about credit decisions. Documentation for the scoring model is highly technical and not customer-facing.",
    whyItMatters:
      "Lack of transparency undermines trust and may breach expectations around explainability and fairness.",
    whoAffected:
      "Applicants for credit, customer support teams and reputation managers.",
    interpretation:
      "Social and economic exposure rise together: the scenario connects fairness to revenue and trust.",
    teachingMoment:
      "This example supports learning about EU AI Act high-risk requirements and GDPR rights regarding automated decisions.",
    signals: [
      "Increase in credit-related complaints citing 'unfair' or 'unclear' decisions.",
      "Low usage of appeals processes, suggesting barriers to challenge.",
      "Difficulty mapping technical documentation to customer-facing language."
    ],
    frameworks: [
      {
        label: "EU AI Act – credit scoring high-risk",
        summary: "Requires risk management, transparency and human oversight for high-risk systems."
      },
      {
        label: "GDPR – profiling transparency",
        summary: "Supports rights to meaningful information about automated decisions."
      }
    ],
    questionTemplate: "creditTransparency"
  },

  // ECONOMIC (4)
  {
    id: "Ec1",
    title: "Downturn stresses credit portfolio",
    tagline:
      "Macro-economic deterioration exposes weaknesses in AI credit risk models.",
    cluster: "Economic",
    primaryLens: "eco",
    riskBand: "High",
    systems: ["AI-001"],
    scores: { env: 3, soc: 3, eco: 5 },
    whatHappened:
      "Economic conditions worsen faster than expected. Default rates exceed model scenarios, challenging the reliability of AI-driven risk estimates.",
    whyItMatters:
      "Capital planning, risk appetite and IFRS S2 scenario narratives may all need to be revisited.",
    whoAffected:
      "Risk committees, finance teams, investors and customers whose access to credit may tighten.",
    interpretation:
      "Economic exposure is very high; social and environmental exposures are secondary but present via access-to-credit and transition finance decisions.",
    teachingMoment:
      "This scenario reinforces that AI is not a crystal ball and Boards must challenge underlying assumptions and scenario coverage.",
    signals: [
      "Observed defaults systematically higher than model projections.",
      "Frequent model recalibrations or overrides.",
      "Tension between frontline pressure to lend and risk appetite."
    ],
    frameworks: [
      {
        label: "IFRS 9 / IFRS S2 – credit losses & climate",
        summary: "Connects expected credit losses with climate and macro scenarios."
      },
      {
        label: "ISO 31000 – risk appetite",
        summary: "Supports aligning AI-driven risk estimates with Board risk appetite."
      }
    ],
    questionTemplate: "climateStress"
  },
  {
    id: "Ec2",
    title: "Fraud attack wave increases false positives",
    tagline:
      "A new fraud pattern triggers conservative model updates, blocking many legitimate transactions.",
    cluster: "Economic",
    primaryLens: "eco",
    riskBand: "High",
    systems: ["AI-003"],
    scores: { env: 2, soc: 4, eco: 5 },
    whatHappened:
      "To respond to new attack patterns, thresholds are tightened, causing a surge in false positives and customer disruption.",
    whyItMatters:
      "Losses may be reduced but at the cost of customer experience, complaints and lost revenue.",
    whoAffected:
      "Customers, fraud operations teams, merchants and senior leaders focused on growth.",
    interpretation:
      "Economic and social exposures both rise. The case illustrates trade-offs between fraud control and relationship damage.",
    teachingMoment:
      "The scenario makes explicit the need to consider social and economic metrics together when tuning high-risk models.",
    signals: [
      "Spike in blocked transactions and manual review workload.",
      "Change in fraud rules or thresholds with limited consultation.",
      "Increased complaints about 'embarrassing' payment declines."
    ],
    frameworks: [
      {
        label: "NIST AI RMF – measurement & monitoring",
        summary: "Promotes balanced performance and harm-focused metrics."
      },
      {
        label: "UK Corporate Governance Code – operational resilience",
        summary: "Expects Boards to oversee resilience and customer impact of key controls."
      }
    ],
    questionTemplate: "fraudDrift"
  },
  {
    id: "Ec3",
    title: "IT ticket model misroutes critical incidents",
    tagline:
      "Automation in IT service management increases resolution time for some critical tickets.",
    cluster: "Economic",
    primaryLens: "eco",
    riskBand: "Medium",
    systems: ["AI-006"],
    scores: { env: 3, soc: 3, eco: 4 },
    whatHappened:
      "An AI model prioritises tickets based on historical impact. New types of incidents are misclassified and routed incorrectly.",
    whyItMatters:
      "Service outages last longer, affecting customer channels and internal productivity.",
    whoAffected:
      "IT teams, internal users, external customers and potentially regulators if outages hit critical services.",
    interpretation:
      "Economic exposure is high due to downtime and lost productivity; social exposure is moderate through customer frustration.",
    teachingMoment:
      "This case helps Boards see that even 'minimal-risk' tools can create material operational and financial risk.",
    signals: [
      "Increase in incident duration for specific ticket types.",
      "Workarounds emerging where staff bypass the automated system.",
      "Root-cause reviews citing misclassification or outdated training data."
    ],
    frameworks: [
      {
        label: "ISO 20000 / ITIL",
        summary: "Frames expectations around service management and incident handling."
      },
      {
        label: "ISO 31000 – operational risk",
        summary: "Encourages treatment of automation errors as part of operational risk."
      }
    ],
    questionTemplate: "fraudDrift"
  },
  {
    id: "Ec4",
    title: "Supplier ESG scores mis-state climate risk",
    tagline:
      "AI-assisted ESG scoring over-penalises some suppliers and underestimates others.",
    cluster: "Economic",
    primaryLens: "eco",
    riskBand: "Medium",
    systems: ["AI-009"],
    scores: { env: 5, soc: 4, eco: 4 },
    whatHappened:
      "A scoring model relies heavily on incomplete or proxy data. Some strategic suppliers receive poor scores, while others with limited disclosure appear low-risk.",
    whyItMatters:
      "Procurement decisions and climate disclosures may be based on misleading risk signals, affecting both resilience and reputation.",
    whoAffected:
      "Suppliers, procurement teams, sustainability teams and the Board via reported ESG metrics.",
    interpretation:
      "Environmental and economic exposures are both high; social exposure arises through knock-on effects on workers and communities.",
    teachingMoment:
      "This scenario connects supplier scoring directly to IFRS S2 and GRI reporting, making the frameworks feel concrete.",
    signals: [
      "Supplier disputes about scores and underlying data.",
      "Large differences between internal assessments and third-party ratings.",
      "Difficulty explaining ESG scores to external stakeholders."
    ],
    frameworks: [
      {
        label: "IFRS S2 – value chain risk",
        summary: "Highlights climate-related risks within the supply chain."
      },
      {
        label: "GRI Standards – supplier ESG metrics",
        summary: "Guides consistent reporting on supplier environmental and social performance."
      }
    ],
    questionTemplate: "supplierESG"
  },

  // INTEGRATED E–S–Ec (4)
  {
    id: "I1",
    title: "New credit model improves accuracy but increases carbon and fairness risk",
    tagline:
      "A high-performing model improves default prediction but consumes more energy and shows fairness concerns.",
    cluster: "Integrated E–S–Ec",
    primaryLens: "mixed",
    riskBand: "High",
    systems: ["AI-001"],
    scores: { env: 4, soc: 4, eco: 5 },
    whatHappened:
      "A new model significantly reduces credit losses but is more computationally intensive and shows emerging fairness disparities.",
    whyItMatters:
      "The organisation faces a classic trade-off: strong financial performance versus environmental footprint and social equity.",
    whoAffected:
      "Customers, sustainability teams, regulators and risk committees.",
    interpretation:
      "All three E–S–Ec dimensions move at once, forcing Boards to confront trade-offs rather than viewing risks in isolation.",
    teachingMoment:
      "This integrated scenario addresses survey responses where participants found all three dimensions equally challenging.",
    signals: [
      "Improved loss metrics but rising complaints or fairness indicators.",
      "Higher energy and compute costs associated with the new model.",
      "Difficult discussions about whether to slow or accelerate rollout."
    ],
    frameworks: [
      {
        label: "EU AI Act – high-risk credit scoring",
        summary: "Requires robust governance, fairness and transparency for credit models."
      },
      {
        label: "IFRS S2 – climate-linked credit exposure",
        summary: "Connects climate considerations to lending and capital decisions."
      }
    ],
    questionTemplate: "integratedTradeoff"
  },
  {
    id: "I2",
    title: "Legacy dialler retired and logged as a learning case",
    tagline:
      "A legacy collections model is switched off due to fairness concerns, with mixed economic impact.",
    cluster: "Integrated E–S–Ec",
    primaryLens: "mixed",
    riskBand: "Medium",
    systems: ["AI-010"],
    scores: { env: 2, soc: 4, eco: 3 },
    whatHappened:
      "The organisation retires an old dialler model after internal review highlights limited explainability and potential unfair targeting.",
    whyItMatters:
      "Retirement reduces ongoing risk but raises questions about historical harm, technical debt and future design standards.",
    whoAffected:
      "Customers previously contacted via the dialler, collections teams, compliance and audit.",
    interpretation:
      "Social exposure remains elevated due to historical decisions; environmental and economic exposure may reduce as legacy systems are decommissioned.",
    teachingMoment:
      "The case encourages Boards to treat retired models as learning assets rather than disappearing history.",
    signals: [
      "Audit findings about weak documentation or monitoring.",
      "Evidence of discomfort from staff about past practices.",
      "Opportunities to consolidate legacy systems and data stores."
    ],
    frameworks: [
      {
        label: "OECD AI Principles – accountability",
        summary: "Encourages learning from past AI deployments and addressing harms."
      },
      {
        label: "GDPR – data minimisation",
        summary: "Supports deleting or archiving legacy data appropriately after retirement."
      }
    ],
    questionTemplate: "legacyDialler"
  },
  {
    id: "I3",
    title: "Document classifier in pipeline reveals early E–S–Ec risks",
    tagline:
      "A pilot document classifier shows potential confidentiality and bias issues before go-live.",
    cluster: "Integrated E–S–Ec",
    primaryLens: "mixed",
    riskBand: "Medium",
    systems: ["AI-008"],
    scores: { env: 3, soc: 4, eco: 3 },
    whatHappened:
      "Testing reveals that some sensitive legal documents are misclassified and that the model struggles with certain languages and formats.",
    whyItMatters:
      "There is a risk of misrouting confidential information and creating unequal service across regions.",
    whoAffected:
      "Legal teams, information security, staff relying on accurate routing and potentially clients.",
    interpretation:
      "Social and governance exposures are prominent, with economic and environmental implications through rework and extra processing.",
    teachingMoment:
      "This scenario demonstrates why pipeline systems need structured E–S–Ec review before they move into production.",
    signals: [
      "Test data shows misclassification of privileged or sensitive documents.",
      "Performance varies significantly by language or region.",
      "Questions from legal and security teams about residual risk."
    ],
    frameworks: [
      {
        label: "ISO 27001 – information security",
        summary: "Frames expectations for handling confidential information."
      },
      {
        label: "ISO/IEC 42001 – design-time controls",
        summary: "Encourages early-stage risk assessment for AI use cases."
      }
    ],
    questionTemplate: "integratedTradeoff"
  },
  {
    id: "I4",
    title: "Supplier ESG scoring changes reshape portfolio risk",
    tagline:
      "Updated ESG models improve environmental metrics but create new economic concentration risks.",
    cluster: "Integrated E–S–Ec",
    primaryLens: "mixed",
    riskBand: "Medium",
    systems: ["AI-009"],
    scores: { env: 5, soc: 4, eco: 4 },
    whatHappened:
      "Improved ESG scoring leads to rapid disengagement from some suppliers and deeper reliance on a smaller number of 'green leaders'.",
    whyItMatters:
      "Environmental metrics strengthen, but business continuity and bargaining power may be weakened.",
    whoAffected:
      "Suppliers, communities, procurement teams, customers and investors tracking ESG performance.",
    interpretation:
      "Environmental scores improve while economic and social risks shift, illustrating portfolio-level trade-offs.",
    teachingMoment:
      "This scenario aligns with literature on unintended consequences of ESG optimisation and highlights the need for integrated Board oversight.",
    signals: [
      "Rapid changes in supplier mix driven by ESG scores.",
      "Concerns from risk teams about concentration or geographic exposure.",
      "Diverging narratives between sustainability and procurement teams."
    ],
    frameworks: [
      {
        label: "IFRS S2 – supply chain dependencies",
        summary: "Requires visibility of climate-related risks in the value chain."
      },
      {
        label: "OECD Due Diligence – responsible business",
        summary: "Supports thoughtful transitions rather than abrupt exits from suppliers."
      }
    ],
    questionTemplate: "supplierESG"
  }
];

  // Make available to other modules / debugging
  window.scenarios = scenarios;

  // ---- Glossary entries ----
  const glossaryEntries = window.glossaryEntries || [
    {
      term: "High-risk AI (EU AI Act)",
      definition:
        "Systems that can significantly affect fundamental rights or safety, such as credit scoring or employment screening, requiring strict governance and oversight."
    },
    {
      term: "E–S–Ec lens",
      definition:
        "An integrated view across Environmental, Social and Economic dimensions to avoid siloed decision-making and surface trade-offs."
    },
    {
      term: "Stress testing",
      definition:
        "Exploring how portfolios or systems behave under severe but plausible scenarios, often used for climate and economic risk."
    },
    { term: "Drift", definition: "When model performance degrades over time because real-world data no longer resembles the training data." },
    { term: "Fairness audit", definition: "A structured review of model outputs across groups to identify potential discrimination or unequal impacts." },
    {
      term: "Scope 3 emissions",
      definition:
        "Indirect emissions that occur in the value chain, such as from suppliers and customers, often material for AI-heavy organisations."
    },
    { term: "Technical debt", definition: "Design or implementation shortcuts that create future cost and risk when systems need to be changed or audited." },
    {
      term: "Operational resilience",
      definition:
        "The ability to prevent, adapt and recover from disruption while continuing to provide critical services."
    }
  ];

  // =========================
  // Utilities
  // =========================

  function safeGet(id) {
    return document.getElementById(id);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  }

  function impactClass(level) {
    if (level === "high") return "high";
    if (level === "med") return "med";
    return "low";
  }

  // =========================
  // RISK & CONTROLS VIEW
  // =========================

  function initRiskView() {
    const view = safeGet('view-risk');
    if (!view) return;

    const listContainer = view.querySelector('#incidents-list') || view.querySelector('#incidentList');
    if (!listContainer) return;

    // If filters don't exist in integrated markup, inject them above the list (keeps header/footer untouched).
    const existingFilterBar = view.querySelector('.risk-filterbar');
    if (!existingFilterBar) {
      const bar = document.createElement('div');
      bar.className = 'risk-filterbar';
      bar.innerHTML = `
        <div class="inventory-controls" style="margin-bottom:1rem;">
          <div class="control-group">
            <label for="filterSystem">AI System</label>
            <select id="filterSystem"><option value="all">All</option></select>
          </div>
          <div class="control-group">
            <label for="filterCategory">Category</label>
            <select id="filterCategory">
              <option value="all">All</option>
              <option value="Incident">Incident</option>
              <option value="Near miss">Near miss</option>
            </select>
          </div>
          <div class="control-group">
            <label for="filterSeverity">Severity</label>
            <select id="filterSeverity">
              <option value="all">All</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div class="control-group" style="justify-content:flex-end;">
            <button type="button" class="btn-reset" id="riskResetBtn">Reset</button>
          </div>
        </div>
        <p id="noResults" style="display:none; color:#505a5f; margin:0 0 1rem;">No incidents match the current filters.</p>
      `;
      listContainer.parentElement.insertBefore(bar, listContainer);
    }

    const filterSystemEl = safeGet("filterSystem");
    const filterCategoryEl = safeGet("filterCategory");
    const filterSeverityEl = safeGet("filterSeverity");
    const noResultsEl = safeGet("noResults");
    const resetBtn = safeGet("riskResetBtn");

    // Populate system filter once
    if (filterSystemEl && filterSystemEl.options.length <= 1) {
      const uniqueSystems = new Set();
      incidents.forEach((inc) => (inc.systems || []).forEach((s) => uniqueSystems.add(s)));

      Array.from(uniqueSystems)
        .sort()
        .forEach((id) => {
          const opt = document.createElement("option");
          opt.value = id;
          opt.textContent = `${id} – ${aiSystems[id] || "Unknown system"}`;
          filterSystemEl.appendChild(opt);
        });
    }

    function updateSummaryCards(list) {
      // integrated markup has 4 stat cards in view-risk; update their values in-place
      const statValues = view.querySelectorAll('.stats-grid .stat-value');
      if (!statValues || statValues.length < 4) return;

      const total = list.length;
      const high = list.filter((i) => i.severity === "High").length;
      const near = list.filter((i) => i.category === "Near miss").length;
      const strengthened = list.filter((i) => i.strengthenedControls).length;

      statValues[0].textContent = String(total);
      statValues[1].textContent = String(high);
      statValues[2].textContent = String(near);
      statValues[3].textContent = String(strengthened);
    }

    function renderIncidents(list) {
      listContainer.innerHTML = "";

      if (!list.length) {
        if (noResultsEl) noResultsEl.style.display = "block";
        updateSummaryCards(list);
        return;
      }
      if (noResultsEl) noResultsEl.style.display = "none";

      list
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach((inc) => {
          const card = document.createElement("article");
          card.className = "incident-card";
          card.setAttribute("role", "listitem");

          const systemsLabel = (inc.systems || [])
            .map((id) => `${id} – ${aiSystems[id] || "Unknown system"}`)
            .join("; ");

          card.innerHTML = `
            <div class="incident-header">
              <div>
                <h3 class="incident-title">${inc.title}</h3>
                <div class="incident-meta">
                  <span class="incident-pill category">${inc.category}</span>
                  <span class="incident-pill sev-${inc.severity}">${inc.severity} severity</span>
                  <span class="incident-pill type">${inc.type}</span>
                </div>
              </div>
              <p class="incident-date">${formatDate(inc.date)}</p>
            </div>

            <div class="incident-body">
              <p class="incident-line"><strong>Summary:</strong> ${inc.summary}</p>
              <p class="incident-line"><strong>Impact:</strong> ${inc.impact}</p>
              <p class="incident-line"><strong>Control response:</strong> ${inc.response}</p>
              <p class="incident-systems"><strong>AI systems involved:</strong> ${systemsLabel || "—"}</p>

              <div class="impact-row">
                <span class="impact-pill env ${impactClass(inc.env)}">E: ${
                  inc.env === "high" ? "High" : inc.env === "med" ? "Medium" : "Low"
                } exposure</span>
                <span class="impact-pill soc ${impactClass(inc.soc)}">S: ${
                  inc.soc === "high" ? "High" : inc.soc === "med" ? "Medium" : "Low"
                } exposure</span>
                <span class="impact-pill eco ${impactClass(inc.eco)}">Ec: ${
                  inc.eco === "high" ? "High" : inc.eco === "med" ? "Medium" : "Low"
                } exposure</span>
                <span class="impact-pill residual-chip">Residual risk: ${inc.residualRisk || "Not assessed"}</span>
              </div>

              <div class="incident-actions">
                <button type="button" class="btn-link" data-system="${(inc.systems || [])[0] || ""}">
                  View in AI Inventory
                </button>
                <span style="font-size:0.8rem; color:#505a5f;">
                  ${
                    inc.category === "Near miss"
                      ? "Near misses are treated as early warning signals – controls were adjusted before full impact."
                      : "Incidents are formally logged and linked to updates in the AI risk register."
                  }
                </span>
              </div>
            </div>
          `;

          const btn = card.querySelector(".btn-link");
          btn.addEventListener("click", () => {
            // Try to navigate inside the integrated app if showView exists; otherwise open the old pen link.
            const systemId = btn.getAttribute("data-system");
            if (typeof window.showView === "function") {
              window.showView("inventory");
              // best-effort: if inventory module exposes a selector, call it; otherwise leave user on inventory view
              if (systemId && typeof window.selectInventorySystem === "function") {
                window.selectInventorySystem(systemId);
              }
              return;
            }
            window.open("https://codepen.io/Hazel-Kayiya/pen/dPMadRY", "_blank");
          });

          listContainer.appendChild(card);
        });

      updateSummaryCards(list);
    }

    function applyRiskFilters() {
      const sys = filterSystemEl ? filterSystemEl.value : "all";
      const cat = filterCategoryEl ? filterCategoryEl.value : "all";
      const sev = filterSeverityEl ? filterSeverityEl.value : "all";

      let list = incidents.slice();
      if (sys !== "all") list = list.filter((inc) => inc.systems && inc.systems.includes(sys));
      if (cat !== "all") list = list.filter((inc) => inc.category === cat);
      if (sev !== "all") list = list.filter((inc) => inc.severity === sev);

      renderIncidents(list);
    }

    // Wire once
    if (!view.dataset.riskWired) {
      view.dataset.riskWired = "true";
      filterSystemEl && filterSystemEl.addEventListener("change", applyRiskFilters);
      filterCategoryEl && filterCategoryEl.addEventListener("change", applyRiskFilters);
      filterSeverityEl && filterSeverityEl.addEventListener("change", applyRiskFilters);
      resetBtn &&
        resetBtn.addEventListener("click", () => {
          if (filterSystemEl) filterSystemEl.value = "all";
          if (filterCategoryEl) filterCategoryEl.value = "all";
          if (filterSeverityEl) filterSeverityEl.value = "all";
          applyRiskFilters();
        });
    }

    // Initial render
    applyRiskFilters();
  }

  // =========================
  // EDUCATION VIEW (Scenario & Learning Mode)
  // =========================

  function initEducationView() {
    const view = safeGet('view-education');
    if (!view) return;

    // Build any missing supporting UI once (keeps the HTML authored in index.html).
    if (!view.dataset.eduBuilt) {
      view.dataset.eduBuilt = "true";

      // Glossary panel is opened via the "Glossary & tooltips" pill.
      // If the authored HTML does not include it, create it here so the JS never breaks.
      if (!safeGet("glossaryPanel")) {
        const aside = document.createElement("aside");
        aside.id = "glossaryPanel";
        aside.className = "glossary-panel";
        aside.setAttribute("aria-hidden", "true");
        aside.innerHTML = `
          <div class="glossary-header">
            <h4>Glossary</h4>
            <button type="button" class="btn-reset" id="closeGlossary">Close</button>
          </div>
          <dl id="glossaryList" class="glossary-list"></dl>
        `;
        // Append inside the Education view (so SPA show/hide works cleanly).
        view.appendChild(aside);
      }
    }

    // Now wire the Education behaviours (namespaced, so no global collisions).
// Now wire the Education behaviours (namespaced, so no global collisions).
    const filterLensEl = safeGet("filterLens");
    const filterRiskEl = safeGet("filterRisk");
    const scenarioListEl = safeGet("scenarioList");

    const scenarioIdLabel = safeGet("scenarioIdLabel");
    const scenarioTitle = safeGet("scenarioTitle");
    const scenarioTagline = safeGet("scenarioTagline");
    const scenarioRiskPill = safeGet("scenarioRiskPill");
    const scenarioSystems = safeGet("scenarioSystems");

    const envScoreEl = safeGet("envScore");
    const socScoreEl = safeGet("socScore");
    const ecoScoreEl = safeGet("ecoScore");
    const envBandEl = safeGet("envBand");
    const socBandEl = safeGet("socBand");
    const ecoBandEl = safeGet("ecoBand");

    const csWhatEl = safeGet("csWhat");
    const csWhyEl = safeGet("csWhy");
    const csWhoEl = safeGet("csWho");
    const csInterpretEl = safeGet("csInterpret");
    const csTeachEl = safeGet("csTeach");
    const caseBodyEl = safeGet("caseStudyBody");
    const toggleCaseBtn = safeGet("toggleCaseStudy");

    const scenarioSignalsEl = safeGet("scenarioSignals");
    const frameworkTagsEl = safeGet("frameworkTags");

    const toggleBoardPanelBtn = safeGet("toggleBoardPanel");
    const boardPanel = safeGet("boardPanel");
    const modeButtons = view.querySelectorAll(".mode-btn");

    const boardEnvEl = safeGet("boardEnv");
    const boardSocEl = safeGet("boardSoc");
    const boardEcoEl = safeGet("boardEco");
    const boardGovEl = safeGet("boardGov");

    const glossaryPanel = safeGet("glossaryPanel");
    const glossaryListEl = safeGet("glossaryList");
    const closeGlossaryBtn = safeGet("closeGlossary");
    const pillGlossary = safeGet("pillGlossary");
    const pillCaseStudies = safeGet("pillCaseStudies");
    const pillFrameworks = safeGet("pillFrameworks");

    // ---- Utility helpers (from pen) ----
    function riskBandClass(band) {
      if (band === "High") return "high";
      if (band === "Medium") return "medium";
      return "low";
    }

    function lensChipClass(lens) {
      if (lens === "env") return "lens-env";
      if (lens === "soc") return "lens-soc";
      if (lens === "eco") return "lens-eco";
      return "lens-mixed";
    }

    function exposureLabel(score) {
      if (score >= 4) return "High exposure";
      if (score >= 2.5) return "Medium exposure";
      return "Lower exposure";
    }

    const clusterOrder = ["Environmental", "Social", "Economic", "Integrated E–S–Ec"];
    let currentScenario = null;
    let currentMode = "beginner";

    function renderScenarioList() {
      const lensFilter = filterLensEl ? filterLensEl.value : "all";
      const riskFilter = filterRiskEl ? filterRiskEl.value : "all";

      scenarioListEl.innerHTML = "";

      // Source scenarios: prefer window.scenarios if present (from the full pen), else try to read from this file scope (not included here).
      const data = (Array.isArray(window.scenarios) && window.scenarios.length)
        ? window.scenarios
        : (typeof scenarios !== 'undefined' && Array.isArray(scenarios) ? scenarios : []);

      clusterOrder.forEach((cluster) => {
        const inCluster = data.filter((s) => s.cluster === cluster);
        const filtered = inCluster.filter((sc) => {
          const lensOk = lensFilter === "all" || sc.primaryLens === lensFilter;
          const riskOk = riskFilter === "all" || sc.riskBand === riskFilter;
          return lensOk && riskOk;
        });

        if (!filtered.length) return;

        const heading = document.createElement("h3");
        heading.className = "scenario-group-title";
        heading.textContent = cluster;
        scenarioListEl.appendChild(heading);

        filtered.forEach((sc) => {
          const card = document.createElement("button");
          card.type = "button";
          card.className = "scenario-card";
          card.dataset.id = sc.id;

          card.innerHTML = `
            <div class="scenario-card-title">
              <h3>${sc.title}</h3>
              <span class="scenario-card-id">${sc.id}</span>
            </div>
            <div class="scenario-card-meta">
              <span class="scenario-chip ${lensChipClass(sc.primaryLens)}">${String(sc.primaryLens).toUpperCase()}</span>
              <span class="scenario-chip risk-${riskBandClass(sc.riskBand)}">${sc.riskBand} risk</span>
            </div>
          `;

          card.addEventListener("click", () => selectScenario(sc.id));
          scenarioListEl.appendChild(card);
        });
      });

      if (!scenarioListEl.childElementCount) {
        const empty = document.createElement("p");
        empty.textContent = "No scenarios match the current filters.";
        empty.style.fontSize = "0.9rem";
        empty.style.color = "#505a5f";
        scenarioListEl.appendChild(empty);
      }
    }

    function selectScenario(id) {
      const data = Array.isArray(window.scenarios) && window.scenarios.length ? window.scenarios : [];
      const sc = data.find((s) => s.id === id);
      if (!sc) return;

      currentScenario = sc;

      // Highlight card
      view.querySelectorAll(".scenario-card").forEach((card) => {
        card.classList.toggle("active", card.dataset.id === id);
      });

      scenarioIdLabel.textContent = `Scenario ${sc.id}`;
      scenarioTitle.textContent = sc.title;
      scenarioTagline.textContent = sc.tagline;

      scenarioRiskPill.classList.remove("high", "medium", "low");
      scenarioRiskPill.classList.add(riskBandClass(sc.riskBand));
      const riskVal = scenarioRiskPill.querySelector(".risk-value");
      if (riskVal) riskVal.textContent = `${sc.riskBand} risk`;

      if (sc.systems && sc.systems.length) {
        const names = sc.systems.map((sid) => `${sid} – ${aiSystems[sid] || "Unknown system"}`).join("; ");
        scenarioSystems.textContent = `Involved systems: ${names}`;
      } else {
        scenarioSystems.textContent = "Involved systems: —";
      }

      envScoreEl.textContent = `${sc.scores.env}/5`;
      socScoreEl.textContent = `${sc.scores.soc}/5`;
      ecoScoreEl.textContent = `${sc.scores.eco}/5`;

      envBandEl.textContent = exposureLabel(sc.scores.env);
      socBandEl.textContent = exposureLabel(sc.scores.soc);
      ecoBandEl.textContent = exposureLabel(sc.scores.eco);

      csWhatEl.textContent = sc.whatHappened;
      csWhyEl.textContent = sc.whyItMatters;
      csWhoEl.textContent = sc.whoAffected;
      csInterpretEl.textContent = sc.interpretation;
      csTeachEl.textContent = sc.teachingMoment;

      scenarioSignalsEl.innerHTML = "";
      (sc.signals || []).forEach((sig) => {
        const li = document.createElement("li");
        li.textContent = sig;
        scenarioSignalsEl.appendChild(li);
      });

      frameworkTagsEl.innerHTML = "";
      (sc.frameworks || []).forEach((fw) => {
        const span = document.createElement("span");
        span.className = "framework-chip";
        span.textContent = fw.label;
        span.title = fw.summary;
        frameworkTagsEl.appendChild(span);
      });

      // Reset board panel
      if (boardPanel) {
        boardPanel.hidden = true;
        toggleBoardPanelBtn.textContent = "Show Board questions";
        toggleBoardPanelBtn.setAttribute("aria-expanded", "false");
      }
      setMode("beginner");
    }

    function setMode(mode) {
      currentMode = mode;
      modeButtons.forEach((btn) => {
        const isActive = btn.dataset.mode === mode;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
      renderBoardQuestions();
    }

    function renderBoardQuestions() {
      if (!currentScenario) {
        boardEnvEl.innerHTML = "";
        boardSocEl.innerHTML = "";
        boardEcoEl.innerHTML = "";
        boardGovEl.innerHTML = "";
        return;
      }

      const tpl = questionTemplates[currentScenario.questionTemplate];
      if (!tpl) return;

      const qSet = tpl[currentMode];
      const fillList = (ul, arr) => {
        ul.innerHTML = "";
        (arr || []).forEach((q) => {
          const li = document.createElement("li");
          li.textContent = q;
          ul.appendChild(li);
        });
      };

      fillList(boardEnvEl, qSet.env);
      fillList(boardSocEl, qSet.soc);
      fillList(boardEcoEl, qSet.eco);
      fillList(boardGovEl, qSet.gov);
    }

    function renderGlossary() {
      glossaryListEl.innerHTML = "";
      glossaryEntries.forEach((entry) => {
        const dt = document.createElement("dt");
        dt.textContent = entry.term;
        const dd = document.createElement("dd");
        dd.textContent = entry.definition;
        glossaryListEl.appendChild(dt);
        glossaryListEl.appendChild(dd);
      });
    }

    function openGlossary() {
      glossaryPanel.classList.add("open");
      glossaryPanel.setAttribute("aria-hidden", "false");
    }

    function closeGlossary() {
      glossaryPanel.classList.remove("open");
      glossaryPanel.setAttribute("aria-hidden", "true");
    }

    // Wire once
    if (!view.dataset.eduWired) {
      view.dataset.eduWired = "true";

      filterLensEl && filterLensEl.addEventListener("change", () => {
        renderScenarioList();
        if (currentScenario) {
          const stillVisible = !!view.querySelector(`.scenario-card[data-id="${currentScenario.id}"]`);
          if (!stillVisible) currentScenario = null;
        }
      });

      filterRiskEl && filterRiskEl.addEventListener("change", renderScenarioList);

      toggleBoardPanelBtn &&
        toggleBoardPanelBtn.addEventListener("click", () => {
          const isHidden = boardPanel.hidden;
          if (isHidden && currentScenario) renderBoardQuestions();
          boardPanel.hidden = !isHidden;
          toggleBoardPanelBtn.textContent = isHidden ? "Hide Board questions" : "Show Board questions";
          toggleBoardPanelBtn.setAttribute("aria-expanded", String(isHidden));
        });

      modeButtons.forEach((btn) => btn.addEventListener("click", () => setMode(btn.dataset.mode)));

      toggleCaseBtn &&
        toggleCaseBtn.addEventListener("click", () => {
          const isCollapsed = caseBodyEl.style.display === "none";
          if (isCollapsed) {
            caseBodyEl.style.display = "";
            toggleCaseBtn.textContent = "Collapse case study";
            toggleCaseBtn.setAttribute("aria-expanded", "true");
          } else {
            caseBodyEl.style.display = "none";
            toggleCaseBtn.textContent = "Expand case study";
            toggleCaseBtn.setAttribute("aria-expanded", "false");
          }
        });

      closeGlossaryBtn && closeGlossaryBtn.addEventListener("click", closeGlossary);
      pillGlossary && pillGlossary.addEventListener("click", openGlossary);

      pillCaseStudies &&
        pillCaseStudies.addEventListener("click", () => {
          const el = view.querySelector(".case-study");
          el && el.scrollIntoView({ behavior: "smooth", block: "start" });
        });

      pillFrameworks &&
        pillFrameworks.addEventListener("click", () => {
          const el = view.querySelector(".scenario-context-block:nth-of-type(2)");
          el && el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    // Init render (requires the full scenarios array to exist on window)
    renderScenarioList();
    renderGlossary();

    const data = Array.isArray(window.scenarios) && window.scenarios.length ? window.scenarios : null;
    if (data && data.length) {
      selectScenario(data[0].id);
    } else {
      // If scenarios aren't present, show a clear message in the list.
      scenarioListEl.innerHTML =
        '<p style="color:#b10e1e;">Education data (scenarios) is not loaded. Ensure the full scenarios array is present on window.scenarios.</p>';
    }
  }

  // =========================
  // Init on page load
  // =========================

  document.addEventListener('DOMContentLoaded', () => {
    initRiskView();
    initEducationView();
  });

  // Expose for manual re-init after dynamic markup changes (optional)
  window.initRiskView = initRiskView;
  window.initEducationView = initEducationView;

})();


  // =====================================================
  // EDUCATION VIEW
  // =====================================================
  function initEducation() {
    const root = el('view-education');
    if (!root) return;
    if (AIR.state.educationReady) return;
    AIR.state.educationReady = true;

    const grid = el('scenarios-grid');
    const detail = el('scenario-detail');
    if (!grid || !detail) return;

    let selectedScenarioId = null;
    let mode = 'beginner';

    function riskClass(band) {
      if (band === 'High') return 'risk-high';
      if (band === 'Medium') return 'risk-medium';
      return 'risk-low';
    }

    function renderGrid() {
      grid.innerHTML = '';
      scenarios.forEach((sc) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `scenario-tile ${riskClass(sc.riskBand)}`;
        btn.dataset.id = sc.id;

        btn.innerHTML = `
          <div class="scenario-tile-top">
            <span class="scenario-code">${sc.id}</span>
            <span class="scenario-band">${sc.riskBand} risk</span>
          </div>
          <div class="scenario-title">${sc.title}</div>
          <div class="scenario-tagline">${sc.tagline}</div>
          <div class="scenario-cluster">${sc.cluster}</div>
        `;

        btn.addEventListener('click', () => selectScenario(sc.id));
        grid.appendChild(btn);
      });
    }

    function renderBoardQuestions(sc) {
      const tpl = questionTemplates[sc.questionTemplate];
      if (!tpl || !tpl[mode]) return '<p class="muted">No Board question set found for this scenario yet.</p>';

      const qs = tpl[mode];
      const list = (arr) => `<ul>${(arr || []).map(q => `<li>${q}</li>`).join('')}</ul>`;

      return `
        <div class="board-qs">
          <div class="mode-row">
            <button type="button" class="mode-btn ${mode === 'beginner' ? 'active' : ''}" data-mode="beginner">Beginner</button>
            <button type="button" class="mode-btn ${mode === 'expert' ? 'active' : ''}" data-mode="expert">Expert</button>
          </div>

          <div class="qs-grid">
            <section>
              <h4>Environmental</h4>
              ${list(qs.env)}
            </section>
            <section>
              <h4>Social</h4>
              ${list(qs.soc)}
            </section>
            <section>
              <h4>Economic</h4>
              ${list(qs.eco)}
            </section>
            <section>
              <h4>Governance</h4>
              ${list(qs.gov)}
            </section>
          </div>
        </div>
      `;
    }

    function renderDetail(sc) {
      const systemsLabel = (sc.systems || [])
        .map((id) => `${id} – ${aiSystems[id] || 'Unknown system'}`)
        .join('; ');

      const frameworks = (sc.frameworks || [])
        .map(f => `<span class="framework-chip" title="${(f.summary || '').replace(/"/g, '&quot;')}">${f.label}</span>`)
        .join(' ');

      const signals = (sc.signals || []).map(s => `<li>${s}</li>`).join('');

      detail.innerHTML = `
        <div class="scenario-detail-card">
          <div class="scenario-detail-header">
            <h3>${sc.id} · ${sc.title}</h3>
            <p class="muted">${sc.tagline}</p>
            <div class="scenario-detail-meta">
              <span class="pill">${sc.cluster}</span>
              <span class="pill ${riskClass(sc.riskBand)}">${sc.riskBand} risk</span>
              <span class="pill">${sc.primaryLens.toUpperCase()}</span>
            </div>
            <p><strong>Involved systems:</strong> ${systemsLabel || '—'}</p>
          </div>

          <div class="scenario-scores">
            <div class="score-chip score-env">E <strong>${sc.scores.env}</strong>/5</div>
            <div class="score-chip score-soc">S <strong>${sc.scores.soc}</strong>/5</div>
            <div class="score-chip score-eco">Ec <strong>${sc.scores.eco}</strong>/5</div>
          </div>

          <div class="scenario-sections">
            <section>
              <h4>What happened</h4>
              <p>${sc.whatHappened}</p>
            </section>
            <section>
              <h4>Why it matters</h4>
              <p>${sc.whyItMatters}</p>
            </section>
            <section>
              <h4>Who is affected</h4>
              <p>${sc.whoAffected}</p>
            </section>
            <section>
              <h4>Interpretation (E–S–Ec)</h4>
              <p>${sc.interpretation}</p>
            </section>
            <section>
              <h4>Teaching moment</h4>
              <p>${sc.teachingMoment}</p>
            </section>
          </div>

          <section>
            <h4>Early warning signals</h4>
            <ul>${signals}</ul>
          </section>

          <section>
            <h4>Framework hooks</h4>
            <div class="framework-tags">${frameworks || '<span class="muted">None recorded</span>'}</div>
          </section>

          <section>
            <h4>Board questions</h4>
            ${renderBoardQuestions(sc)}
          </section>

          <details class="glossary-block">
            <summary>Glossary</summary>
            <dl>
              ${glossaryEntries.map(g => `<dt>${g.term}</dt><dd>${g.definition}</dd>`).join('')}
            </dl>
          </details>
        </div>
      `;

      detail.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          mode = btn.dataset.mode;
          renderDetail(sc);
        });
      });
    }

    function selectScenario(id) {
      selectedScenarioId = id;
      grid.querySelectorAll('.scenario-tile').forEach(t => {
        t.classList.toggle('active', t.dataset.id === id);
      });

      const sc = scenarios.find(s => s.id === id);
      if (sc) renderDetail(sc);
    }

    renderGrid();
    if (scenarios.length) selectScenario(scenarios[0].id);
  }

  AIR.modules.initRisk = initRisk;
  AIR.modules.initEducation = initEducationView;
})();


/* =============================
   E–S–Ec Lens (V3) embedded into Integrated V7
   - Scoped DOM IDs prefixed with esec3-
   - Overrides AIRiskNav.modules.initESEc to match Lens V3 behaviour
   ============================= */
(() => {
  'use strict';
// -----------------------------------------------------
// AI INVENTORY DATASET (as provided)
// -----------------------------------------------------

const aiInventory = [
  {
    id: "AI-001",
    name: "Customer Credit Scoring Engine",
    owner: "Retail Banking",
    techOwner: "Data Science Team",
    useCase: "Predict probability of default for loan applications.",
    riskTier: "High",
    status: "In production",
    lastReview: "2025-06-15",
    envScore: 2,
    socialScore: 4,
    economicScore: 5,
    dataCategory: "Highly sensitive personal & financial data",
    aiGovFrameworks: [
      "EU Artificial Intelligence Act (high-risk: credit scoring)",
      "NIST AI RMF",
      "ISO/IEC 42001 (implementation in progress)",
      "OECD AI Principles"
    ],
    sustainabilityFrameworks: [
      "IFRS S2 (credit exposure under climate scenarios)",
      "SDG Impact Standards (SDG 8 & 10)"
    ],
    riskEthicsFrameworks: [
      "ISO 31000",
      "UK Corporate Governance Code",
      "GDPR",
      "RRI Toolkit"
    ],
    flag: "High social and economic impact; must meet EU AI Act high-risk obligations and fairness / bias safeguards.",
    notes:
      "Used for creditworthiness assessments. Quarterly fairness reviews, model risk governance, and drift monitoring in place. Alignment work with ISO/IEC 42001 design underway."
  },
  {
    id: "AI-002",
    name: "Contact Centre Chatbot",
    owner: "Customer Services",
    techOwner: "Digital Product Team",
    useCase: "Handle routine customer queries and triage to human agents.",
    riskTier: "Limited",
    status: "In production",
    lastReview: "2025-05-01",
    envScore: 3,
    socialScore: 3,
    economicScore: 4,
    dataCategory: "Customer interaction logs and FAQs",
    aiGovFrameworks: [
      "EU Artificial Intelligence Act (limited-risk transparency obligations)",
      "NIST AI RMF"
    ],
    sustainabilityFrameworks: ["GRI Standards (service quality indicators)"],
    riskEthicsFrameworks: ["ISO 31000", "GDPR", "RRI Toolkit"],
    flag: "Transparency to customers and escalation to humans required under EU AI Act limited-risk provisions.",
    notes:
      "Provides clear disclosure that customers are interacting with an automated system. Logs are sampled monthly for quality, tone, and hallucination risk."
  },
  {
    id: "AI-003",
    name: "Fraud Transaction Anomaly Detector",
    owner: "Risk & Compliance",
    techOwner: "Fraud Analytics Squad",
    useCase: "Identify suspicious transactions for further investigation.",
    riskTier: "High",
    status: "In production",
    lastReview: "2025-07-02",
    envScore: 2,
    socialScore: 4,
    economicScore: 5,
    dataCategory: "Financial & behavioural transaction data",
    aiGovFrameworks: [
      "EU Artificial Intelligence Act (high-risk: fraud monitoring and AML support)",
      "NIST AI RMF",
      "ISO/IEC 42001",
      "OECD AI Principles"
    ],
    sustainabilityFrameworks: [
      "IFRS S2 (financial resilience under climate-related fraud patterns)"
    ],
    riskEthicsFrameworks: [
      "ISO 31000",
      "UK Corporate Governance Code",
      "GDPR",
      "RRI Toolkit"
    ],
    flag: "High economic and social impact; false positives must be managed with human-in-the-loop and explainability.",
    notes:
      "Model performance and false positive rates are reviewed by the Model Risk Committee. EU AI Act high-risk register entry maintained for audit."
  },
  {
    id: "AI-004",
    name: "HR Candidate Screening Tool",
    owner: "Human Resources",
    techOwner: "People Analytics",
    useCase: "Pre-screen CVs for minimum job requirements.",
    riskTier: "High",
    status: "Pilot",
    lastReview: "2025-04-10",
    envScore: 2,
    socialScore: 5,
    economicScore: 3,
    dataCategory: "Personal and employment application data",
    aiGovFrameworks: [
      "EU Artificial Intelligence Act (high-risk: employment-related)",
      "NIST AI RMF",
      "ISO/IEC 42001 (design phase)",
      "OECD AI Principles"
    ],
    sustainabilityFrameworks: ["SDG Impact Standards (SDG 5 & 10 – fair access to work)"],
    riskEthicsFrameworks: ["ISO 31000", "UK Corporate Governance Code", "GDPR", "RRI Toolkit"],
    flag: "High social risk; cannot move beyond pilot until fairness, bias and explainability obligations are demonstrably met.",
    notes:
      "Pilot restricted to one business unit. External bias audit scheduled. Candidates are notified about automated pre-screening and appeals process."
  },
  {
    id: "AI-005",
    name: "Marketing Propensity Model",
    owner: "Marketing",
    techOwner: "Analytics Centre of Excellence",
    useCase: "Target customers most likely to respond to a campaign.",
    riskTier: "Limited",
    status: "In production",
    lastReview: "2025-03-21",
    envScore: 3,
    socialScore: 3,
    economicScore: 4,
    dataCategory: "Customer behaviour, channel and demographic data",
    aiGovFrameworks: [
      "EU Artificial Intelligence Act (limited-risk profiling)",
      "NIST AI RMF"
    ],
    sustainabilityFrameworks: [
      "GRI Standards (marketing communications)",
      "SDG Impact Standards (responsible consumption & production)"
    ],
    riskEthicsFrameworks: ["ISO 31000", "GDPR", "RRI Toolkit"],
    flag: "Limited-risk AI; must respect consent, right to object, and responsible marketing principles.",
    notes:
      "Opt-out mechanisms and suppression lists enforced. Regular GDPR compliance checks and monitoring of complaints / opt-out rates."
  },
  {
    id: "AI-006",
    name: "IT Ticket Prioritisation Model",
    owner: "IT Operations",
    techOwner: "IT Service Management",
    useCase: "Prioritise incident tickets based on impact and urgency.",
    riskTier: "Minimal",
    status: "In production",
    lastReview: "2025-02-10",
    envScore: 3,
    socialScore: 2,
    economicScore: 3,
    dataCategory: "Internal operational and configuration data",
    aiGovFrameworks: [
      "EU Artificial Intelligence Act (minimal-risk: internal operations)",
      "NIST AI RMF"
    ],
    sustainabilityFrameworks: [],
    riskEthicsFrameworks: ["ISO 31000", "UK Corporate Governance Code (operational resilience)"],
    flag: "Minimal-risk system; internal use only with strong manual override.",
    notes:
      "Improves response times for major incidents. Documented as minimal-risk AI within the corporate AI inventory; regular reviews focus on availability, not ethics."
  },
  {
    id: "AI-007",
    name: "Energy Optimisation for Data Centre",
    owner: "Technology Infrastructure",
    techOwner: "Cloud & Platform Team",
    useCase: "Adjust cooling and compute scheduling to reduce energy use.",
    riskTier: "Limited",
    status: "Pilot",
    lastReview: "2025-06-01",
    envScore: 5,
    socialScore: 3,
    economicScore: 4,
    dataCategory: "Infrastructure telemetry and performance metrics",
    aiGovFrameworks: [
      "EU Artificial Intelligence Act (minimal / limited-risk: infrastructure optimisation)",
      "NIST AI RMF",
      "OECD AI Principles"
    ],
    sustainabilityFrameworks: [
      "GRI Standards (305 – emissions)",
      "IFRS S2 (Scope 2 energy use)",
      "SDG Impact Standards (SDG 7 & 13)"
    ],
    riskEthicsFrameworks: ["ISO 31000", "UK Corporate Governance Code", "RRI Toolkit"],
    flag: "Strong environmental benefit; must demonstrate that optimisation does not undermine resilience or service levels.",
    notes:
      "Pilot shows early reductions in energy consumption. Reliability and latency monitored; results will feed into IFRS S2 climate reporting."
  },
  {
    id: "AI-008",
    name: "Document Classification Assistant",
    owner: "Legal & Secretariat",
    techOwner: "Knowledge Management",
    useCase: "Tag and route contracts and legal documents.",
    riskTier: "Limited",
    status: "Under assessment",
    lastReview: "2025-05-18",
    envScore: 2,
    socialScore: 2,
    economicScore: 3,
    dataCategory: "Confidential legal and contractual documents",
    aiGovFrameworks: [
      "EU Artificial Intelligence Act (limited-risk information processing)",
      "NIST AI RMF",
      "OECD AI Principles"
    ],
    sustainabilityFrameworks: [],
    riskEthicsFrameworks: ["ISO 31000", "GDPR", "RRI Toolkit"],
    flag: "Needs robust access controls and confidentiality safeguards before go-live.",
    notes:
      "Accuracy and security are being validated. Deployment will require DPIA and sign-off from the Data Protection Officer."
  },
  {
    id: "AI-009",
    name: "Supplier ESG Risk Scoring",
    owner: "Procurement & Sustainability",
    techOwner: "Sustainability Analytics",
    useCase: "Score suppliers on ESG and climate risk factors.",
    riskTier: "Limited",
    status: "In production",
    lastReview: "2025-07-01",
    envScore: 5,
    socialScore: 4,
    economicScore: 4,
    dataCategory: "Public ESG data and supplier disclosures",
    aiGovFrameworks: ["NIST AI RMF", "OECD AI Principles"],
    sustainabilityFrameworks: [
      "GRI Standards",
      "IFRS S2",
      "SASB Standards",
      "SDG Impact Standards"
    ],
    riskEthicsFrameworks: ["ISO 31000", "UK Corporate Governance Code", "RRI Toolkit"],
    flag: "Directly supports sustainability disclosures; methodology must align to IFRS S2 and GRI definitions.",
    notes:
      "Scores feed into board-level ESG reporting and supplier selection. Methodology reviewed annually and published to suppliers for transparency."
  },
  {
    id: "AI-010",
    name: "Legacy Collections Dialler Model",
    owner: "Collections",
    techOwner: "Legacy Systems Team",
    useCase: "Optimise outbound dialling sequences for overdue accounts.",
    riskTier: "High",
    status: "Retired",
    lastReview: "2024-12-15",
    envScore: 1,
    socialScore: 4,
    economicScore: 3,
    dataCategory: "Customer contact and arrears data",
    aiGovFrameworks: [
      "EU Artificial Intelligence Act (historic design – pre-compliance)",
      "OECD AI Principles (used to assess retirement decision)"
    ],
    sustainabilityFrameworks: [
      "SDG Impact Standards (SDG 1 & 10 – financial inclusion) – review found mis-alignment"
    ],
    riskEthicsFrameworks: ["ISO 31000", "GDPR"],
    flag: "Retired due to potential unfair targeting, limited explainability and weak alignment to current responsible AI standards.",
    notes:
      "Maintained in archive for audit only. Lessons from this model are used as a negative case in the organisation’s AI training materials."
  }
];

// -----------------------------------------------------
// Helper functions
// -----------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

function eseLabel(score) {
  if (score >= 5) return "Very high";
  if (score === 4) return "High";
  if (score === 3) return "Medium";
  if (score === 2) return "Low";
  if (score === 1) return "Very low";
  return "N/A";
}

function riskBadgeClass(risk) {
  if (risk === "Minimal") return "badge badge-minimal";
  if (risk === "Limited") return "badge badge-limited";
  if (risk === "High") return "badge badge-high";
  return "badge";
}

function arrayToText(arr) {
  if (!arr || !arr.length) return "None recorded";
  return arr.join("; ");
}

// -----------------------------------------------------
// Educational explanations per framework
// -----------------------------------------------------

const frameworkExplanations = {
  // AI governance
  "EU Artificial Intelligence Act (high-risk: credit scoring)":
  "High-risk AI under the EU AI Act. Boards must ensure conformity assessments, documented risk management, human oversight, and registration in the high-risk AI system register.",
  "EU Artificial Intelligence Act (high-risk: employment-related)":
    "High-risk employment AI. Boards should focus on fairness, transparency to candidates, human oversight and appeal routes for decisions.",
  "EU Artificial Intelligence Act (high-risk: fraud monitoring and AML support)":
    "High-risk fraud and AML monitoring. Board focus: proportionality of monitoring, explainability, false positives, and due process for affected customers.",
  "EU Artificial Intelligence Act (limited-risk transparency obligations)":
    "Limited-risk AI with transparency duties. Board oversight: ensure users are told they interact with AI and that escalation to humans is possible.",
  "EU Artificial Intelligence Act (limited-risk profiling)":
    "Limited-risk profiling. Board oversight: consent, right to object and guardrails against aggressive or discriminatory targeting.",
  "EU Artificial Intelligence Act (minimal-risk: internal operations)":
    "Minimal-risk internal AI. Oversight can be lighter but should still ensure reliability, availability and clear manual override.",
  "EU Artificial Intelligence Act (minimal / limited-risk: infrastructure optimisation)":
    "Minimal/limited-risk optimisation. Boards should ensure no unintended safety, resilience or discrimination impacts.",
  "EU Artificial Intelligence Act (historic design – pre-compliance)":
    "Legacy AI pre-dating the EU AI Act. Boards should treat this as a learning case and ensure new systems follow current obligations.",

  "NIST AI RMF":
    "Frames AI risk as a socio-technical issue. Boards should expect a structured programme across Govern, Map, Measure and Manage functions.",
  "ISO/IEC 42001 (implementation in progress)":
    "Signals a move toward a formal AI management system. Boards should track progress, scope and evidence of continuous improvement.",
  "ISO/IEC 42001 (design phase)":
    "Early-stage design against ISO/IEC 42001. Boards can ask when policies, roles and controls will be fully implemented.",
  "OECD AI Principles":
    "High-level principles on trustworthy AI. Boards should expect alignment on fairness, transparency, robustness and accountability in practice.",

  // Sustainability / climate / SDGs
  "IFRS S2 (credit exposure under climate scenarios)":
    "Links the AI system to climate-related financial reporting. Boards must ensure scenarios, assumptions and data are robust and auditable.",
  "IFRS S2 (Scope 2 energy use)":
    "Connects AI-driven energy optimisation to climate disclosures. Boards should ask how savings are measured and reported.",
  "GRI Standards (service quality indicators)":
    "Focuses on service quality and customer outcomes. Boards can use this to challenge whether AI improves, rather than undermines, customer experience.",
  "GRI Standards (305 – emissions)":
    "Relates AI to emissions metrics. Boards should expect clear baselines, reduction claims and linkage to wider net-zero plans.",
  "GRI Standards":
    "Indicates that the AI system feeds into sustainability reporting. Boards should ask how definitions and metrics align with GRI guidance.",
  "SDG Impact Standards (SDG 8 & 10)":
    "Focus on decent work and reduced inequalities. Boards should ask whether AI supports or undermines fair access to finance and opportunity.",
  "SDG Impact Standards (SDG 5 & 10 – fair access to work)":
    "Highlights gender and inequality impacts in hiring. Boards must ask for evidence of fairness testing and accessible appeals.",
  "SDG Impact Standards (SDG 7 & 13)":
    "Connects AI to clean energy and climate action goals. Boards should expect quantified impact and safeguards against rebound effects.",
  "SDG Impact Standards (SDG 1 & 10 – financial inclusion) – review found mis-alignment":
    "Signals misalignment with inclusion goals. Boards should treat this as a cautionary tale and ensure new models avoid similar harms.",
  "SDG Impact Standards (responsible consumption & production)":
    "Relates to responsible marketing and consumption patterns. Boards should ask how AI avoids exploitative or wasteful behaviours.",
  "SASB Standards":
    "Links supplier and ESG scoring to industry-specific sustainability metrics. Boards can use this to align procurement decisions with ESG strategy.",

  // Risk, ethics, corporate governance
  "ISO 31000":
    "Positions AI within the enterprise risk management framework. Boards should expect risk appetite, controls and assurance to be explicitly defined.",
  "UK Corporate Governance Code":
    "Ties AI decisions to board duties on risk, controls and reporting. Boards should ensure AI risks are integrated into existing governance structures.",
  "UK Corporate Governance Code (operational resilience)":
    "Highlights operational resilience. Boards should ensure AI supports continuity, not new single points of failure.",
  "GDPR":
    "Emphasises data protection, lawful processing, minimisation and rights of individuals. Boards should request DPIAs and evidence of compliance.",
  "RRI Toolkit":
    "Points to Responsible Research and Innovation practices. Boards can ask how stakeholder engagement, reflection and responsiveness are built into AI projects."
};

// -----------------------------------------------------
// DOM references
// -----------------------------------------------------

const elements = {
  date: document.getElementById("esec3-today-date"),

  envScore: document.getElementById("esec3-envScore"),
  socScore: document.getElementById("esec3-socScore"),
  ecoScore: document.getElementById("esec3-ecoScore"),

  statTotal: document.getElementById("esec3-stat-total"),
  statHigh: document.getElementById("esec3-stat-high"),
  statReview: document.getElementById("esec3-stat-review"),
  statStrong: document.getElementById("esec3-stat-strong"),

  oversightCue: document.getElementById("esec3-oversightCue"),

  riskFilter: document.getElementById("esec3-risk-filter"),
  statusFilter: document.getElementById("esec3-status-filter"),
  ownerFilter: document.getElementById("esec3-owner-filter"),
  frameworkFilter: document.getElementById("esec3-framework-filter"),
  searchInput: document.getElementById("esec3-search-input"),
  resetFiltersBtn: document.getElementById("esec3-reset-filters"),

  tableBody: document.getElementById("esec3-inventory-body"),
  noResults: document.getElementById("esec3-no-results"),

  detailHint: document.getElementById("esec3-detail-hint"),
  detailContent: document.getElementById("esec3-detail-content"),
  detailId: document.getElementById("esec3-detail-id"),
  detailName: document.getElementById("esec3-detail-name"),
  detailOwner: document.getElementById("esec3-detail-owner"),
  detailTechOwner: document.getElementById("esec3-detail-tech-owner"),
  detailStatus: document.getElementById("esec3-detail-status"),
  detailRisk: document.getElementById("esec3-detail-risk"),
  detailLastReview: document.getElementById("esec3-detail-last-review"),
  detailUsecase: document.getElementById("esec3-detail-usecase"),
  detailEnv: document.getElementById("esec3-detail-env"),
  detailSoc: document.getElementById("esec3-detail-soc"),
  detailEc: document.getElementById("esec3-detail-ec"),
  detailDataCategory: document.getElementById("esec3-detail-data-category"),
  detailAiGov: document.getElementById("esec3-detail-ai-gov"),
  detailSustainability: document.getElementById("esec3-detail-sustainability"),
  detailRiskEthics: document.getElementById("esec3-detail-risk-ethics"),
  detailFlag: document.getElementById("esec3-detail-flag"),
  detailNotes: document.getElementById("esec3-detail-notes"),

  // Educational lens spans
  eduAiGov: document.getElementById("esec3-edu-aiGov"),
  eduSustainability: document.getElementById("esec3-edu-sustainability"),
  eduRiskEthics: document.getElementById("esec3-edu-risk-ethics")
};

// -----------------------------------------------------
// State
// -----------------------------------------------------

let currentFiltered = [...aiInventory];
let currentSortField = null;
let currentSortDirection = "asc";

// -----------------------------------------------------
// Core portfolio calculations
// -----------------------------------------------------

function computePortfolioMetrics(list) {
  if (!list.length) {
    return {
      env: 0,
      soc: 0,
      eco: 0,
      total: 0,
      highRisk: 0,
      inReview: 0,
      strong: 0
    };
  }

  const total = list.length;

  let envSum = 0;
  let socSum = 0;
  let ecoSum = 0;
  let highRisk = 0;
  let inReview = 0;
  let strong = 0;

  list.forEach(item => {
    envSum += item.envScore;
    socSum += item.socialScore;
    ecoSum += item.economicScore;

    if (item.riskTier === "High") highRisk += 1;
    if (item.status === "Pilot" || item.status === "Under assessment") inReview += 1;
    if (item.envScore >= 4 && item.socialScore >= 4 && item.economicScore >= 4) strong += 1;
  });

  const envAvg = envSum / total;
  const socAvg = socSum / total;
  const ecoAvg = ecoSum / total;

  return {
    env: envAvg,
    soc: socAvg,
    eco: ecoAvg,
    total,
    highRisk,
    inReview,
    strong
  };
}

function updateGaugesFromAverages(metrics) {
  // convert 1–5 to 0–100
  const envScore100 = Math.round((metrics.env / 5) * 100) || 0;
  const socScore100 = Math.round((metrics.soc / 5) * 100) || 0;
  const ecoScore100 = Math.round((metrics.eco / 5) * 100) || 0;

  elements.envScore.textContent = envScore100;
  elements.socScore.textContent = socScore100;
  elements.ecoScore.textContent = ecoScore100;

  const envGauge = document.querySelector('.gauge[data-dimension="environment"]');
  const socGauge = document.querySelector('.gauge[data-dimension="social"]');
  const ecoGauge = document.querySelector('.gauge[data-dimension="economic"]');

  envGauge.style.setProperty("--angle", `${(envScore100 / 100) * 360}deg`);
  socGauge.style.setProperty("--angle", `${(socScore100 / 100) * 360}deg`);
  ecoGauge.style.setProperty("--angle", `${(ecoScore100 / 100) * 360}deg`);

  elements.statTotal.textContent = metrics.total;
  elements.statHigh.textContent = metrics.highRisk;
  elements.statReview.textContent = metrics.inReview;
  elements.statStrong.textContent = metrics.strong;

  // Oversight cue text aligned to survey / LR findings
  const combined = (metrics.env + metrics.soc + metrics.eco) / 3;
  let message =
    "Use the filters to explore subsets of your AI portfolio. Lower scores in any lens suggest a need for deeper board questions and targeted controls.";

  if (!metrics.total) {
    message =
      "No AI systems match the current filters. Reset the filters to regain a full-portfolio view.";
  } else if (combined < 2.5) {
    message =
      "Overall E–S–Ec alignment is weak. Boards should treat the portfolio as high oversight risk and prioritise governance, assurance and framework-aligned remediation.";
  } else if (combined < 3.5) {
    message =
      "E–S–Ec alignment is mixed. Some systems are maturing, but boards should request clearer evidence of trade-off management, data quality and framework coverage.";
  } else {
    message =
      "E–S–Ec alignment is strengthening, but boards should maintain regular reporting, independent challenge and linkage to frameworks such as EU AI Act, NIST AI RMF and IFRS S2.";
  }

  elements.oversightCue.textContent = message;
}

// -----------------------------------------------------
// Educational summary builder
// -----------------------------------------------------

function buildEducationalSummaries(item) {
  const aiGov = item.aiGovFrameworks || [];
  const sust = item.sustainabilityFrameworks || [];
  const riskEthics = item.riskEthicsFrameworks || [];

  const summarise = frameworkList => {
    if (!frameworkList.length) return "No specific frameworks recorded for this lens.";
    const messages = [];

    frameworkList.forEach(fr => {
      const expl = frameworkExplanations[fr];
      if (expl) {
        messages.push(expl);
      }
    });

    if (!messages.length) {
      return "Frameworks recorded, but no additional educational summary is available yet. Boards should still expect evidence of practical alignment.";
    }

    // Keep it readable: one or two sentences merged, or top three if many
    if (messages.length === 1) return messages[0];
    if (messages.length === 2) return `${messages[0]} ${messages[1]}`;
    return `${messages[0]} ${messages[1]} ${messages[2]}`;
  };

  return {
    aiGovSummary: summarise(aiGov),
    sustainabilitySummary: summarise(sust),
    riskEthicsSummary: summarise(riskEthics)
  };
}

// -----------------------------------------------------
// Table rendering
// -----------------------------------------------------

function renderTable(list) {
  elements.tableBody.innerHTML = "";

  if (!list.length) {
    elements.noResults.hidden = false;
    return;
  }
  elements.noResults.hidden = true;

  list.forEach(item => {
    const tr = document.createElement("tr");
    tr.dataset.id = item.id;

    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.owner}</td>
      <td><span class="${riskBadgeClass(item.riskTier)}">${item.riskTier}</span></td>
      <td><span class="badge badge-status">${item.status}</span></td>
      <td>${item.envScore}</td>
      <td>${item.socialScore}</td>
      <td>${item.economicScore}</td>
    `;

    tr.addEventListener("click", () => handleRowClick(item.id));
    elements.tableBody.appendChild(tr);
  });

  clearSelectedRowHighlight();
}

function clearSelectedRowHighlight() {
  document.querySelectorAll(".inventory-table tbody tr").forEach(row => {
    row.classList.remove("selected");
  });
}

function handleRowClick(id) {
  const item = aiInventory.find(x => x.id === id);
  if (!item) return;

  clearSelectedRowHighlight();
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if (row) row.classList.add("selected");

  populateDetails(item);
}

function populateDetails(item) {
  elements.detailHint.hidden = true;
  elements.detailContent.hidden = false;

  elements.detailId.textContent = item.id;
  elements.detailName.textContent = item.name;
  elements.detailOwner.textContent = item.owner;
  elements.detailTechOwner.textContent = item.techOwner;
  elements.detailStatus.textContent = item.status;
  elements.detailRisk.textContent = item.riskTier;
  elements.detailLastReview.textContent = formatDate(item.lastReview);
  elements.detailUsecase.textContent = item.useCase;

  elements.detailEnv.textContent = `${item.envScore} (${eseLabel(item.envScore)})`;
  elements.detailSoc.textContent = `${item.socialScore} (${eseLabel(item.socialScore)})`;
  elements.detailEc.textContent = `${item.economicScore} (${eseLabel(item.economicScore)})`;

  elements.detailDataCategory.textContent = item.dataCategory;
  elements.detailAiGov.textContent = arrayToText(item.aiGovFrameworks);
  elements.detailSustainability.textContent = arrayToText(item.sustainabilityFrameworks);
  elements.detailRiskEthics.textContent = arrayToText(item.riskEthicsFrameworks);
  elements.detailFlag.textContent = item.flag;
  elements.detailNotes.textContent = item.notes;

  // Educational summaries for each lens
  const edu = buildEducationalSummaries(item);
  elements.eduAiGov.textContent = edu.aiGovSummary;
  elements.eduSustainability.textContent = edu.sustainabilitySummary;
  elements.eduRiskEthics.textContent = edu.riskEthicsSummary;
}

// -----------------------------------------------------
// Filters and sorting
// -----------------------------------------------------

function initOwnerFilter() {
  const owners = Array.from(new Set(aiInventory.map(item => item.owner))).sort();
  owners.forEach(owner => {
    const opt = document.createElement("option");
    opt.value = owner;
    opt.textContent = owner;
    elements.ownerFilter.appendChild(opt);
  });
}

function applyFilters() {
  const searchTerm = elements.searchInput.value.trim().toLowerCase();
  const risk = elements.riskFilter.value;
  const status = elements.statusFilter.value;
  const owner = elements.ownerFilter.value;
  const frameworkLens = elements.frameworkFilter.value;

  let list = [...aiInventory];

  if (searchTerm) {
    list = list.filter(item => {
      return (
        item.id.toLowerCase().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.owner.toLowerCase().includes(searchTerm) ||
        item.useCase.toLowerCase().includes(searchTerm)
      );
    });
  }

  if (risk !== "all") {
    list = list.filter(item => item.riskTier === risk);
  }

  if (status !== "all") {
    list = list.filter(item => item.status === status);
  }

  if (owner !== "all") {
    list = list.filter(item => item.owner === owner);
  }

  if (frameworkLens !== "all") {
    list = list.filter(item => {
      if (frameworkLens === "aiGov") {
        return item.aiGovFrameworks && item.aiGovFrameworks.length;
      }
      if (frameworkLens === "sustainability") {
        return item.sustainabilityFrameworks && item.sustainabilityFrameworks.length;
      }
      if (frameworkLens === "riskEthics") {
        return item.riskEthicsFrameworks && item.riskEthicsFrameworks.length;
      }
      return true;
    });
  }

  currentFiltered = list;
  applySortAndRender();
  const metrics = computePortfolioMetrics(currentFiltered);
  updateGaugesFromAverages(metrics);
}

function applySortAndRender() {
  if (!currentSortField) {
    renderTable(currentFiltered);
    return;
  }

  const field = currentSortField;
  const direction = currentSortDirection;

  const sorted = [...currentFiltered].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal === bVal) return 0;

    if (typeof aVal === "string") {
      const aLower = aVal.toLowerCase();
      const bLower = bVal.toLowerCase();
      const comp = aLower < bLower ? -1 : 1;
      return direction === "asc" ? comp : -comp;
    }

    if (typeof aVal === "number") {
      const comp = aVal - bVal;
      return direction === "asc" ? comp : -comp;
    }

    return 0;
  });

  renderTable(sorted);
}

function handleSortClick(field) {
  if (currentSortField === field) {
    currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
  } else {
    currentSortField = field;
    currentSortDirection = "asc";
  }
  applySortAndRender();
}

function resetFilters() {
  elements.searchInput.value = "";
  elements.riskFilter.value = "all";
  elements.statusFilter.value = "all";
  elements.ownerFilter.value = "all";
  elements.frameworkFilter.value = "all";

  currentSortField = null;
  currentSortDirection = "asc";
  currentFiltered = [...aiInventory];

  renderTable(currentFiltered);
  const metrics = computePortfolioMetrics(currentFiltered);
  updateGaugesFromAverages(metrics);

  elements.detailHint.hidden = false;
  elements.detailContent.hidden = true;
}

// -----------------------------------------------------
// Init
// -----------------------------------------------------

function initDate() {
  const today = new Date();
  elements.date.textContent = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

function initEvents() {
  elements.searchInput.addEventListener("input", applyFilters);
  elements.riskFilter.addEventListener("change", applyFilters);
  elements.statusFilter.addEventListener("change", applyFilters);
  elements.ownerFilter.addEventListener("change", applyFilters);
  elements.frameworkFilter.addEventListener("change", applyFilters);
  elements.resetFiltersBtn.addEventListener("click", resetFilters);

  document.querySelectorAll(".inventory-table th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const field = th.getAttribute("data-sort");
      handleSortClick(field);
    });
  });
}

function initLens() {
  initDate();
  initOwnerFilter();

  currentFiltered = [...aiInventory];
  renderTable(currentFiltered);

  const metrics = computePortfolioMetrics(currentFiltered);
  updateGaugesFromAverages(metrics);

  initEvents();
}



  // Prevent auto-run; expose init via AIRiskNav SPA hook
  window.AIRiskNav = window.AIRiskNav || { data: {}, modules: {} };
  window.AIRiskNav.modules = window.AIRiskNav.modules || {};

  let __esec3InitDone = false;
  window.AIRiskNav.modules.initESEc = function initESEc_V3() {
    if (__esec3InitDone) return;
    __esec3InitDone = true;
    try {
      initLens();
    } catch (e) {
      console.error('ESEc Lens V3 init failed:', e);
    }
  };
})();
/* E–S–Ec Lens (Board view) built from aiSystems + incidents
   - No dependency on aiInventory
   - Accessible table selection (keyboard + click)
   - KPI tiles act as filters
   - UDL: progressive disclosure in details, right panel narrative
*/

(function () {
  "use strict";

  // -----------------------------
  // 0) Your data (paste/keep yours)
  // -----------------------------
  // If you already have these defined elsewhere globally, remove the duplicates here.
  const aiSystems = window.aiSystems || {
    "AI-001": "Customer Credit Scoring Engine",
    "AI-002": "Contact Centre Chatbot",
    "AI-003": "Fraud Transaction Anomaly Detector",
    "AI-004": "HR Candidate Screening Tool",
    "AI-005": "Marketing Propensity Model",
    "AI-006": "IT Ticket Prioritisation Model",
    "AI-007": "Energy Optimisation for Data Centre",
    "AI-008": "Document Classification Assistant",
    "AI-009": "Supplier ESG Risk Scoring",
    "AI-010": "Legacy Collections Dialler Model"
  };

  const incidents = window.incidents || [];

  // -----------------------------
  // 1) Helpers
  // -----------------------------
  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (s) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s];
    });
  }

  function exposureToScore(level) {
    // Board-friendly mapping: higher exposure => lower score
    if (level === "high") return 40;
    if (level === "med") return 70;
    return 90;
  }

  function avg(arr) {
    if (!arr || !arr.length) return null;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }

  function mean(nums) {
    const v = nums.filter((n) => typeof n === "number");
    if (!v.length) return null;
    return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
  }

  function statusFromScore(n) {
    if (n == null) return "Unknown";
    if (n < 55) return "Needs review";
    if (n < 70) return "Watch";
    return "Strong";
  }

  function formatAsAt() {
    const d = new Date();
    try {
      return d.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "2-digit"
      });
    } catch {
      return d.toDateString();
    }
  }

  function computeTradeoffRisk(sys) {
    if (sys.E == null || sys.S == null || sys.Ec == null) return false;
    const spread = Math.max(sys.E, sys.S, sys.Ec) - Math.min(sys.E, sys.S, sys.Ec);
    return spread >= 35;
  }

  function computeBoardAttention(sys) {
    // board attention if any High severity OR large trade-off spread
    return (sys.highSeverityCount || 0) >= 1 || computeTradeoffRisk(sys);
  }

  function flagsFor(sys) {
    const f = [];
    if (computeBoardAttention(sys)) f.push("Board attention");
    if ((sys.highSeverityCount || 0) >= 1) f.push("High severity");
    if ((sys.nearMissCount || 0) >= 1) f.push("Near miss");
    if (computeTradeoffRisk(sys)) f.push("Trade-off risk");
    if ((sys.strengthenedControlsCount || 0) >= 1) f.push("Controls updated");
    return f;
  }

  function safeNum(n) {
    return typeof n === "number" ? String(n) : "—";
  }

  function announce(elLive, msg) {
    if (!elLive) return;
    elLive.textContent = "";
    setTimeout(() => {
      elLive.textContent = msg;
    }, 30);
  }

  // -----------------------------
  // 2) Build system-level dataset from incidents
  // -----------------------------
  function buildSystemsFromIncidents() {
    const ids = Object.keys(aiSystems).sort();

    const agg = {};
    ids.forEach((id) => {
      agg[id] = {
        id,
        name: aiSystems[id],
        E: [],
        S: [],
        Ec: [],
        incidentCount: 0,
        highSeverityCount: 0,
        nearMissCount: 0,
        strengthenedControlsCount: 0,
        linked: [] // linked incidents
      };
    });

    incidents.forEach((inc) => {
      (inc.systems || []).forEach((sid) => {
        if (!agg[sid]) return;

        agg[sid].incidentCount += 1;
        if (inc.severity === "High") agg[sid].highSeverityCount += 1;
        if (inc.category === "Near miss") agg[sid].nearMissCount += 1;
        if (inc.strengthenedControls) agg[sid].strengthenedControlsCount += 1;

        agg[sid].E.push(exposureToScore(inc.env));
        agg[sid].S.push(exposureToScore(inc.soc));
        agg[sid].Ec.push(exposureToScore(inc.eco));

        agg[sid].linked.push(inc);
      });
    });

    return Object.values(agg).map((s) => {
      const E = avg(s.E);
      const S = avg(s.S);
      const Ec = avg(s.Ec);

      return {
        id: s.id,
        name: s.name,
        E,
        S,
        Ec,
        incidentCount: s.incidentCount,
        highSeverityCount: s.highSeverityCount,
        nearMissCount: s.nearMissCount,
        strengthenedControlsCount: s.strengthenedControlsCount,
        linked: s.linked
      };
    });
  }

  // -----------------------------
  // 3) Main init
  // -----------------------------
  window.initESEcLensFromIncidents = function initESEcLensFromIncidents() {
    // DOM cache
    const el = {
      asat: document.getElementById("esec-asat"),
      viewing: document.getElementById("esec-viewing"),
      live: document.getElementById("esec-live"),
      cue: document.getElementById("esec-cue"),

      kpiAttn: document.getElementById("kpi-attn"),
      kpiHigh: document.getElementById("kpi-high"),
      kpiNear: document.getElementById("kpi-near"),
      kpiStr: document.getElementById("kpi-str"),
      clear: document.getElementById("esec-clear"),

      eScore: document.getElementById("e-score"),
      sScore: document.getElementById("s-score"),
      ecScore: document.getElementById("ec-score"),
      eStatus: document.getElementById("e-status"),
      sStatus: document.getElementById("s-status"),
      ecStatus: document.getElementById("ec-status"),
      eTrend: document.getElementById("e-trend"),
      sTrend: document.getElementById("s-trend"),
      ecTrend: document.getElementById("ec-trend"),

      fSystem: document.getElementById("f-system"),
      fCategory: document.getElementById("f-category"),
      fSeverity: document.getElementById("f-severity"),
      fLens: document.getElementById("f-lens"),
      fQ: document.getElementById("f-q"),

      count: document.getElementById("esec-count"),
      tbody: document.getElementById("esec-tbody"),

      dTitle: document.getElementById("d-title"),
      dBody: document.getElementById("d-body"),
      dClose: document.getElementById("d-close"),

      exportBtn: document.getElementById("esec-export"),
      jumpBtn: document.getElementById("esec-jump")
    };

    // Basic presence check (prevents “not working” silent failures)
    if (!el.tbody || !el.fSystem || !el.kpiAttn || !el.eScore || !el.dBody) {
      console.warn("[ESEc] Required DOM nodes missing. Check IDs in HTML.");
      return;
    }

    // As-at
    if (el.asat) el.asat.textContent = formatAsAt();

    // Build dataset
    const systems = buildSystemsFromIncidents();

    // Filters state
    let activeKpi = null;
    let selectedId = null;

    // Populate System dropdown
    el.fSystem.innerHTML = `<option value="all">All systems</option>`;
    systems
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id))
      .forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = `${s.id} – ${s.name}`;
        el.fSystem.appendChild(opt);
      });

    // KPI counts + portfolio scores
    function renderPortfolio() {
      const attn = systems.filter(computeBoardAttention).length;
      const high = incidents.filter((i) => i.severity === "High").length;
      const near = incidents.filter((i) => i.category === "Near miss").length;
      const strengthened = incidents.filter((i) => i.strengthenedControls).length;

      el.kpiAttn.textContent = String(attn);
      el.kpiHigh.textContent = String(high);
      el.kpiNear.textContent = String(near);
      el.kpiStr.textContent = String(strengthened);

      const E = mean(systems.map((s) => s.E));
      const S = mean(systems.map((s) => s.S));
      const Ec = mean(systems.map((s) => s.Ec));

      el.eScore.textContent = E ?? "—";
      el.sScore.textContent = S ?? "—";
      el.ecScore.textContent = Ec ?? "—";

      el.eStatus.textContent = statusFromScore(E);
      el.sStatus.textContent = statusFromScore(S);
      el.ecStatus.textContent = statusFromScore(Ec);

      // Simple signals for boards: “where is worst?”
      const worst = (vals) => {
        const v = vals.filter((n) => typeof n === "number");
        return v.length ? Math.min(...v) : null;
      };
      const worstE = worst(systems.map((s) => s.E));
      const worstS = worst(systems.map((s) => s.S));
      const worstEc = worst(systems.map((s) => s.Ec));

      el.eTrend.textContent = worstE != null ? `Worst: ${worstE}` : "—";
      el.sTrend.textContent = worstS != null ? `Worst: ${worstS}` : "—";
      el.ecTrend.textContent = worstEc != null ? `Worst: ${worstEc}` : "—";
    }

    // Filtering: system + incident category/severity + lens focus + search + KPI overlay
    function applyFilters() {
      const sys = el.fSystem.value;
      const cat = el.fCategory.value;
      const sev = el.fSeverity.value;
      const lens = el.fLens.value;
      const q = (el.fQ.value || "").trim().toLowerCase();

      // Start from all systems
      let list = systems.slice();

      // System filter
      if (sys !== "all") list = list.filter((s) => s.id === sys);

      // Category/severity/search operate over linked incidents
      list = list.filter((s) => {
        const linked = s.linked || [];
        if (!linked.length) {
          // If filtering by incident properties, hide systems with no incidents
          if (cat !== "all" || sev !== "all" || q) return false;
          return true;
        }

        let ok = true;

        if (cat !== "all") ok = linked.some((i) => i.category === cat);
        if (ok && sev !== "all") ok = linked.some((i) => i.severity === sev);

        if (ok && q) {
          const hay =
            `${s.id} ${s.name} ` +
            linked.map((i) => `${i.title} ${i.type} ${i.category} ${i.severity}`).join(" ");
          ok = hay.toLowerCase().includes(q);
        }

        return ok;
      });

      // Lens focus
      if (lens !== "all") {
        list = list.filter((s) => {
          if (s.E == null || s.S == null || s.Ec == null) return false;
          const max = Math.max(s.E, s.S, s.Ec);
          const min = Math.min(s.E, s.S, s.Ec);
          const spread = max - min;

          if (lens === "env") return s.E === min;  // lowest score => highest exposure
          if (lens === "soc") return s.S === min;
          if (lens === "eco") return s.Ec === min;
          if (lens === "tradeoff") return spread >= 35;
          return true;
        });
      }

      // KPI overlay filters
      if (activeKpi === "attention") list = list.filter(computeBoardAttention);
      if (activeKpi === "highSeverity") list = list.filter((s) => (s.highSeverityCount || 0) >= 1);
      if (activeKpi === "nearMiss") list = list.filter((s) => (s.nearMissCount || 0) >= 1);
      if (activeKpi === "strengthened") list = list.filter((s) => (s.strengthenedControlsCount || 0) >= 1);

      // Board-first sort: attention, then high severity, then tradeoff spread, then incident count
      list.sort((a, b) => {
        const aa = computeBoardAttention(a) ? 0 : 1;
        const bb = computeBoardAttention(b) ? 0 : 1;
        if (aa !== bb) return aa - bb;

        const ah = (a.highSeverityCount || 0) ? 0 : 1;
        const bh = (b.highSeverityCount || 0) ? 0 : 1;
        if (ah !== bh) return ah - bh;

        const asp =
          a.E != null && a.S != null && a.Ec != null
            ? Math.max(a.E, a.S, a.Ec) - Math.min(a.E, a.S, a.Ec)
            : -1;
        const bsp =
          b.E != null && b.S != null && b.Ec != null
            ? Math.max(b.E, b.S, b.Ec) - Math.min(b.E, b.S, b.Ec)
            : -1;
        if (asp !== bsp) return bsp - asp;

        return (b.incidentCount || 0) - (a.incidentCount || 0);
      });

      renderTable(list);
      el.count.textContent = `${list.length} system${list.length === 1 ? "" : "s"}`;

      if (selectedId && !list.some((x) => x.id === selectedId)) clearSelection(true);
    }

    function renderTable(list) {
      el.tbody.innerHTML = "";

      list.forEach((s, idx) => {
        const tr = document.createElement("tr");
        tr.tabIndex = 0;
        tr.dataset.id = s.id;
        tr.setAttribute("role", "row");
        tr.setAttribute("aria-selected", String(s.id === selectedId));

        const fl = flagsFor(s);
        tr.innerHTML = `
          <td>${escapeHtml(s.id)}</td>
          <td>${escapeHtml(s.name)}</td>
          <td>${escapeHtml(String(s.incidentCount || 0))}</td>
          <td>${escapeHtml(String(s.highSeverityCount || 0))}</td>
          <td>${escapeHtml(String(s.nearMissCount || 0))}</td>
          <td>${safeNum(s.E)}</td>
          <td>${safeNum(s.S)}</td>
          <td>${safeNum(s.Ec)}</td>
          <td>
            <div class="flags">
              ${fl.length ? fl.map((f) => `<span class="flag">${escapeHtml(f)}</span>`).join("") : `<span class="muted">—</span>`}
            </div>
          </td>
        `;

        tr.addEventListener("click", () => selectSystem(s.id));
        tr.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectSystem(s.id);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            focusRow(idx + 1);
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            focusRow(idx - 1);
          }
        });

        el.tbody.appendChild(tr);
      });
    }

    function focusRow(i) {
      const rows = [...el.tbody.querySelectorAll("tr")];
      if (!rows.length) return;
      const clamped = Math.max(0, Math.min(rows.length - 1, i));
      rows[clamped].focus();
    }

    function selectSystem(id) {
      selectedId = id;

      const sys = systems.find((x) => x.id === id);
      if (!sys) return;

      [...el.tbody.querySelectorAll("tr")].forEach((tr) => {
        tr.setAttribute("aria-selected", String(tr.dataset.id === id));
      });

      el.viewing.textContent = id;
      el.dTitle.textContent = sys.name;

      const fl = flagsFor(sys);
      el.cue.textContent = fl.length
        ? `Flags: ${fl.join(", ")}. Review linked events and assurance evidence.`
        : `No critical flags detected. Review trends and evidence as standard.`;

      el.dBody.innerHTML = renderDetails(sys);
      announce(el.live, `Selected ${sys.name}.`);
    }

    function clearSelection(silent) {
      selectedId = null;
      el.viewing.textContent = "Portfolio";
      el.dTitle.textContent = "System details";
      el.dBody.innerHTML = `<p class="muted">Select a system to see its E–S–Ec profile and linked incidents.</p>`;
      el.cue.textContent = `Select a system to see its E–S–Ec profile and linked incidents.`;
      [...el.tbody.querySelectorAll("tr")].forEach((tr) => tr.setAttribute("aria-selected", "false"));
      if (!silent) announce(el.live, "Selection cleared.");
    }

    function renderDetails(sys) {
      const linked = (sys.linked || [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const incidentHtml = linked.length
        ? linked
            .map((inc) => {
              const e = inc.env === "high" ? "High" : inc.env === "med" ? "Medium" : "Low";
              const s = inc.soc === "high" ? "High" : inc.soc === "med" ? "Medium" : "Low";
              const ec = inc.eco === "high" ? "High" : inc.eco === "med" ? "Medium" : "Low";
              return `
                <details class="help">
                  <summary>${escapeHtml(inc.id)} · ${escapeHtml(inc.title)} (${escapeHtml(inc.severity)})</summary>
                  <div class="help__body">
                    <p><strong>Date:</strong> ${escapeHtml(inc.date)}</p>
                    <p><strong>Category:</strong> ${escapeHtml(inc.category)} · <strong>Type:</strong> ${escapeHtml(inc.type)}</p>
                    <p><strong>Summary:</strong> ${escapeHtml(inc.summary)}</p>
                    <p><strong>Impact:</strong> ${escapeHtml(inc.impact)}</p>
                    <p><strong>Response:</strong> ${escapeHtml(inc.response)}</p>
                    <p><strong>Residual risk:</strong> ${escapeHtml(inc.residualRisk || "Not assessed")}</p>
                    <p><strong>Exposure:</strong> E ${escapeHtml(e)}, S ${escapeHtml(s)}, Ec ${escapeHtml(ec)}</p>
                    <p><strong>Controls strengthened:</strong> ${inc.strengthenedControls ? "Yes" : "No"}</p>
                  </div>
                </details>
              `;
            })
            .join("")
        : `<p class="muted">No linked incidents recorded for this system.</p>`;

      const fl = flagsFor(sys);
      const spread =
        sys.E != null && sys.S != null && sys.Ec != null
          ? Math.max(sys.E, sys.S, sys.Ec) - Math.min(sys.E, sys.S, sys.Ec)
          : null;

      return `
        <div>
          <p><strong>ID:</strong> ${escapeHtml(sys.id)}</p>
          <p><strong>Incidents linked:</strong> ${escapeHtml(String(sys.incidentCount || 0))}</p>
          <p><strong>High severity:</strong> ${escapeHtml(String(sys.highSeverityCount || 0))} ·
             <strong>Near misses:</strong> ${escapeHtml(String(sys.nearMissCount || 0))}</p>
          <p><strong>Controls updated:</strong> ${escapeHtml(String(sys.strengthenedControlsCount || 0))}</p>

          <hr />

          <h3 class="h2">E–S–Ec profile</h3>
          <p class="muted">Scores are derived from incident exposure (0–100; lower means higher exposure).</p>
          <ul>
            <li><strong>Environment:</strong> ${safeNum(sys.E)} / 100</li>
            <li><strong>Social:</strong> ${safeNum(sys.S)} / 100</li>
            <li><strong>Economic:</strong> ${safeNum(sys.Ec)} / 100</li>
          </ul>
          ${
            spread != null
              ? `<p class="muted"><strong>Trade-off spread:</strong> ${escapeHtml(String(spread))} (higher means more imbalance)</p>`
              : ""
          }

          ${fl.length ? `<div class="flags">${fl.map((f) => `<span class="flag">${escapeHtml(f)}</span>`).join("")}</div>` : ""}

          <hr />

          <h3 class="h2">Linked incidents</h3>
          ${incidentHtml}

          <hr />

          <h3 class="h2">Board questions</h3>
          <ol>
            <li>What evidence supports the current controls (tests, audits, monitoring, assurance)?</li>
            <li>Where are the trade-offs and who approved them?</li>
            <li>What is the operational, regulatory, and reputational downside if challenged or fails?</li>
          </ol>
        </div>
      `;
    }

    // KPI click binding
    document.querySelectorAll(".esec-kpis .kpi[data-kpi]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const k = btn.dataset.kpi;
        activeKpi = activeKpi === k ? null : k;
        announce(el.live, activeKpi ? `Filter applied: ${k}` : "KPI filter cleared.");
        applyFilters();
      });
    });

    // Filters binding
    [el.fSystem, el.fCategory, el.fSeverity, el.fLens].forEach((s) => s.addEventListener("change", applyFilters));
    el.fQ.addEventListener("input", applyFilters);

    // Clear
    el.clear.addEventListener("click", () => {
      activeKpi = null;
      el.fSystem.value = "all";
      el.fCategory.value = "all";
      el.fSeverity.value = "all";
      el.fLens.value = "all";
      el.fQ.value = "";
      clearSelection(true);
      applyFilters();
      announce(el.live, "All filters cleared.");
    });

    // Close details
    el.dClose.addEventListener("click", () => clearSelection(false));

    // Export
    el.exportBtn.addEventListener("click", () => {
      const rows = systems.map((s) => ({
        id: s.id,
        name: s.name,
        incidents: s.incidentCount,
        highSeverity: s.highSeverityCount,
        nearMisses: s.nearMissCount,
        controlsStrengthened: s.strengthenedControlsCount,
        E: s.E,
        S: s.S,
        Ec: s.Ec
      }));
      const csv = toCSV(rows);
      downloadText(csv, "esec-lens-export.csv", "text/csv");
      announce(el.live, "Export generated.");
    });

    // Jump button (wire to your SPA if you have it)
    el.jumpBtn.addEventListener("click", () => {
      if (typeof window.showView === "function") {
        window.showView("risk"); // change if your view id differs
      } else {
        announce(el.live, "Jump not available in this build.");
      }
    });

    function toCSV(rows) {
      const cols = Object.keys(rows[0] || { id: "" });
      const head = cols.join(",");
      const body = rows
        .map((r) => cols.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
      return `${head}\n${body}\n`;
    }

    function downloadText(text, filename, mime) {
      const blob = new Blob([text], { type: mime || "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 250);
    }

    // Initial render
    renderPortfolio();
    clearSelection(true);
    applyFilters();

    // Optional sanity log (remove later)
    console.log("[ESEc] systems built:", systems.length, "incidents:", incidents.length);
  };
})();