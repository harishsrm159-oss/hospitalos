# HospitalOps Intelligence — Web Platform

> **From hospital disruptions to coordinated recovery.**  
> An AI-assisted hospital operations platform connecting incidents, equipment, staffing, inventory, and approvals through one web workspace and a mobile companion.

---

## 🏥 Overview

This codebase transforms the entire **HospitalOps Intelligence** Hackathon pitch deck (all 13 slides) into an interactive, zero-dependency, enterprise-grade web application.

It bridges **natural-language AI assistance** (extracting, summarizing, classifying, and suggesting) with a **deterministic rule engine** (verifying stock, schedules, technician skills, approvals, and dynamic state revalidation).

---

## 🚀 Quick Start (Instant Access)

### Option 1: Direct Browser Launch (Recommended - Zero Installation)
Double-click `launch.bat` or simply open `index.html` in Chrome, Edge, Safari, or Firefox:
```cmd
start index.html
```
*No server, no installation, and no build step required. Everything is self-contained with offline SVG graphics, reactive state management, and real-time simulators.*

### Option 2: Run with Local Node.js API Server
If you want to simulate backend REST API endpoints and webhooks:
```cmd
node server.js
```
Then visit: [http://localhost:3000](http://localhost:3000)

---

## 📑 Slide-by-Slide Implementation Map

| Slide # | Presentation Topic | Implemented Feature in the Website |
| :--- | :--- | :--- |
| **01** | **Hero & Pitch** | Live Operations Control Center preview, telemetry metrics (08 Active, 03 Pending, 02 Offline), core pillars, synthetic execution badge. |
| **02** | **The Challenge** | Cascading dependency chain (Scheduled activities, People & skills, Parts & inventory, Approvals), fragmented workflow comparison (Email, Spreadsheets, Rosters, Calls), and the operational gap banner. |
| **03** | **Our Approach** | 5-step operational pipeline (Capture ➔ Connect ➔ Assess ➔ Recommend ➔ Approve & Act) + AI Assists vs. Rules Enforce boundary matrix. |
| **04** | **Product Experience** | Dual-surface synchronized view: Desktop Web Workspace (`hospitalops.app/operations`) and realistic Mobile Companion (`hospitalops.mobile`) with real-time incident inspection. |
| **05** | **How It Works** | Incident #INC-4091 chronological timeline (09:02 to 09:06) and interactive SVG Impact Map graph linking MRI Offline to 5 operational nodes. |
| **06** | **Scenario 01: Recovery Engine** | Trade-off matrix comparing 3 viable recovery plans with time, cost (₹1,000 vs ₹8,000 vs ₹500), and feasibility rule checks. |
| **07** | **Scenario 02: Duplicate Correlator** | Ingests 3 distinct departmental reports within 2 minutes and merges them into Incident INC-2048 (Network outage) with a live Webhook Idempotency simulator. |
| **08** | **What-If Simulator** | Dynamic state machine: Plan V1 is invalidated in real-time when the required part is preempted by another work order, triggering automatic recalculation to Plan V2. |
| **09** | **Practical Architecture** | 4-tier interactive architecture diagram (Inputs, Application Layer, Intelligence & Rules, Persistent Data & Ops) + FastAPI REST endpoints in `server.js`. |
| **10** | **Governance & RBAC** | Interactive Role Switcher testing separation of duties (Operations Analyst, Technician, Department Manager, Procurement Approver, System Admin). |
| **11** | **Measurement & Metrics** | 4 auditable operational metrics (Time to correlate, Plan feasibility, Duplicate safety, Approval traceability) + live automated acceptance test suite. |
| **12** | **Demo Scope & Build Team** | 4-person hackathon team workstreams (Frontend & UX, Backend & DB, Rules Engine, AI & Integration) and contract-first architecture. |
| **13** | **The Takeaway Loop** | The closed Hospital Operations loop: Incident ➔ Impact ➔ Recovery Plan ➔ Approval ➔ Execution. |

---

## 🎮 Interactive Features to Try

1. **Test Role-Based Access Control (RBAC):**
   - In the header, change the role to **Operations Analyst** or **Technician**.
   - Go to **Scenario 1** or the **Operations Center** and click **"Review & Approve Plan"**.
   - Notice the security rejection banner: *“Separation of Duties Violation: Analyst is not permitted to authorize plan execution.”*
   - Switch role to **Department Manager** and approve again — the approval passes with an immutable audit entry!

2. **Test the Idempotency Webhook Engine (Scenario 2):**
   - Go to **Scenario 2: Correlator**.
   - Click **"⚡ Fire Webhook Event Payload"** repeatedly.
   - Watch the live console detect duplicate payload hashes and acknowledge them idempotently with **0 duplicate incidents created**.

3. **Trigger the What-If Disruption (Scenario 3):**
   - Go to **What-If Simulator**.
   - Click **"💥 Inject Event: Part Reserved by Another Work Order"**.
   - Watch Plan V1 get invalidated instantly and Plan V2 propose an alternative verified scanner.

4. **Run the Automated Acceptance Suite:**
   - Go to **Metrics & Tests**.
   - Click **"▶ Run Acceptance Test Suite"** to verify all 4 compliance rules with live visual checkmarks.

5. **Present the Pitch Deck (Slide Deck Mode):**
   - Click **"📑 13-Slide Deck Mode"** in the top navigation.
   - Use the **Next / Previous** buttons or keyboard **Arrow Left / Right** keys to navigate through all 13 slides in full 16:9 presentation layout.

---

## 📂 Project Structure

```
hospitalops-app/
│
├── index.html          # Master Single-Page Application (All 13 slides & interactive modules)
├── style.css           # Healthcare Operations Design System (Dark obsidian theme, SVG styles)
├── app.js              # State machine, RBAC checker, SVG graph engine, slide controller
├── server.js           # Zero-dependency Node.js HTTP server & mock REST API
├── launch.bat          # 1-click Windows launcher (opens index.html directly)
├── start-server.bat    # 1-click Windows server launcher (starts node server.js)
└── README.md           # Documentation & user guide
```

