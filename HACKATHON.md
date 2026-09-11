# HACKATHON.md: RentSettle (Problem 03 — Deposit War Room)

<!-- Filled in by /hackathon-kickoff. Every downstream phase (brainstorming,
     build, deck, /pitch-timebox) reads this file; keep it current when the
     team pivots or cuts scope. -->

## The one-liner

RentSettle: a web platform where Bangalore tenants and landlords resolve
security deposit disputes in 5 minutes using Karnataka's actual rent laws —
instead of fighting them out in Rent Control Court for an average of 14 months.

## Urgency hook

In Bangalore, 68% of security deposit disputes escalate to Rent Control Court
and take an average of 14 months to resolve, leaving renters' ₹1.5–2.5 lakh
deposits frozen in legal limbo — and a proptech startup has a 2,000-unit
Whitefield pilot launching in 8 weeks with no ODR platform in India to deploy.

## Judging rubric

| Criterion | Weight | Our proof point (what a judge can see working in 30 seconds) |
|---|---|---|
| Legal accuracy and completeness of rule engine | 30% | On the calculation screen, each of the 5 deduction categories is shown with the Karnataka Rent Act rule that decided it (e.g. "Painting denied — wear-and-tear exclusion per Karnataka Rent Act"; "Fixture deduction capped at 10% annual depreciation"; "Cleaning denied — wear-and-tear exclusion"). Tooltip on every line cites the rule. |
| UX quality of the dual-party workflow (intake, negotiation) | 25% | Two distinct portals (tenant, landlord), each with a role indicator in the header. The same case ID is shown from opposite perspectives. The gap visualizer on the negotiation screen — two animated bars converging as offers close — is the demo's signature moment. |
| Robustness of the negotiation state machine | 20% | Visible state diagram on the negotiation screen: `OPEN → ROUND_1 → ROUND_2 → ROUND_3 → (SETTLED \| ESCALATED)`. Counter-offer buttons disable after round 3. Auto-settlement triggers when `|tenant_offer − landlord_offer| / deposit ≤ 0.05`. Activity log shows every state transition with a timestamp. |
| Quality and legal formatting of generated settlement PDF | 15% | Live-generated PDF opened in the browser before judges: contains tenant name, landlord name, property address, full deduction breakdown, final settlement amount, both digital consent timestamps, and the rule citations from the calculation screen. |
| Creativity in evidence evaluation workflow | 10% | Per-category evidence forms with structured fields (damage photo upload with metadata, agreement clause selector, bill amount field). Each evidence item is linked to the rule it supports, so when a deduction is denied the breakdown reads "evidence insufficient for rule X" — the judges see the link, not just a number. |

## Angle decision

| Angle | Legal (30%) | UX (25%) | Negotiation (20%) | PDF (15%) | Creativity (10%) | Weighted |
|---|---|---|---|---|---|---|
| **A (chosen): Complete ODR Platform — RentSettle** | 4 | 4 | 4 | 4 | 4 | **4.00 / 5.00** |
| B: Legal Engine First (deep rule engine, minimal UX) | 5 | 2 | 2 | 3 | 2 | 3.05 / 5.00 |
| C: Mediation Theater (deep UX + visualizer, shallow rule engine) | 2 | 5 | 5 | 3 | 2 | 3.50 / 5.00 |

**Why A:** Only angle with no criterion scoring below 3. Maximises weighted
total AND minimises variance — if any one area under-delivers, the others
carry the score.

## MVP scope (locked — what's IN, what's OUT)

### In scope (must ship)

1. **Two portals** — tenant and landlord, distinct intake forms, all 5 deduction categories (painting, fixtures, utilities, unpaid rent, cleaning).
2. **Rule engine** implementing the 3 statutory rules named in the problem statement:
   - 10% annual depreciation cap on fixtures
   - 1-month notice rule
   - Wear-and-tear prohibition (applies to painting and cleaning)
3. **Negotiation state machine** — max 3 rounds of counter-offers, auto-settle when `|tenant_offer − landlord_offer| / deposit ≤ 0.05`, escalate when gap > 5% after round 3.
4. **Gap visualizer** — two animated bars converging in real-time as offers change.
5. **Settlement PDF** — contains tenant name, landlord name, property address, full deduction breakdown, final settlement amount, both digital consent timestamps, and rule citations.
6. **3 pre-loaded realistic dispute scenarios** (e.g. Whitefield 2BHK — painting claim + tap dispute).
7. **Single-command local boot** — `npm run dev` starts the whole app.

### Out of scope (cuts in priority order, see Scope Cuts section)

- Real authentication / multi-user accounts — mock with role switch.
- Real cloud deployment — local only.
- Mediator escalation view (post-3-round) — placeholder text only.
- Email / SMS notifications.
- Payment integration.
- Multi-language support — English only.
- CV/OCR on damage photos — explicitly NOT required by the problem statement.
- Mobile native app — responsive web only.

## Phase plan

**Total hackathon duration: 16 hours (locked).**

**Pitch slot: 3 minutes pitch + 2 minutes Q&A (locked).**

| Checkpoint | Time | Deliverable | Skill / command |
|---|---|---|---|
| Kickoff | T+0 | This file | `/hackathon-kickoff` |
| Spec | T+0.5h | Feature list, schema, API contract, scenario data | superpowers `brainstorming` |
| **Feature Zero** | T+3h | One pre-loaded dispute → tenant intake → landlord intake → rule engine output → one round of negotiation → PDF. Deployed locally, demo-able end-to-end. Mock data fine. | |
| Core build | T+10h | All 5 stages complete, rule engine covering all 5 deduction categories, gap visualizer polished, settlement PDF, 3 pre-loaded scenarios | |
| QA + polish | T+12h | Bug pass on full lifecycle; spacing/hierarchy pass on both portals; PDF tested across Chromium/Firefox | gstack `/qa`, `/design-review`; `ui-ux-pro-max` |
| Deck | T+14h | 7 slides + narration script | `beautiful-hackathon-slides` |
| Pitch script | T+14.5h | `PITCH.md` | `/pitch-timebox` |
| Rehearsal ×2 | T+15.5h | Both pitch runs ≤ 2:50 (under 3-min limit); one full Q&A dry run | |
| **Submission** | T+16h | Repo + deck + 60s video | |

## Areas of work (no person assigned — split however the team chooses)

| Focus area | Build responsibilities | Pitch responsibilities |
|---|---|---|
| Frontend | Tenant + Landlord portals, intake forms, gap visualizer UI | Live demo delivery |
| Backend | Rule engine, negotiation state machine, PDF generator | Tech + architecture explanation |
| Design + content | Deck, brand, demo script, 3 dispute scenarios | Hook + urgency narration |
| Research | Karnataka Rent Act rule citations, legal accuracy check | Impact + model numbers |

## Tech stack (locked)

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | react-hook-form + Zod |
| Database | SQLite + Drizzle ORM |
| PDF | `@react-pdf/renderer` |
| Charts (gap visualizer) | Custom SVG (animated) — Recharts as fallback if time-pressed |
| State machine | Plain `useReducer` (XState only if time permits) |
| Auth (mocked) | Query-param role switch + cookie |
| Deploy | Local `next dev` |

Single repo, single language (TypeScript), single `npm install`. No Docker, no
separate backend, no cloud DB, no env vars to manage on demo day.

## Scope cuts (running log)

If we're behind at a checkpoint, cut in this order — decided now, not at 4am:

1. **Cut the third pre-loaded scenario** — keep Whitefield 2BHK + one other. Saves ~1h.
2. **Cut the activity log on the negotiation screen** — state diagram alone is enough proof. Saves ~1h.
3. **Cut rule-citation tooltips on the calculation screen** — keep the citations in the PDF only. Saves ~1h.
4. ~~Cut the gap visualizer animation; replace with static numbers~~ — **DO NOT CUT.** This is the demo's signature moment and earns marks on 25% of criteria.
5. ~~Cut settlement PDF entirely~~ — **DO NOT CUT.** Worth 15% of marks and is the tangible artifact judges keep.
6. ~~Reduce 3 negotiation rounds to 1 round~~ — **DO NOT CUT.** The 3-round state machine is the proof for 20% of marks.
7. ~~Reduce 5 deduction categories to 3~~ — **DO NOT CUT.** All 5 are named explicitly in the problem statement.

## Demo script (3 minutes, linear, one dispute end-to-end)

Pre-loaded data means the intake forms are already filled in — clicking
through them is faster than typing live. Use the 3-minute budget to SHOW, not
TYPE.

| Time | Action | Criterion covered |
|---|---|---|
| 0:00–0:15 | Land on demo, scenario "Whitefield 2BHK — ₹2L deposit" already loaded. Click "Start demo." | Setup |
| 0:15–0:45 | Tenant portal — click through 5 already-filled intake forms in 5 sec each. Role-switch in header. | UX (25%), Creativity (10%) |
| 0:45–1:15 | Landlord portal — same case ID, opposite perspective. Click through landlord's counters. | UX (25%) |
| 1:15–1:45 | Rule engine runs. Show breakdown panel with citation tooltips on each of the 5 deduction lines. | Legal (30%) |
| 1:45–2:30 | Negotiation: jump to round 1, then round 2 with gap visualizer animating, then round 3. State diagram visible in corner. | Negotiation SM (20%) |
| 2:30–2:45 | Gap ≤ 5% triggers auto-settle. Settlement page renders. | Negotiation SM (20%) |
| 2:45–3:00 | Open settlement PDF in browser tab. Both digital consent timestamps visible. | PDF (15%) |

## Pre-agreed trade-offs (decided now, not at 4am)

- **Demo over polish on internal tools.** Internal admin views can be ugly; the two portals + negotiation screen must look production-quality.
- **Mock data over real Bangalore rental data.** Scenarios are hand-authored to be realistic (not "Test 1"); do not waste time scraping listings.
- **Statutory accuracy over edge cases.** The 3 named rules + 5 categories must be unimpeachable. Anything beyond those rules is a stretch goal.
- **One demo path, no branching.** The pitch shows one complete dispute. Judges can ask questions afterward; the demo itself does not have alternate flows.
