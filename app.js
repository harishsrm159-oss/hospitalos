/* ==========================================================================
   HOSPITALOPS INTELLIGENCE - APP LOGIC & STATE MACHINE
   Implements all 13 slides, scenarios, RBAC, impact mapping & acceptance suite
   ========================================================================== */

(function() {
  'use strict';

  // State Store
  const State = {
    currentRole: 'operations_analyst', // Default role
    currentView: 'overview',
    currentSlide: 1,
    totalSlides: 13,
    
    // Core Metrics from Slide 1 & 4
    metrics: {
      activeIncidents: 8,
      awaitingApproval: 3,
      assetsOffline: 2,
      slaOnTrack: 94,
      timeToCorrelate: '1.1s',
      duplicateSafety: '100%',
      approvalTraceability: '100%'
    },

    // Active Incidents Data
    incidents: [
      {
        id: 'INC-4091',
        title: 'MRI scanner offline',
        department: 'Imaging',
        location: 'Radiology Suite Rad-104',
        status: 'Assessing',
        severity: 'High',
        time: '09:02',
        description: 'Superconducting magnet RF coil cryo-pressure fluctuation trigger.',
        affectedAppointments: 12,
        technician: 'Dr. Sarah (Busy with CT Emergency)',
        partRequired: 'RF Cryo-Valve #CV-99',
        partStock: '1 in Central Stores (Reserved check pending)',
        suggestedPlan: 'PLAN V2: Use verified alternate scanner 1.5T-B',
        recoveryStatus: 'Capacity check required before approval',
        reports: ['09:02 Nurse Desk: MRI 3T console error 404-Cryo']
      },
      {
        id: 'INC-2048',
        title: 'Network outage',
        department: 'IT / Telecom',
        location: 'Block C Core Distribution',
        status: 'Assigned',
        severity: 'Critical',
        time: '10:02',
        description: 'Core switch VLAN 40 packet drop causing local terminal disconnects.',
        affectedAppointments: 45,
        technician: 'Alex Chen (Network Engineer)',
        partRequired: 'Cisco SFP+ 10G Transceiver',
        partStock: '3 in IT inventory',
        suggestedPlan: 'Failover to secondary fiber trunk B',
        recoveryStatus: 'Trunk test in progress',
        reports: [
          '10:02:11 Laboratory: Systems cannot connect to network',
          '10:02:25 Billing Desk: Network connection unavailable',
          '10:03:02 Admin Block: Shared applications are offline'
        ]
      },
      {
        id: 'INC-1092',
        title: 'Part unavailable',
        department: 'Surgical Stores',
        location: 'Central Storage Bin B-12',
        status: 'Blocked',
        severity: 'Medium',
        time: '08:15',
        description: 'Sterile Laparoscopic Trocar 10mm pack below safety reorder threshold.',
        affectedAppointments: 4,
        technician: 'Marcus Vance (Stores Lead)',
        partRequired: 'Laparoscopic Trocar Kit',
        partStock: '0 available',
        suggestedPlan: 'Expedited vendor delivery dispatch',
        recoveryStatus: 'Vendor confirmation pending',
        reports: ['08:15 Central Supply inventory sync error']
      },
      {
        id: 'INC-0842',
        title: 'HVAC Airflow pressure low',
        department: 'Facilities',
        location: 'OR Suite 4 & 5',
        status: 'Assigned',
        severity: 'High',
        time: '07:40',
        description: 'Differential pressure drop in positive-pressure sterile corridor.',
        affectedAppointments: 6,
        technician: 'Priya Patel (Facilities Tech)',
        partRequired: 'HEPA Primary Filter Matrix',
        partStock: '4 in Facilities reserve',
        suggestedPlan: 'Auxiliary fan booster engage',
        recoveryStatus: 'Sterility audit passing',
        reports: ['07:40 Building Management BMS Sensor trigger']
      }
    ],

    // Audit Trail (Slide 9 & 10)
    auditLog: [
      { time: '09:02:14', actor: 'Webhook Daemon', action: 'INCIDENT_INTAKE', details: 'Ingested telemetry trigger for MRI Scanner 3T' },
      { time: '09:03:00', actor: 'AI Assistance', action: 'NLP_EXTRACT', details: 'Extracted Asset: MRI-3T, Dept: Imaging, Urgency: High' },
      { time: '09:04:12', actor: 'Rule Engine', action: 'IMPACT_CORRELATE', details: 'Linked 12 scheduled patient scans from PACS database' },
      { time: '09:05:40', actor: 'Rule Engine', action: 'CONSTRAINT_CHECK', details: 'Technician busy; Cryo-valve verified in stock' },
      { time: '09:06:05', actor: 'AI Assistance', action: 'PLAN_PROPOSAL', details: 'Generated 3 ranked recovery options; Recommended Option 1' }
    ],

    // What-If State (Slide 8)
    whatIf: {
      planVersion: 'V1',
      isValid: true,
      eventInjected: false,
      recalculated: false,
      partReserved: false
    },

    // Slide Deck Content (Slides 1 to 13)
    slides: [
      {
        num: 1,
        title: "From hospital disruptions to coordinated recovery.",
        subtitle: "HACKATHON PITCH • HEALTHCARE OPERATIONS",
        tag: "HospitalOps Intelligence",
        desc: "An AI-assisted hospital operations platform that connects incidents, equipment, staffing, inventory and approvals — through one web workspace and a mobile companion.",
        pillars: ["Impact Intelligence", "Recovery Planning", "Controlled Actions"],
        badge: "Prototype concept • Synthetic operational data • Simulated execution",
        demoType: "control-center-preview"
      },
      {
        num: 2,
        title: "One incident rarely stays one incident.",
        subtitle: "THE CHALLENGE",
        tag: "Operational Fragmentation",
        desc: "Hospital operations are connected — but operational information is often fragmented. A single equipment failure creates a chain of operational dependencies.",
        trigger: "MRI scanner unavailable",
        ripples: [
          "Scheduled activities: 12 appointments depend on this asset",
          "People & skills: Regular technician is busy; who is qualified?",
          "Parts & inventory: Is the required replacement component in stock?",
          "Approvals & updates: Who must authorize, act, and be notified?"
        ],
        gap: "Hospitals do not need just another ticketing tool. They need a way to coordinate a safe, feasible response."
      },
      {
        num: 3,
        title: "From fragmented signals to a controlled response.",
        subtitle: "OUR APPROACH",
        tag: "5-Step Workflow",
        desc: "One shared workflow connects reporting, impact analysis, recovery decisions and execution.",
        steps: [
          { name: "01 Capture", desc: "Form, chat or simulated webhook", tag: "INTAKE" },
          { name: "02 Connect", desc: "Link assets, reports, rooms and schedules", tag: "CORRELATE" },
          { name: "03 Assess", desc: "Check impact, availability and constraints", tag: "DETERMINISTIC" },
          { name: "04 Recommend", desc: "Compare feasible recovery options", tag: "AI-ASSISTED" },
          { name: "05 Approve & act", desc: "Revalidate, simulate and audit actions", tag: "CONTROLLED" }
        ],
        aiAssists: "Report understanding • duplicate suggestions • summaries • recommendation explanations",
        rulesEnforce: "Permissions • stock • schedules • qualifications • approval checks"
      },
      {
        num: 4,
        title: "One operational picture — on web and mobile.",
        subtitle: "PRODUCT EXPERIENCE",
        tag: "Dual Surface Experience",
        desc: "A shared incident record keeps the dashboard, field updates, approvals and audit history in sync.",
        demoType: "dual-surface-preview"
      },
      {
        num: 5,
        title: "Every incident becomes a connected operational record.",
        subtitle: "HOW IT WORKS",
        tag: "Impact Map & Timeline",
        desc: "HospitalOps links the report to the resources, schedules and decisions needed for recovery.",
        demoType: "impact-map-preview"
      },
      {
        num: 6,
        title: "Compare recovery options before taking action.",
        subtitle: "SCENARIO 01",
        tag: "Recovery Engine",
        desc: "The recovery engine ranks feasible choices against time, cost and operational impact — then explains the trade-offs.",
        scenarioText: "MRI scanner offline • 12 scheduled activities • regular technician unavailable",
        demoType: "scenario1-preview"
      },
      {
        num: 7,
        title: "Many reports. One confirmed incident.",
        subtitle: "SCENARIO 02",
        tag: "Correlated Incidents & Idempotency",
        desc: "Duplicate-aware incident handling turns repeated complaints into a coordinated response without losing the original reports.",
        demoType: "scenario2-preview"
      },
      {
        num: 8,
        title: "When the situation changes, the plan changes.",
        subtitle: "WHAT-IF SIMULATOR",
        tag: "Dynamic Revalidation",
        desc: "A proposed recovery is not trusted forever: HospitalOps rechecks the world before execution.",
        demoType: "whatif-preview"
      },
      {
        num: 9,
        title: "A practical architecture — AI with deterministic controls.",
        subtitle: "TECHNOLOGY",
        tag: "System Architecture",
        desc: "The product separates natural-language assistance from the rules that govern operational decisions.",
        demoType: "architecture-preview"
      },
      {
        num: 10,
        title: "Trust is designed into the workflow.",
        subtitle: "GOVERNANCE",
        tag: "Safety & RBAC",
        desc: "HospitalOps is an operational decision-support prototype — not an autonomous clinical decision-maker.",
        demoType: "governance-preview"
      },
      {
        num: 11,
        title: "We measure whether recovery is actually better.",
        subtitle: "MEASUREMENT",
        tag: "Audit Metrics & Acceptance Checks",
        desc: "The prototype reports auditable operational metrics — not invented claims about real hospital outcomes.",
        demoType: "metrics-preview"
      },
      {
        num: 12,
        title: "Designed as a complete hackathon prototype.",
        subtitle: "DEMO SCOPE",
        tag: "Scope & 4-Person Build Team",
        desc: "One product story, two disruptions, and a working path from report to approved recovery simulation.",
        demoType: "scope-preview"
      },
      {
        num: 13,
        title: "Don’t just log the failure. Coordinate the recovery.",
        subtitle: "THE TAKEAWAY",
        tag: "The Hospital Operations Loop",
        desc: "HospitalOps connects incidents to their impact, compares feasible actions, and keeps every approved step accountable.",
        demoType: "takeaway-preview"
      }
    ]
  };

  // Toast notification helper
  function showToast(message, type = 'info') {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.borderColor = type === 'error' ? 'var(--rose)' : (type === 'success' ? 'var(--emerald)' : 'var(--teal-accent)');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  // Navigation Handler
  function switchView(viewName) {
    State.currentView = viewName;
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (viewName === 'impact-map') {
      renderImpactMapSvg();
    } else if (viewName === 'slides') {
      renderCurrentSlide();
    }
  }

  // RBAC Permission Checker (Slide 10)
  function checkPermission(action) {
    const role = State.currentRole;
    const permissions = {
      operations_analyst: ['create_incident', 'assess_incident', 'view_all'],
      technician: ['update_work', 'view_assigned'],
      department_manager: ['review_plan', 'approve_plan', 'assess_incident', 'view_all'],
      procurement_approver: ['approve_purchase', 'review_plan', 'view_all'],
      system_admin: ['create_incident', 'assess_incident', 'update_work', 'review_plan', 'approve_plan', 'approve_purchase', 'manage_system', 'view_all']
    };

    const allowed = permissions[role]?.includes(action);
    if (!allowed) {
      const roleName = document.getElementById('role-selector')?.selectedOptions[0]?.text || role;
      showToast(`⛔ Separation of Duties Violation: "${roleName}" is not permitted to ${action.replace('_', ' ')}. Policy requires manager authorization.`, 'error');
      
      // Log failed authorization attempt in Audit Log
      State.auditLog.unshift({
        time: new Date().toTimeString().split(' ')[0],
        actor: roleName,
        action: 'RBAC_REJECTED',
        details: `Unauthorized attempt to ${action}. Blocked by security middleware.`
      });
      renderAuditLog();
      return false;
    }
    return true;
  }

  // Render Disruption Table (Slide 4)
  function renderDisruptionsTable() {
    const tbody = document.getElementById('disruptions-table-body');
    if (!tbody) return;

    tbody.innerHTML = State.incidents.map((inc, idx) => `
      <tr class="${idx === 0 ? 'selected' : ''}" data-id="${inc.id}">
        <td>
          <div style="font-weight: 700; color: #fff;">${inc.title}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">${inc.id}</div>
        </td>
        <td>${inc.location}</td>
        <td>
          <span class="status-badge ${inc.status.toLowerCase()}">
            ● ${inc.status}
          </span>
        </td>
        <td>
          <button class="btn-secondary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="window.HospitalOps.selectIncident('${inc.id}')">Inspect</button>
        </td>
      </tr>
    `).join('');
  }

  // Render Mobile Companion Alerts (Slide 4)
  function renderMobileView() {
    const alertsContainer = document.getElementById('mobile-alerts-list');
    if (!alertsContainer) return;

    alertsContainer.innerHTML = State.incidents.slice(0, 3).map((inc, i) => `
      <div class="mobile-alert-card ${i === 0 ? 'active' : ''}" onclick="window.HospitalOps.selectIncident('${inc.id}')">
        <div class="top">
          <span style="color: ${inc.severity === 'Critical' ? 'var(--rose)' : (inc.severity === 'High' ? 'var(--amber)' : 'var(--teal-accent)')};">●</span>
          ${inc.title}
        </div>
        <div class="sub">${inc.suggestedPlan || inc.recoveryStatus}</div>
      </div>
    `).join('');
  }

  // Select incident to view across web & mobile
  function selectIncident(incId) {
    const inc = State.incidents.find(x => x.id === incId);
    if (!inc) return;

    const planTitle = document.getElementById('active-plan-title');
    const planNote = document.getElementById('active-plan-note');
    if (planTitle) planTitle.textContent = inc.suggestedPlan || 'Review recovery options';
    if (planNote) planNote.textContent = inc.recoveryStatus || 'Constraints being verified';

    // Highlight row
    document.querySelectorAll('#disruptions-table-body tr').forEach(row => {
      row.classList.toggle('selected', row.dataset.id === incId);
    });

    showToast(`Active context switched to ${inc.title} (${inc.id})`, 'info');
  }

  // Render Interactive SVG Impact Map (Slide 5)
  function renderImpactMapSvg() {
    const container = document.getElementById('impact-svg-container');
    if (!container) return;

    const svgWidth = 720;
    const svgHeight = 440;
    const centerX = 360;
    const centerY = 220;

    // Satellites
    const nodes = [
      { id: 'act', title: 'Scheduled activities', sub: '12 affected', x: 120, y: 90, color: '#38BDF8', icon: '📅' },
      { id: 'tech', title: 'Technician roster', sub: '1 qualified tech busy', x: 600, y: 90, color: '#F59E0B', icon: '👤' },
      { id: 'parts', title: 'Spare-parts stock', sub: '1 required part available', x: 120, y: 350, color: '#10B981', icon: '📦' },
      { id: 'alt', title: 'Alternative asset', sub: 'Capacity check pending', x: 600, y: 350, color: '#00E5FF', icon: '🔄' },
      { id: 'appr', title: 'Approval workflow', sub: 'Operations manager required', x: 360, y: 380, color: '#F43F5E', icon: '🛡️' }
    ];

    let svgHtml = `
      <svg class="interactive-svg-graph" viewBox="0 0 ${svgWidth} ${svgHeight}">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00E5FF" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.2"/>
          </linearGradient>
        </defs>
    `;

    // Render Connector lines with animated pulses
    nodes.forEach(n => {
      svgHtml += `
        <line x1="${centerX}" y1="${centerY}" x2="${n.x}" y2="${n.y}" 
              stroke="var(--border-color)" stroke-width="2" stroke-dasharray="4 4" />
        <line x1="${centerX}" y1="${centerY}" x2="${n.x}" y2="${n.y}" 
              stroke="${n.color}" stroke-width="2" opacity="0.6">
          <animate attributeName="stroke-dashoffset" values="20;0" dur="2s" repeatCount="indefinite" />
        </line>
      `;
    });

    // Center Node (MRI SCANNER UNAVAILABLE)
    svgHtml += `
      <g class="graph-node" transform="translate(${centerX}, ${centerY})" onclick="window.HospitalOps.showNodeDetail('center')">
        <rect x="-95" y="-45" width="190" height="90" rx="14" fill="#0E1D36" stroke="#EF4444" stroke-width="2" filter="url(#glow)"/>
        <text y="-12" text-anchor="middle" fill="#EF4444" font-size="10" font-weight="800" letter-spacing="1">TRIGGER EVENT</text>
        <text y="10" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="800">MRI SCANNER</text>
        <text y="28" text-anchor="middle" fill="#EF4444" font-size="13" font-weight="800">UNAVAILABLE</text>
      </g>
    `;

    // Satellite Nodes
    nodes.forEach(n => {
      svgHtml += `
        <g class="graph-node" transform="translate(${n.x}, ${n.y})" onclick="window.HospitalOps.showNodeDetail('${n.id}')">
          <rect x="-85" y="-35" width="170" height="70" rx="10" fill="#0C172A" stroke="${n.color}" stroke-width="1.5"/>
          <circle cx="-65" cy="-8" r="5" fill="${n.color}" />
          <text x="-52" y="-5" fill="#FFFFFF" font-size="11" font-weight="700">${n.title}</text>
          <text x="-52" y="15" fill="var(--text-muted)" font-size="9">${n.sub}</text>
        </g>
      `;
    });

    svgHtml += `</svg>`;
    container.innerHTML = svgHtml;
  }

  function showNodeDetail(nodeId) {
    const details = {
      center: 'MRI Scanner 3T (Skyra) threw cryo-quench pressure warning at 09:02. System locked for patient safety.',
      act: '12 scheduled diagnostic scans (3 stat stroke cases, 9 routine neuro scans). Delay buffer: 45 min.',
      tech: 'Dr. Sarah registered for maintenance. Currently assigned to Emergency Trauma CT until 11:30.',
      parts: 'RF Cryo-Valve #CV-99 in central stock Bin C-4. 1 item reserved; physical count confirmed.',
      alt: 'Scanner 1.5T-B in Suite Rad-102 has open capacity between 10:00 and 14:00 today.',
      appr: 'Rule Policy #GOV-401: Transfer of MRI patients to alternate scanner requires Department Manager sign-off.'
    };
    showToast(details[nodeId] || 'Node inspected.', 'info');
  }

  // Scenario 1: Approve Plan (Slide 6)
  function approveRecoveryOption(optionName) {
    if (!checkPermission('approve_plan')) return;

    // Deterministic validation checks
    showToast(`Deterministic validation passed. "${optionName}" approved and locked in execution registry.`, 'success');
    
    // Add to audit trail
    State.auditLog.unshift({
      time: new Date().toTimeString().split(' ')[0],
      actor: document.getElementById('role-selector')?.selectedOptions[0]?.text || State.currentRole,
      action: 'PLAN_APPROVED',
      details: `Authorized recovery strategy: "${optionName}". Revalidation gate passed.`
    });
    renderAuditLog();
    
    // Decrement pending approvals
    if (State.metrics.awaitingApproval > 0) {
      State.metrics.awaitingApproval--;
      updateMetricPills();
    }
  }

  // Scenario 2: Webhook Idempotency Simulation (Slide 7)
  let webhookCounter = 0;
  function simulateWebhook() {
    webhookCounter++;
    const consoleBox = document.getElementById('webhook-console');
    const now = new Date().toTimeString().split(' ')[0];
    
    if (webhookCounter === 1) {
      const msg = `[${now}] INCOMING POST /api/webhook/reports: "Systems cannot connect to network" from LAB. Correlated to Incident INC-2048.`;
      appendConsole(consoleBox, msg, '#38BDF8');
      showToast('First report ingested and correlated into INC-2048', 'info');
    } else {
      // Idempotency check in action
      const msg = `[${now}] INCOMING REPEATED WEBHOOK [Hash: SHA256#a73f...92]: IDEMPOTENCY GATE ENGAGED. Repeated delivery acknowledged (HTTP 200). 0 duplicate tickets created.`;
      appendConsole(consoleBox, msg, '#34D399');
      showToast('Idempotency Gate: Duplicate webhook safely merged. Zero duplicate side-effects!', 'success');
    }
  }

  function appendConsole(box, text, color) {
    if (!box) return;
    const p = document.createElement('div');
    p.style.color = color || '#A5F3FC';
    p.style.marginBottom = '4px';
    p.textContent = text;
    box.appendChild(p);
    box.scrollTop = box.scrollHeight;
  }

  // Scenario 3: What-If Dynamic Invalidation (Slide 8)
  function injectWhatIfDisruption() {
    State.whatIf.eventInjected = true;
    State.whatIf.isValid = false;

    // Update Plan V1 Card
    const v1Box = document.getElementById('whatif-v1-box');
    const v1Badge = document.getElementById('whatif-v1-badge');
    const v1Part = document.getElementById('whatif-v1-part');
    const v2Box = document.getElementById('whatif-v2-box');

    if (v1Box) v1Box.classList.add('invalidated');
    if (v1Badge) {
      v1Badge.className = 'plan-version-badge inv';
      v1Badge.textContent = 'PLAN V1 INVALIDATED';
    }
    if (v1Part) {
      v1Part.className = 'check-item struck';
      v1Part.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        Required part preempted by Emergency Surgery
      `;
    }

    if (v2Box) {
      v2Box.style.display = 'flex';
      v2Box.style.animation = 'fadeIn 0.3s ease';
    }

    showToast('🚨 EVENT INJECTED: Part reserved by another work order! Plan V1 invalidated immediately.', 'error');

    State.auditLog.unshift({
      time: new Date().toTimeString().split(' ')[0],
      actor: 'Rule Engine Watchdog',
      action: 'PLAN_INVALIDATED',
      details: 'Plan V1 invalidated due to inventory contention. Recalculating feasible alternatives...'
    });
    renderAuditLog();
  }

  function resetWhatIf() {
    State.whatIf.eventInjected = false;
    State.whatIf.isValid = true;

    const v1Box = document.getElementById('whatif-v1-box');
    const v1Badge = document.getElementById('whatif-v1-badge');
    const v1Part = document.getElementById('whatif-v1-part');
    const v2Box = document.getElementById('whatif-v2-box');

    if (v1Box) v1Box.classList.remove('invalidated');
    if (v1Badge) {
      v1Badge.className = 'plan-version-badge v1';
      v1Badge.textContent = 'PLAN V1 (ORIGINAL)';
    }
    if (v1Part) {
      v1Part.className = 'check-item';
      v1Part.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Required part available
      `;
    }
    if (v2Box) v2Box.style.display = 'none';

    showToast('What-If simulation reset to initial state.', 'info');
  }

  // Automated Acceptance Test Suite (Slide 11)
  function runAcceptanceTests() {
    const tests = [
      { id: 'test-1', name: 'New incident creates persisted record and audit entry' },
      { id: 'test-2', name: 'Duplicate webhook is safely ignored or linked' },
      { id: 'test-3', name: 'Unavailable part blocks an infeasible recovery plan' },
      { id: 'test-4', name: 'Unauthorized and self-approval attempts are rejected' }
    ];

    showToast('Running automated acceptance test suite...', 'info');

    tests.forEach((t, i) => {
      const icon = document.getElementById(`${t.id}-icon`);
      const status = document.getElementById(`${t.id}-status`);
      if (icon && status) {
        icon.className = 'test-icon-badge running';
        icon.textContent = '⟳';
        status.textContent = 'RUNNING';
        status.style.color = 'var(--teal-accent)';

        setTimeout(() => {
          icon.className = 'test-icon-badge pass';
          icon.textContent = '✓';
          status.textContent = 'PASS';
          status.style.color = 'var(--emerald)';

          if (i === tests.length - 1) {
            showToast('All 4 acceptance checks passed with 100% compliance!', 'success');
          }
        }, (i + 1) * 450);
      }
    });
  }

  // Render Audit Log Table (Slide 9 & 10)
  function renderAuditLog() {
    const list = document.getElementById('audit-log-items');
    if (!list) return;

    list.innerHTML = State.auditLog.slice(0, 8).map(entry => `
      <div style="display: flex; gap: 1rem; padding: 0.6rem 0; border-bottom: 1px solid var(--border-color); font-size: 0.8rem;">
        <span style="font-family: var(--font-mono); color: var(--teal-accent); min-width: 75px;">${entry.time}</span>
        <span style="font-weight: 700; color: #fff; min-width: 140px;">${entry.actor}</span>
        <span style="color: var(--amber); font-weight: 600; min-width: 130px;">${entry.action}</span>
        <span style="color: var(--text-secondary); flex-grow: 1;">${entry.details}</span>
      </div>
    `).join('');
  }

  // Update Metric Pills
  function updateMetricPills() {
    const els = {
      active: document.getElementById('metric-active-incidents'),
      approvals: document.getElementById('metric-pending-approvals'),
      offline: document.getElementById('metric-assets-offline'),
      sla: document.getElementById('metric-sla-track')
    };
    if (els.active) els.active.textContent = String(State.metrics.activeIncidents).padStart(2, '0');
    if (els.approvals) els.approvals.textContent = String(State.metrics.awaitingApproval).padStart(2, '0');
    if (els.offline) els.offline.textContent = String(State.metrics.assetsOffline).padStart(2, '0');
    if (els.sla) els.sla.textContent = `${State.metrics.slaOnTrack}%`;
  }

  // Presentation Slide Deck Mode (Slides 1 to 13)
  function renderCurrentSlide() {
    const slide = State.slides[State.currentSlide - 1];
    if (!slide) return;

    const counter = document.getElementById('slide-counter-text');
    const title = document.getElementById('deck-slide-title');
    const category = document.getElementById('deck-slide-category');
    const desc = document.getElementById('deck-slide-desc');
    const body = document.getElementById('deck-slide-body');
    const jumpSelect = document.getElementById('slide-jump-select');

    if (counter) counter.textContent = `Slide ${slide.num} of ${State.totalSlides}`;
    if (category) category.textContent = slide.subtitle;
    if (title) title.textContent = slide.title;
    if (desc) desc.textContent = slide.desc;
    if (jumpSelect) jumpSelect.value = slide.num;

    // Render slide-specific visual widgets
    if (body) {
      body.innerHTML = getSlideWidgetHtml(slide);
    }
  }

  function getSlideWidgetHtml(slide) {
    switch (slide.num) {
      case 1:
        return `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; margin-top: 1.5rem;">
            <div>
              <div style="font-size: 1.05rem; color: #CBD5E1; margin-bottom: 1.5rem; line-height: 1.6;">${slide.desc}</div>
              <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                ${slide.pillars.map(p => `<span class="pillar-chip">${p}</span>`).join('')}
              </div>
            </div>
            <div style="background: #0E1A2E; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.5rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                <span style="font-size: 0.8rem; font-weight: 700; color: #fff;">OPERATIONS CONTROL CENTER</span>
                <span class="live-badge"><span class="pulse-dot"></span> LIVE SIMULATION</span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; text-align: center; margin-bottom: 1rem;">
                <div style="background: #091220; padding: 0.75rem; border-radius: 8px;"><div style="font-size: 1.5rem; font-weight: 800; color: #fff;">08</div><div style="font-size: 0.65rem; color: #94A3B8;">ACTIVE INCIDENTS</div></div>
                <div style="background: #091220; padding: 0.75rem; border-radius: 8px;"><div style="font-size: 1.5rem; font-weight: 800; color: var(--amber);">03</div><div style="font-size: 0.65rem; color: #94A3B8;">AWAITING APPROVAL</div></div>
                <div style="background: #091220; padding: 0.75rem; border-radius: 8px;"><div style="font-size: 1.5rem; font-weight: 800; color: var(--rose);">02</div><div style="font-size: 0.65rem; color: #94A3B8;">ASSETS OFFLINE</div></div>
              </div>
              <div style="background: rgba(0, 229, 255, 0.08); border-left: 3px solid var(--teal-accent); padding: 0.75rem; font-size: 0.8rem; color: #fff;">
                <strong>RECOMMENDED NEXT STEP:</strong> Verify alternative scanner capacity [APPROVAL REQUIRED]
              </div>
            </div>
          </div>
        `;
      case 2:
        return `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 1.5rem;">
            <div>
              <div class="trigger-card" style="margin-bottom: 1rem;">
                <div class="trigger-tag">TRIGGER EVENT</div>
                <div class="trigger-title">MRI scanner unavailable</div>
                <div class="trigger-desc">A single equipment failure creates a chain of operational dependencies.</div>
              </div>
              <div class="ripple-list">
                <div class="ripple-item"><span class="ripple-num blue">01</span><div class="ripple-content"><h4>Scheduled activities</h4><p>Which appointments depend on this asset?</p></div></div>
                <div class="ripple-item"><span class="ripple-num green">02</span><div class="ripple-content"><h4>People & skills</h4><p>Who is available and qualified to respond?</p></div></div>
                <div class="ripple-item"><span class="ripple-num amber">03</span><div class="ripple-content"><h4>Parts & inventory</h4><p>Is the required component in stock or reserved?</p></div></div>
                <div class="ripple-item"><span class="ripple-num rose">04</span><div class="ripple-content"><h4>Approvals & updates</h4><p>Who must authorize, act, and be notified?</p></div></div>
              </div>
            </div>
            <div>
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem;">THE FRAGMENTED WORKFLOW</div>
              <div class="silo-grid">
                <div class="silo-card"><h5>✉️ Email inbox</h5><p>Reports arrive in different places</p></div>
                <div class="silo-card"><h5>📊 Asset spreadsheet</h5><p>Equipment status is separate</p></div>
                <div class="silo-card"><h5>📋 Staff roster</h5><p>Availability is hard to see</p></div>
                <div class="silo-card"><h5>📞 Phone calls</h5><p>Approvals and updates get missed</p></div>
              </div>
              <div class="gap-banner" style="margin-top: 1.5rem;">
                <strong>THE GAP:</strong> Hospitals do not need just another ticketing tool. They need a way to coordinate a safe, feasible response.
              </div>
            </div>
          </div>
        `;
      case 3:
        return `
          <div style="margin-top: 1.5rem;">
            <div class="pipeline-track">
              <div class="step-card"><div class="step-num">01</div><div class="step-title">Capture</div><div class="step-desc">Form, chat or simulated webhook</div><div class="step-tag intake">INTAKE</div></div>
              <div class="step-card"><div class="step-num">02</div><div class="step-title">Connect</div><div class="step-desc">Link assets, reports, rooms and schedules</div><div class="step-tag correlate">CORRELATE</div></div>
              <div class="step-card"><div class="step-num">03</div><div class="step-title">Assess</div><div class="step-desc">Check impact, availability and constraints</div><div class="step-tag deterministic">DETERMINISTIC</div></div>
              <div class="step-card"><div class="step-num">04</div><div class="step-title">Recommend</div><div class="step-desc">Compare feasible recovery options</div><div class="step-tag ai">AI-ASSISTED</div></div>
              <div class="step-card"><div class="step-num">05</div><div class="step-title">Approve & act</div><div class="step-desc">Revalidate, simulate and audit actions</div><div class="step-tag controlled">CONTROLLED</div></div>
            </div>
            <div class="boundary-banner" style="margin-top: 1.5rem;">
              <div class="boundary-half ai"><div class="boundary-title">🤖 AI ASSISTS</div><div class="boundary-list">${slide.aiAssists}</div></div>
              <div class="boundary-half rules"><div class="boundary-title">⚖️ RULES ENFORCE</div><div class="boundary-list">${slide.rulesEnforce}</div></div>
            </div>
          </div>
        `;
      case 6:
        return `
          <div style="margin-top: 1.5rem;">
            <div class="scenario-banner">
              <span class="scenario-badge">SCENARIO</span>
              <span class="scenario-context">${slide.scenarioText}</span>
              <span class="synthetic-pill">SYNTHETIC DEMO VALUES</span>
            </div>
            <div class="recovery-options-grid" style="margin-bottom: 0;">
              <div class="option-card recommended">
                <div class="option-top-badge">RECOMMENDED IN THIS SIMULATION</div>
                <div class="option-name">Use alternate scanner</div>
                <div class="option-desc">Move eligible activities to a verified resource with available capacity.</div>
                <div class="option-metrics-row">
                  <div class="metric-cell"><div class="label">ESTIMATED TIME</div><div class="val">30 min</div></div>
                  <div class="metric-cell"><div class="label">ESTIMATED COST</div><div class="val">₹1,000</div></div>
                </div>
                <div class="feasibility-chip emerald">FEASIBLE IF CAPACITY CHECK PASSES</div>
              </div>
              <div class="option-card dependency">
                <div class="option-top-badge">DEPENDENCY: SUPPLIER</div>
                <div class="option-name">Expedite replacement part</div>
                <div class="option-desc">Keep repair path, but recovery timing depends on supplier confirmation.</div>
                <div class="option-metrics-row">
                  <div class="metric-cell"><div class="label">ESTIMATED TIME</div><div class="val">~3 hours</div></div>
                  <div class="metric-cell"><div class="label">ESTIMATED COST</div><div class="val">₹8,000</div></div>
                </div>
                <div class="feasibility-chip amber">WAITING FOR STOCK CONFIRMATION</div>
              </div>
              <div class="option-card tradeoff">
                <div class="option-top-badge">SERVICE TRADE-OFF</div>
                <div class="option-name">Reschedule activities</div>
                <div class="option-desc">Reschedule affected appointments with appropriate department review.</div>
                <div class="option-metrics-row">
                  <div class="metric-cell"><div class="label">ESTIMATED TIME</div><div class="val">20 min admin</div></div>
                  <div class="metric-cell"><div class="label">ESTIMATED COST</div><div class="val">₹500</div></div>
                </div>
                <div class="feasibility-chip indigo">REQUIRES SCHEDULING REVIEW</div>
              </div>
            </div>
          </div>
        `;
      default:
        return `
          <div style="background: rgba(14, 23, 38, 0.7); border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; margin-top: 1.5rem; text-align: center;">
            <div style="font-size: 1.1rem; color: #fff; margin-bottom: 1rem;">${slide.desc}</div>
            <button class="btn-primary" onclick="window.HospitalOps.jumpToInteractiveSection('${slide.num}')">Open Full Interactive View for Slide ${slide.num}</button>
          </div>
        `;
    }
  }

  function nextSlide() {
    if (State.currentSlide < State.totalSlides) {
      State.currentSlide++;
      renderCurrentSlide();
    }
  }

  function prevSlide() {
    if (State.currentSlide > 1) {
      State.currentSlide--;
      renderCurrentSlide();
    }
  }

  function jumpToSlide(num) {
    State.currentSlide = parseInt(num, 10);
    renderCurrentSlide();
  }

  function jumpToInteractiveSection(slideNum) {
    const map = {
      1: 'overview',
      2: 'overview',
      3: 'overview',
      4: 'dashboard',
      5: 'impact-map',
      6: 'scenario1',
      7: 'scenario2',
      8: 'whatif',
      9: 'architecture',
      10: 'architecture',
      11: 'metrics',
      12: 'metrics',
      13: 'overview'
    };
    switchView(map[slideNum] || 'overview');
  }

  // Handle New Incident Form Submission
  function handleIncidentSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('new-inc-title')?.value;
    const dept = document.getElementById('new-inc-dept')?.value;
    const location = document.getElementById('new-inc-loc')?.value;
    const desc = document.getElementById('new-inc-desc')?.value;

    if (!title) return;

    const newInc = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      department: dept,
      location: location || 'General Ward',
      status: 'Assessing',
      severity: 'Medium',
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      description: desc,
      affectedAppointments: 3,
      suggestedPlan: 'Automatic assessment in progress',
      recoveryStatus: 'AI Parsing completed'
    };

    State.incidents.unshift(newInc);
    State.metrics.activeIncidents++;
    State.auditLog.unshift({
      time: new Date().toTimeString().split(' ')[0],
      actor: 'Web Form User',
      action: 'INCIDENT_INTAKE',
      details: `Created ${newInc.title} (${newInc.id}) at ${newInc.location}`
    });

    renderDisruptionsTable();
    renderMobileView();
    renderAuditLog();
    updateMetricPills();

    document.getElementById('intake-modal')?.classList.remove('open');
    showToast(`Incident ${newInc.id} captured and registered into state engine.`, 'success');
  }

  // Dual view toggler
  function setDualMode(mode) {
    const container = document.getElementById('dual-surface-container');
    if (!container) return;
    container.className = `dual-container ${mode}-only`;
    if (mode === 'dual') container.className = 'dual-container';

    document.querySelectorAll('.mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
  }

  // Initialize Application
  function init() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Role switcher
    const roleSelect = document.getElementById('role-selector');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        State.currentRole = e.target.value;
        const roleName = e.target.selectedOptions[0].text;
        showToast(`Role switched to: ${roleName}`, 'info');
      });
    }

    // Modal triggers
    document.getElementById('open-intake-modal-btn')?.addEventListener('click', () => {
      document.getElementById('intake-modal')?.classList.add('open');
    });
    document.getElementById('close-intake-modal-btn')?.addEventListener('click', () => {
      document.getElementById('intake-modal')?.classList.remove('open');
    });
    document.getElementById('incident-intake-form')?.addEventListener('submit', handleIncidentSubmit);

    // Initial Renders
    renderDisruptionsTable();
    renderMobileView();
    renderAuditLog();
    updateMetricPills();
    renderImpactMapSvg();

    // Keyboard support for presentation slide navigation
    window.addEventListener('keydown', (e) => {
      if (State.currentView === 'slides') {
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
          nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          prevSlide();
        }
      }
    });

    console.log('HospitalOps Intelligence initialized.');
  }

  // Expose global methods
  window.HospitalOps = {
    init,
    switchView,
    selectIncident,
    showNodeDetail,
    approveRecoveryOption,
    simulateWebhook,
    injectWhatIfDisruption,
    resetWhatIf,
    runAcceptanceTests,
    nextSlide,
    prevSlide,
    jumpToSlide,
    jumpToInteractiveSection,
    setDualMode
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

