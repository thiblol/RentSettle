# RentSettle — Design Spec

**Date:** 2026-09-11
**Status:** Draft (pre-implementation)
**Author:** /hackathon-kickoff brainstorming session
**Hackathon:** 16 hours total, 3-minute pitch + 2-minute Q&A

## 1. Problem and goal

In Bangalore, **68% of security deposit disputes escalate to Rent Control Court** and take an average of **14 months** to resolve, with average disputed deposits of **₹1.5–2.5 lakh**. A proptech startup has a **2,000-unit Whitefield pilot launching in 8 weeks** and no working ODR platform exists in India for rental deposit disputes.

**Goal:** Build a working MVP web app (RentSettle) that walks one realistic deposit dispute from intake through settlement in under 3 minutes, applying verified Indian law and industry-standard practice.

## 2. Solution: 5-stage ODR lifecycle

1. **Intake** — Tenant portal (5 forms) and landlord portal (4 forms) capture claims and counter-claims.
2. **Rule engine** — Applies federal and Karnataka-specific law plus industry-standard practice to compute allowed deductions.
3. **Negotiation** — 3-round counter-offer state machine with gap visualizer; auto-settles when gap ≤ 5% of deposit.
4. **Settlement** — Generates a legal-format PDF with both digital consents.
5. **Mediator (bonus, separate route)** — Polished escalation view shown during Q&A only.

## 3. Locked decisions (do not re-derive)

| Decision | Value | Source |
|---|---|---|
| Problem | 03 — Deposit War Room | `/problem-statements.txt` |
| Hackathon duration | 16 hours | User |
| Pitch slot | 3 min pitch + 2 min Q&A | User |
| Tech stack | Next.js 14, Tailwind, shadcn/ui, SQLite + Drizzle, `@react-pdf/renderer` | HACKATHON.md |
| Architecture | Approach A — Route-based dual-portal | Brainstorming 2026-09-11 |
| Scenario data | Hybrid — pre-filled by default, fully editable, one-click reset | Brainstorming 2026-09-11 |
| Mediator view | Separate route `/showcase/mediator`, not on main demo path | Brainstorming 2026-09-11 |
| Pre-loaded scenarios | 3 (Whitefield 2BHK, Koramangala 1BHK, Indiranagar 3BHK) | Brainstorming 2026-09-11 |

## 4. Legal framework (verified citations for the rule engine)

Full research base: `docs/research/legal-research-synthesis.md`. The MVP's rule engine cites only the following verified authorities:

### Federal statute (applies across India)
- **Transfer of Property Act, 1882 §108(m)** — Tenant's duty to restore premises in as-good condition, **"reasonable wear and tear excepted."** Primary statutory basis for the wear-and-tear exclusion.

### Karnataka statute (Karnataka Rent Act, 1999 — Act 34 of 2001)
- **§47(1), (3)** — Landlord's duty to keep premises in "good and tenantable condition"; structural repairs per Part A of Fifth Schedule are landlord's duty.
- **§48(a)** — Tenant's duty to pay rent and other charges.
- **§48(b)** — Tenant's duty to maintain premises in "good and clean condition" and not cause damage.
- **§48(d)** — Tenant's duty to carry out "day to day repairs" per Part B of Fifth Schedule at own cost.

### Model Tenancy Act, 2021 — cited as advisory only
- **§11(1), (2)** — Security deposit cap (2 months residential, 6 months non-residential); refund at time of vacant possession. **Karnataka has NOT adopted the MTA** — cited as industry-standard reference only.

### Supreme Court case law
- **Fateh Chand v. Balkishan Dass (AIR 1963 SC 1405)** — Deductions must correspond to actual loss.
- **Maula Bux v. Union of India (AIR 1970 SC 1955)** — Damages must reflect genuine, demonstrable loss.
- **Kamal Kumar v. Premlata Joshi** — Deductions require evidentiary support.
- **Raptakos Brett & Co. Ltd. v. Ganesh Property, (1998) 7 SCC 184** — Post-tenancy relationship remains governed by statute and contract.

### Industry-standard practice (cited as such, not as statute)
- **10% annual depreciation on fixtures** — common convention in Karnataka rental agreements; **not statutory**. Tooltip must say so.

### Honesty note
The hackathon problem statement frames three rules as "Karnataka Rent Control Act provisions." **Only one (wear-and-tear) is genuinely Karnataka-federal statutory.** The other two (1-month refund, 10% depreciation) are industry-standard. The rule engine's tooltips MUST reflect this distinction to avoid misrepresenting non-statutory norms as binding law.

### Action item before demo
**Manually transcribe** the Fifth Schedule Parts A and B items from the official Karnataka Rent Act PDF (`https://dpal.karnataka.gov.in/storage/pdf-files/ao2001/34%20of%202001%20(E).pdf`). Cannot be retrieved via web fetch — needs human transcription.

## 5. Rule engine: per-category logic and citations

For each of the 5 deduction categories, the rule engine decision and cited authority:

### 5.1 Painting
- **Decision:** Deny by default; allow only with damage evidence exceeding normal wear.
- **Cited authority:** Karnataka Rent Act §47 (landlord's duty) + §48(d) (tenant only pays day-to-day repairs) + TPA §108(m) (wear-and-tear exception).
- **Tooltip:** "Periodic repainting for normal aging is structural maintenance, landlord's duty. Tenant pays only for damage beyond normal wear. — Karnataka Rent Act §47, §48(d); Transfer of Property Act §108(m)."

### 5.2 Fixtures
- **Decision:** Cap at industry-standard 10% per year of useful life. Tooltip must say industry standard.
- **Cited authority:** TPA §108(m) + Fateh Chand SC principle + "industry-standard depreciation convention in Karnataka rental agreements (10% per year of useful life)."
- **Tooltip:** "Fixtures are depreciated at 10% per year of useful life, an industry-standard convention. Final amount depends on age, condition, and original cost. — Transfer of Property Act §108(m); Fateh Chand v. Balkishan Dass (AIR 1963 SC 1405)."

### 5.3 Utilities
- **Decision:** Allow only with submitted proof (bills, receipts).
- **Cited authority:** Karnataka Rent Act §48(a) + Fateh Chand / Maula Bux (evidence-backed deductions).
- **Tooltip:** "Utility deductions require submitted proof of unpaid bills. — Karnataka Rent Act §48(a); Maula Bux v. Union of India (AIR 1970 SC 1955)."

### 5.4 Unpaid rent
- **Decision:** Strict arithmetic — months owed × monthly rent; require proof.
- **Cited authority:** Karnataka Rent Act §48(a).
- **Tooltip:** "Unpaid rent is a direct contractual obligation. — Karnataka Rent Act §48(a)."

### 5.5 Cleaning
- **Decision:** Deny by default.
- **Cited authority:** TPA §108(m) reasonable-wear exception + §48(d) day-to-day repairs scope.
- **Tooltip:** "Routine cleaning is normal end-of-tenancy hygiene, not damage. — Transfer of Property Act §108(m); Karnataka Rent Act §48(d)."

### 5.6 Cross-cutting principle
Every category requires **itemized, evidence-backed deductions** per Fateh Chand + Maula Bux precedent. Bare assertions by the landlord are insufficient (Kamal Kumar v. Premlata Joshi).

## 6. Application architecture

### 6.1 Route map
```
/                          ← landing + scenario picker (3 cards)
/c/[caseId]/tenant/intake  ← tenant portal: 5 forms (tenant's counter-version per category)
/c/[caseId]/landlord/intake← landlord portal: 5 forms (landlord's claimed deduction per category)
/c/[caseId]/calc           ← rule engine output + per-deduction citations
/c/[caseId]/negotiate      ← gap visualizer + 3-round state machine
/c/[caseId]/settle         ← final settlement + PDF download
/showcase/mediator         ← bonus escalation demo for Q&A
```

**Both portals have 5 forms** — one per deduction category — but from opposite perspectives:
- Landlord form (per category): "I'm deducting ₹X for painting. Here's my evidence."
- Tenant form (per category): "Here's my counter-version (I dispute / partially agree / agree)."
- The rule engine reconciles both perspectives into a single decision per category.

### 6.2 File structure
```
app/
  page.tsx
  c/[caseId]/
    tenant/intake/page.tsx
    landlord/intake/page.tsx
    calc/page.tsx
    negotiate/page.tsx
    settle/page.tsx
  showcase/mediator/page.tsx
  api/reset/[caseId]/route.ts   # POST: reset case to seed data

components/
  ui/                            # shadcn primitives
  RoleBadge.tsx
  DeductionRow.tsx               # Reusable row with rule citation tooltip
  GapVisualizer.tsx              # Two animated SVG bars + state diagram
  OfferForm.tsx                  # Counter-offer input with confidence hint
  ScenarioCard.tsx
  RuleExplainer.tsx              # "About this rule" expandable panel
  CitationTooltip.tsx            # Hover/tap shows authority + verbatim text
  PdfSettlement.tsx              # @react-pdf/renderer document

lib/
  db/
    schema.ts                    # Drizzle schema
    seed.ts                      # Loads 3 scenarios on boot
    client.ts
  rules/
    engine.ts                    # Main entry point: takes claims, returns decisions
    painting.ts
    fixtures.ts
    utilities.ts
    unpaid-rent.ts
    cleaning.ts
    citations.ts                 # All authority strings + verbatim text
  negotiation/
    machine.ts                   # useReducer state machine
    types.ts                     # Round, Offer, Gap types
  scenarios/
    whitefield-2bhk.ts
    koramangala-1bhk.ts
    indiranagar-3bhk.ts
  actions/                       # Next.js server actions
    case.ts                      # create, load, reset
    claim.ts                     # submit tenant/landlord claims
    negotiate.ts                 # submit offers, advance round, settle

docs/
  research/legal-research-synthesis.md
```

### 6.3 Data model (4 tables, Drizzle SQLite)

```typescript
// cases
{
  id: string (uuid),
  tenant_name: string,
  landlord_name: string,
  property_address: string,
  monthly_rent: number,            // in paise (integer)
  deposit_amount: number,          // in paise
  move_in_date: Date,
  move_out_date: Date,
  status: 'intake' | 'calc' | 'negotiate' | 'settled' | 'escalated'
}

// claims
{
  id: string,
  case_id: string (FK),
  category: 'painting' | 'fixtures' | 'utilities' | 'unpaid_rent' | 'cleaning',
  claimed_by: 'tenant' | 'landlord',
  amount_claimed: number,          // in paise
  evidence_json: string,           // JSON: { description, has_proof, ... }
  decision: 'allow' | 'deny' | 'cap',
  amount_allowed: number,
  reasoning: string,
  cited_authority: string          // e.g. "Karnataka Rent Act §47, §48(d); TPA §108(m)"
}

// negotiations
{
  id: string,
  case_id: string (FK),
  current_round: number,           // 0..3
  tenant_offer: number | null,
  landlord_offer: number | null,
  gap_percent: number,             // computed: |tenant - landlord| / deposit
  status: 'open' | 'settled' | 'escalated',
  settled_at: Date | null
}

// offers (history)
{
  id: string,
  case_id: string (FK),
  round_number: number,
  by_role: 'tenant' | 'landlord',
  amount: number,
  timestamp: Date
}
```

### 6.4 State machine — negotiation

```
OPEN ──submitOffer──> ROUND_1 ──submitOffer──> ROUND_2 ──submitOffer──> ROUND_3
                                                                              │
                              ┌─── gap ≤ 5% ─────────────────────────────────┤
                              ▼                                               │
                          SETTLED                                       ESCALATED
                              │                                               │
                              ▼                                               ▼
                       navigate to /settle                          navigate to /showcase/mediator
```

**Auto-settle trigger:** after EITHER party submits an offer, the system recomputes `gap_percent = |tenant_offer − landlord_offer| / deposit`. If `gap_percent ≤ 0.05`, the negotiation transitions to `SETTLED` automatically (regardless of which round). If rounds are exhausted (round 3 complete) and gap > 5%, transitions to `ESCALATED`.

In the main demo this is unreachable because pre-loaded scenarios always auto-settle by round 2.

### 6.5 Server actions (Next.js)

```typescript
// lib/actions/case.ts
createCase(scenarioId: string): Promise<Case>      // POST: create from seed
loadCase(caseId: string): Promise<CaseWithClaims> // GET
resetCase(caseId: string): Promise<Case>          // POST: wipe + reseed

// lib/actions/claim.ts
submitClaims(caseId: string, role: 'tenant'|'landlord', claims: ClaimInput[]): Promise<Claim[]>
runRuleEngine(caseId: string): Promise<Claim[]>   // computes decisions for all claims
overrideClaim(claimId: string, decision: Decision, amount: number): Promise<Claim>  // for demo edits

// lib/actions/negotiate.ts
submitOffer(caseId: string, by: 'tenant'|'landlord', amount: number): Promise<Negotiation>
getNegotiation(caseId: string): Promise<NegotiationWithHistory>
finalizeSettlement(caseId: string): Promise<{ pdfBlob: Blob }>
```

### 6.6 Form behavior (hybrid)

- All form fields are pre-filled from scenario seed on case creation.
- Every field is editable (controlled inputs).
- "Reset to demo data" button on every page → POST to `/api/reset/[caseId]` → wipes claims/offers → reseeds.
- "Save & Continue" button validates, persists, advances to next step.
- "Back" button preserves entered data (no destructive nav).

## 7. Pre-loaded scenarios

Three scenarios in `lib/scenarios/`. All pre-loaded with realistic data so judges see plausible dispute amounts and deduction claims.

### 7.1 Whitefield 2BHK (primary demo scenario)
- Tenant: Priya Sharma, Landlord: Rajesh Iyer
- Address: Prestige Shantiniketan, Whitefield
- Monthly rent: ₹25,000, Deposit: ₹2,00,000 (8 months rent)
- Tenancy: 24 months
- Tenant claims (5 categories with realistic amounts and evidence):
  - Painting: ₹35,000 claimed by landlord (full repaint) → tenant disputes, no damage
  - Fixtures: ₹18,000 claimed (broken geyser + cracked basin) → tenant disputes age
  - Utilities: ₹4,500 claimed (last 3 months electricity) → tenant disputes amount
  - Unpaid rent: 0 months (none)
  - Cleaning: ₹12,000 claimed → tenant disputes

### 7.2 Koramangala 1BHK
- Tenant: Amit Verma, Landlord: Sunita Reddy
- Address: 5th Block, Koramangala
- Monthly rent: ₹18,000, Deposit: ₹90,000 (5 months rent)
- Tenancy: 18 months

### 7.3 Indiranagar 3BHK
- Tenant: Sneha + Karthik Iyer, Landlord: Mohammed Farooq
- Address: 12th Main, Indiranagar
- Monthly rent: ₹45,000, Deposit: ₹4,50,000 (10 months rent)
- Tenancy: 36 months

Each scenario is hand-authored so that across all 3 scenarios, every rule path is exercised at least once:
- Whitefield: painting denied (wear-and-tear), fixtures capped at 10% depreciation, utilities partially allowed with proof, unpaid rent 0, cleaning denied.
- Koramangala: painting partially allowed (real damage), fixtures capped, utilities denied (no proof), unpaid rent 1 month, cleaning denied.
- Indiranagar: painting denied, fixtures allowed in full (tenant-caused damage), utilities denied, unpaid rent 2 months, cleaning partially allowed.

Negotiation scripted so primary demo scenario auto-settles by round 2 with gap within 5% of deposit.

## 8. Component contracts

### 8.1 `<DeductionRow claim={...} />`
- **Props:** `claim: Claim` (decision, amounts, citation)
- **Renders:** category name, claimed amount, allowed amount (or denied badge), reasoning preview, "?" button
- **Behavior:** clicking "?" expands `RuleExplainer` inline with full citation text.

### 8.2 `<GapVisualizer state={negotiation} onSubmit={fn} />`
- **Props:** `state: Negotiation`, `onSubmit: (amount: number) => void`
- **Renders:** two animated SVG bars (tenant on top, landlord on bottom), state diagram in corner, round counter, settlement-eligibility hint.
- **Behavior:** on offer submit, animates bars to new positions over 600ms; if gap ≤ 5%, flashes green and triggers `onSubmit`-then-navigate-to-settle flow.

### 8.3 `<RuleExplainer category={...} />`
- **Props:** `category: DeductionCategory`
- **Renders:** plain-English explanation + cited authority block + "industry-standard" badge where applicable.

### 8.4 `<PdfSettlement case={...} />`
- **Props:** `case: CaseWithClaims`, `negotiation: Negotiation`
- **Renders:** a `@react-pdf/renderer` document tree.
- **Output:** opens in browser as PDF; also downloadable via "Download" button.

### 8.5 `<RoleBadge role={...} />`
- **Props:** `role: 'tenant' | 'landlord' | 'mediator'`
- **Renders:** colored badge in header showing current role.

## 9. Error handling

- **Form validation:** all numeric inputs validated as positive integers in paise; cross-field validation (e.g., move_out_date > move_in_date).
- **State machine guard:** `submitOffer` rejects if state is not `OPEN` or current round is exhausted.
- **Empty claims:** if no claims submitted, calculation screen shows "No claims — full refund" with a "Add claim" button.
- **PDF generation failure:** fallback to print-styled HTML view (no PDF download) with retry button.
- **All errors:** toast notification + console log + never break the demo.

## 10. Testing strategy

Given the 16-hour constraint and the throwaway nature of the demo:

- **Smoke test:** scripted walkthrough of one full demo path on every change.
- **Rule engine unit tests:** one test per deduction category with 2-3 scenarios (allow / deny / cap).
- **Negotiation state machine tests:** 4 cases (auto-settle round 1, auto-settle round 2, escalate after 3 rounds, edge case exactly 5% gap).
- **PDF generation test:** open generated PDF in browser, verify all required fields present.
- **No E2E framework** — manual walkthrough is faster.

## 11. Demo script (3 minutes, locked from HACKATHON.md)

| Time | Action | Criterion covered |
|---|---|---|
| 0:00–0:15 | Land on demo, scenario "Whitefield 2BHK — ₹2L deposit" already loaded. Click "Start demo." | Setup |
| 0:15–0:45 | Tenant portal — click through 5 already-filled intake forms in 5 sec each. Role-switch in header. | UX (25%), Creativity (10%) |
| 0:45–1:15 | Landlord portal — same case ID, opposite perspective. Click through landlord's counters. | UX (25%) |
| 1:15–1:45 | Rule engine runs. Show breakdown panel with citation tooltips on each of the 5 deduction lines. | Legal (30%) |
| 1:45–2:30 | Negotiation: jump to round 1, then round 2 with gap visualizer animating, then round 3. State diagram visible in corner. | Negotiation SM (20%) |
| 2:30–2:45 | Gap ≤ 5% triggers auto-settle. Settlement page renders. | Negotiation SM (20%) |
| 2:45–3:00 | Open settlement PDF in browser tab. Both digital consent timestamps visible. | PDF (15%) |

## 12. Out of scope (cuts in priority order)

From HACKATHON.md, repeated here for spec completeness:

1. **Real authentication / multi-user accounts** — mock with role switch.
2. **Real cloud deployment** — local `next dev` only.
3. **Mediator view in main flow** — separate `/showcase/mediator` route, demo only.
4. **Email / SMS notifications** — none.
5. **Payment integration** — none.
6. **Multi-language support** — English only.
7. **CV/OCR on damage photos** — explicitly NOT required.
8. **Mobile native app** — responsive web only.

## 13. Open action items

1. **Manually transcribe** the Karnataka Rent Act Fifth Schedule Parts A and B (human-required; web fetch returns binary).
2. **Author the 3 scenarios** in `lib/scenarios/` with realistic amounts that exercise all 5 rule paths.
3. **Draft the verbatim citations** in `lib/rules/citations.ts` using the authority text from `docs/research/legal-research-synthesis.md`.
4. **Build the gap visualizer** with custom SVG animation (or fall back to Recharts).
5. **Build the PDF template** that includes all required fields plus rule citations.

## 14. Success criteria (demo day)

- All routes load without error on local `next dev`.
- One complete dispute runs end-to-end in 3 minutes.
- Every deduction line shows a citation tooltip on hover.
- Negotiation auto-settles when gap ≤ 5%.
- Settlement PDF opens in browser with all required elements.
- Mediator view loads on `/showcase/mediator` and shows escalation UI.
- Pre-loaded data is editable; "Reset to demo data" restores it.
- All 5 problem-statement criteria (Legal accuracy, UX, Negotiation SM, PDF, Creativity) have a visible demo proof.
