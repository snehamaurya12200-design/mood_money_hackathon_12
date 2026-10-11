# MOOD MONEY

> **₹10,000. 30 days. Let's make it.**  
> An experimental Gen Z personal finance web application and financial decision simulator built around the challenge of surviving 30 days on a ₹10,000 budget.

---

## 📑 Table of Contents
- [Project Overview](#-project-overview)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Design Philosophy](#-design-philosophy)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Design & Implementation Highlights](#-design--implementation-highlights)
- [Screenshots & Preview](#-screenshots--preview)
- [Future Improvements](#-future-improvements)
- [Hackathon Context](#-hackathon-context)
- [Author & Links](#-author--links)
- [License](#-license)

---

## 💡 Project Overview

**MOOD MONEY** reimagines personal wealth management not as a tedious accounting spreadsheet, but as an expressive, high-stakes lifestyle ritual.

Young adults and college students frequently confront a universal dilemma: **managing a tight monthly allowance (₹10,000) over 30 days without running out of runway before the month ends.**

Rather than displaying sterile charts and intimidating balance sheets, MOOD MONEY gamifies the 30-day survival loop with:
- A dynamic **Safe-to-Spend Daily Cap** (₹320/day) that adjusts to actual expenditure.
- The **"Can I Afford It?" Decision Studio**: a real-time impulse purchase simulator that stress-tests potential buys against remaining runway days.
- An **Emergency Cushion Vault** locked before weekend splurges unlock.
- Tactile **3D physical buttons**, an animated **Cherry Cola WebGL2 Warp Gradient**, and an editorial continuous **typography marquee**.

---

## 🧠 The Problem

For college students, entry-level workers, and Gen Z digital natives, staying disciplined with money is notoriously difficult:
1. **Frictionless Digital Payments:** UPI, contactless taps, and instant food deliveries make spontaneous spending frictionless and unnoticeable until it's too late.
2. **Abstract Balance Illusion:** Seeing ₹6,800 in an account on Day 12 feels comfortable, masking the reality that only ₹320/day remains for the remaining 18 days.
3. **Alienating Fintech Tools:** Legacy banking apps and corporate personal-finance tools feel clinical, dry, and guilt-inducing rather than empowering.

---

## 🎯 Our Solution

MOOD MONEY turns budgeting into a self-aware, tactical challenge:
- **Survival Cadence Over Complex Accounting:** Simplifies all financial telemetry into one number that matters today: your **Daily Safe-to-Spend Cap**.
- **Interactive Decision Studio:** Allows users to test-drive prospective purchases before their money takes the hit, revealing the real consequence in lost runway days and dropped daily allowances.
- **Physicality in a Digital Interface:** Tactile 3D raised buttons with physical depression on press, spring-loaded modal dialogs, and fluid animated backgrounds bring editorial tangibility back to the screen.

---

## ✨ Key Features

All features listed below are actively implemented and functional within the application:

- **Complete Multi-Page Architecture (8 Working Destinations):**
  1. **Home (Command Center):** Complete dashboard overview, available balance, safe-to-spend cadence, emergency cushion gauge, upcoming bills strip, recent ledger entries, and Warp Gradient hero.
  2. **My Money (Comprehensive Ledger):** Full transaction management (search, filter by category & type, add/edit/delete transactions, summary metrics for inflow, outflow, and net burn).
  3. **Spend Planner:** Visual category budget allocator (Food, Transport, Bills, Education, Personal, Emergency Reserve, Savings, Other) totaling ₹10,000, with preset strategies (Balanced, Social Campus, Frugal Sprint) and live buffer calculations.
  4. **Can I Afford It? Studio:** Full-page decision simulator with interactive price dial, preset impulse chips, multi-factor runway calculation, nuanced verdicts, and options to commit to the ledger or skip & preserve streak.
  5. **Savings Lab:** Features the dedicated `InteractiveMoneyJar` component built with CSS 3D transforms, layered shadows, tactile Cherry-Red glass curvature, dynamic liquid/coin accumulation matching `currentAmount`, physics-based tumbling coin drops, liquid surge waves, and floating celebration pills on recorded contributions.
  6. **Future Me:** Predictive 30-day forecast engine with scenario switcher (Baseline Burn, Frugal Sprint, Weekend Splurge), burn velocity tracking, and scheduled bill timeline.
  7. **Money Personality:** Gen Z psychological diagnostic quiz and archetype explorer (The Strategic Alchemist, The Soft Life Realist, The Spontaneous Thrillseeker, The Fortress Builder) with interactive trait radar and shareable ritual badge.
  8. **Challenge HQ (Day 12):** Mission command center for "Survive 30 days on ₹10,000" featuring an interactive 30-day calendar matrix, Day Inspector, Time-Travel simulator (jump between days 1–30), the 4 Golden Commandments, unlockable challenge badges, and safe reset.

- **Unified Shared Financial Data Model (`FinanceContext`):**
  - Single source of truth across all 8 pages for starting budget (₹10,000), current day, transactions, commitments, savings goals, and budget plans.
  - Automatically calculates `availableBalance = startingBudget + totalIncome - totalSpent`, `dailySafeToSpend = (availableBalance - essentialCommitments) / daysRemaining`, and category spending without double-counting.
  - Persists state in `localStorage` for uninterrupted exploration.

- **Interactive 3D Money Jar (Feature 1):**
  - Glossy dimensional Cherry-Red/Glass money jar visualization using CSS 3D transforms, specular highlights, and organic coin accumulation.
  - Number of visible coins and liquid fill height dynamically connect to actual savings progress (`₹1,200 / ₹2,000`).
  - Interactive top-up actions (`+ ₹100`, `+ ₹200`) drop physical animated coins with bounce physics and confetti celebrations upon goal completion.
  - Seamless toggle between the 3D Money Jar and the FIG. 02 Ceramic Piggy Bank artwork.

- **Advanced "Can I Afford It?" Purchase Simulator (Feature 2):**
  - Comprehensive stress-testing simulator with an interactive price dial and preset chips.
  - Multi-factor mathematical checks: evaluates post-purchase balance, remaining days, daily cap drop, essential bills protection (`₹850` pre-allocated for recharge & subscriptions), and emergency cushion impact.
  - Transparent outcome verdicts:
    - `COMFORTABLY AFFORDABLE` (green/yellow signal: minimal daily cap drop, full bills coverage)
    - `AFFORDABLE, BUT BE CAREFUL` (pink/burgundy caution: noticeable daily cap tightening)
    - `NOT RECOMMENDED` (cherry-red alert: breaches bill reserves, emergency cushion, or survival baseline)
  - Clear rationale explanation; previewing does not alter balance until the user explicitly clicks "Confirm & Add to Ledger".

- **Interactive 30-Day Financial Challenge Journey (Feature 3):**
  - Miniature tactile landscape consisting of 30 interactive day tiles.
  - Visually categorizes days into Settled Past (Days 1–11), Active Today (Day 12 with pulsing highlight), and Future Runway (Days 13–30).
  - Clicking any tile expands an animated inspector card detailing target allowances, actual logged spend, and remaining cycle days.

- **Dynamic Spending Forecast & Scenarios (Feature 4):**
  - Multi-scenario financial trajectory projector with smooth animated transitions.
  - **Baseline Scenario:** Projects end-of-month balance under current observed pace (`₹263/day`).
  - **Frugal Sprint Scenario:** Models a 25% discretionary spend reduction to maximize cushion funding (`+ ₹2,444` surplus).
  - **Weekend Splurge Risk Scenario:** Stress-tests weekend spending spikes (`₹420/day`), warning of mid-cycle deficits.
  - Transparent formula breakdowns and stated assumptions.

- **The Moneyverse — Interactive Three.js 3D Financial World:**
  - Miniature architectural 3D diorama built procedurally with Three.js representing the 30-day challenge journey on ₹10,000.
  - Floats on a sculptural circular platform with Deep Burgundy bevel, Warm Cream surface, and Espresso borders.
  - **Dynamic State Synchronization**:
    - Central Savings Citadel height and inner golden core intensity scale directly with savings progress (`activeGoal.currentAmount / activeGoal.targetAmount`).
    - Orbiting 3D metallic gold coins ring surrounds the citadel when savings milestones are active.
    - 30-day path winding around the city illuminates completed days, highlights the current day marker with an animated beacon, and softly renders future stones.
    - Warning beacon pulses if spending pressure becomes tight.
  - **Interactive Controls**:
    - Drag to orbit horizontally with smooth damping and momentum.
    - Subtle parallax tilt responding to pointer movement.
    - Raycasted entity inspection: click the Central Savings Citadel or the 30-Day Path to open HTML detail cards with live metrics and quick vault top-ups.
    - Camera "Reset View" button and "Auto-Orbit: ON / Paused" toggle.
  - **Graceful WebGL Fallback**: Retains full responsive usability and displays informative fallbacks if WebGL is unavailable.

- **Dimensional Financial Health Orb (Feature 6):**
  - Concentric layered ring and glass core with subtle breathing pulse.
  - Computes real health signals based on spending timeline velocity (spending 31.6% while 40% time elapsed = healthy 8.4% buffer).

- **Magnetic 3D Pointer Interaction (Feature 5):**
  - Desktop mouse-following card tilt (`useTilt3D`) on the Decision Studio and Money Jar cards with smooth spring recovery on mouse leave.

- **Tactile 3D Physical Buttons:**
  - Custom CSS-extruded buttons (`.btn-3d`, `.btn-3d-cherry`, `.btn-3d-yellow`, `.btn-3d-white`, `.btn-3d-burgundy`) with physical height, bottom extrusion edge, top-edge highlights, hover rise (`-2px`), and satisfying active depression (`+3px`).

- **Signature Moving Typography Marquee:**
  - Dual opposing horizontal text tracks (`marquee-track-left` and `marquee-track-right`) moving continuously at independent speeds (32s / 38s) with zero jumps or layout shift.

- **WebGL2 Warp Gradient Background (Dimensional Liquid Satin Effect):**
  - **Shader Architecture:** Custom WebGL2 GLSL ES 3.00 fragment shader rendering continuous, domain-warped fractional Brownian motion (FBM). Broad, flowing ribbons of color create an organic sensation of liquid cherry glass and satin light.
  - **Signature Cherry Cola Preset:** Configured with four authoritative tones: Deep Burgundy (`#552139`), Cherry Red (`#E94355`), Ballet Pink (`#F2C6D5`), and Warm Cream (`#FFF9F1`) with restrained butter-yellow specular highlights.
  - **Dimensional CSS Layering:** Complemented by three lightweight CSS lighting overlays:
    - *Soft Depth Lighting:* Specular radial glow from the top-left (`rgba(255, 255, 255, 0.45)` blending into `rgba(246, 223, 121, 0.12)`) simulating curved reflective glass surfaces.
    - *Satin Sheen:* Diagonal translucent depth wave (`rgba(242, 198, 213, 0.18)`).
    - *Restrained Edge Vignette:* Subtle radial darkening at the perimeter to focus contrast on core financial figures.
  - **Stacking Context & Contrast Preservation:** Integrated via absolute positioning at `z-0` beneath an editorial translucent cream veil (`bg-[#FFF9F1]/72`), keeping typography strictly legible without falling behind parent backgrounds or trapping pointer events (`pointer-events-none`).
  - **Performance & Accessibility:** Automatically pauses shader execution via an `IntersectionObserver` hook (`useInView`) when out of the active viewport, caps the render buffer at `dpr: 1.5` for high-frame-rate mobile performance, respects `prefers-reduced-motion`, and falls back to a CSS radial gradient if WebGL2 is unavailable.

- **Fluid Spring Modals:**
  - Spring-physics motion curves via Motion / Framer Motion (`damping: 26, stiffness: 360`) for seamless opening and closing of modals and alerts.

---

## 🎨 Design Philosophy

MOOD MONEY adopts the **Cherry Cola Editorial** aesthetic merging European editorial magazine art direction with punchy, tactile post-modern brutalism.

### The Color Palette
| Color | Hex | Usage |
| :--- | :--- | :--- |
| **Cherry Red** | `#E94355` | Primary transactional CTAs, critical thresholds, progress indicators |
| **Deep Burgundy** | `#552139` | Authoritative anchors, status ticker band, 3D button extruded bottom edges |
| **Butter Yellow** | `#F6DF79` | Positive trend highlights, Decision Studio primary button, FIG badges |
| **Ballet Pink** | `#F2C6D5` | Secondary surface tint, upcoming bills panel, subtle category trays |
| **Warm Cream** | `#FFF9F1` | Primary canvas background evoking heavy uncoated editorial paper stock |
| **Espresso** | `#292225` | Deep organic structural borders (1.5px–2px), hard drop shadows, high-contrast headings |
| **Soft White** | `#FFFFFF` | Discrete foreground cards and ledger rows |

### Typography Hierarchy
- **Display & Headings:** `Epilogue` (Extra-bold 800 kerned tightly for magazine-cover impact).
- **Body & Editorial Copy:** `Hanken Grotesk` (Clean contemporary grotesk engineered for reading comfort).
- **Ledger Data & Numerics:** `JetBrains Mono` (Monospaced precision for balances, currency meters, and tags).

---

## 🛠 Tech Stack

- **Framework:** [React 19](https://react.dev/) (SPA architecture)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict typing, no emit mode)
- **Bundler & Dev Server:** [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom `@theme` variables
- **Motion & Spring Physics:** [Motion / Framer Motion](https://motion.dev/)
- **Visual Shader Effects:** Native WebGL2 with custom GLSL ES 3.00 shaders
- **Icons & Typography:** Google Fonts (`Epilogue`, `Hanken Grotesk`, `JetBrains Mono`) & Google Material Symbols
- **Micro-Interactions:** `canvas-confetti` for celebratory dopamine feedback
- **Class Merging:** `clsx` & `tailwind-merge`

---

## 🚀 Getting Started

Follow these steps to run MOOD MONEY locally on your machine:

### Prerequisites
- [Node.js](https://nodejs.org/) (version `v18.0.0` or higher recommended)
- `npm`, `yarn`, or `pnpm`

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/mood-money.git
   cd mood-money
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Open the application:**
   Navigate in your browser to:
   ```text
   http://localhost:3000
   ```

---

## 📜 License
Apache-2.0 License. See source file headers for license declarations.
