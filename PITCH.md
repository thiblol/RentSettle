# PITCH.md: RentSettle — Deposit War Room

<!-- Filled in by /pitch-timebox. Update speaker names and team info below. -->

**Time limit:** 3 min pitch + 2 min Q&A
**Word budget:** ~380 words (3 min × 142 wpm, minus 10% buffer)
**Pitch structure:** Slides as visual anchors — demo runs live in browser during pitch
**Demo command:** `npm run dev` → pick "Whitefield 2BHK — ₹2L Deposit" → "Start demo"

---

## Speaker roles

| Speaker | Responsibility |
|---|---|
| **SPEAKER_A** | Opener, problem, live demo narration |
| **SPEAKER_B** | Technical deep-dive, Q&A |

> **Fill in:** Replace SPEAKER_A / SPEAKER_B with actual names. Assign whoever is most fluent with the app to SPEAKER_A (they drive the demo during the pitch).

---

## Timing table

| Start–End | Speaker | Section | Script |
|---|---|---|---|
| 0:00–0:30 | SPEAKER_A | Hook + problem | **VERBATIM:** "In Bangalore, 68% of security deposit disputes go to Rent Control Court. Average resolution: fourteen months. Renters lose ₹1.5–2.5 lakh — frozen in legal limbo. There's a 2,000-unit proptech pilot launching in eight weeks with no ODR platform in India to deploy. We built one. Let me show you." |
| 0:30–1:45 | SPEAKER_A | Live demo — narrated | **Narration while clicking through the app:** "We're on the home screen — three pre-loaded scenarios. We pick Whitefield, a ₹2 lakh deposit dispute. Click 'Start demo.' Now we're in the tenant portal — all five deduction categories, pre-filled from the scenario. We skip through them: painting, fixtures, utilities, unpaid rent, cleaning. Same case ID visible in the URL. Role-switch to landlord portal — same case, opposite perspective. Landlord counters on painting and cleaning. Now the rule engine runs. Notice — each deduction line shows the Karnataka Rent Act rule that decided it. Painting denied: wear-and-tear exclusion. Fixture deduction capped at 10% annual depreciation. Every decision has a citation. Now negotiation — watch the gap visualizer. Tenant offer, landlord offer, bars converging. Round 1, round 2, gap hits five percent. Auto-settle. Settlement page renders. And here's the PDF — full deduction breakdown, both digital consent timestamps, rule citations baked in. That's the full loop. Thirty seconds." |
| 1:45–2:15 | SPEAKER_B | Why it wins | **VERBATIM:** "Every judging criterion has a visible proof point. Legal accuracy: the rule engine cites every statute — thirty percent of this score. Dual-party UX: you just watched tenant and landlord portals with a role indicator in the header — twenty-five percent. Negotiation state machine: OPEN to ROUND_1 to ROUND_2 to ROUND_3 to SETTLED — the diagram was in the corner, twenty percent. Settlement PDF: opened in the browser, rule citations and timestamps, fifteen percent. Evidence workflow: each deduction is linked to the specific rule it supports — ten percent. We built to the rubric." |
| 2:15–2:45 | SPEAKER_A | Team + close | **VERBATIM:** "Built in sixteen hours. Karnataka Rent Act rules, gap visualizer, negotiation state machine, settlement PDF — all working. That's RentSettle. Thank you. Questions?" |

---

## Demo flow (what to click during pitch)

```
Home → "Whitefield 2BHK" card → "Start demo"
  → Tenant portal (pre-filled) → scroll through 5 categories → header role switch
  → Landlord portal (counters pre-filled) → "Submit counter"
  → Rule engine output (calc page) — point to citation tooltips
  → "Proceed to negotiation" → negotiation page (gap visualizer)
  → Click "Submit round 1 offer", "Submit round 2 offer"
  → Auto-settle triggers → settlement page
  → "Download settlement PDF" → PDF opens in new tab
```

**Demo fallback:** If the app hangs or the network breaks, say: "While that loads — the deck at slide 4 shows the same flow. The PDF format and the rule citations are visible there too." No apologizing.

---

## Q&A prep

| Likely question | One-line answer | Who answers |
|---|---|---|
| "Which specific Karnataka Rent Act sections did you implement?" | Section references are in the rule engine output — the three rules are the 10% annual depreciation cap, the 1-month notice rule, and the wear-and-tear exclusion on painting and cleaning. | SPEAKER_B |
| "What happens if the gap stays above 5% after round 3?" | The case escalates to mediator view — we show a placeholder mediator page, not a full implementation. | SPEAKER_B |
| "Is the settlement PDF legally binding?" | It's a demonstrator — not legal advice and not filed with any court. The format is designed to be filed under Karnataka's existing small-claims process. | SPEAKER_A |
| "What's the difference between this and a normal calculator?" | A calculator gives a number. We show which rule produced each deduction and why — and both parties negotiate on that basis, not on a black-box output. | SPEAKER_A |
| "What did you cut?" | Multi-user auth (mocked with role switch), cloud deploy (local only), mediator escalation view (placeholder text). Three pre-loaded scenarios; we kept all five deduction categories. | SPEAKER_B |
| "What would you do with 30 more days?" | Real authentication, mediator escalation UI, API routes for a backend, and a pilot with an actual RWAs in Whitefield. | SPEAKER_A |

---

## Rehearsal checklist

- [ ] **Full run #1 with stopwatch** — target ≤ 3:00
- [ ] **Full run #2** — confirm ≤ 3:00 after any cuts
- [ ] Every handoff line lands: SPEAKER_B starts within 2 seconds of SPEAKER_A's close
- [ ] Demo: app starts cleanly, Whitefield scenario loads, all 5 steps click through without error
- [ ] PDF: confirms it opens in a new tab with deduction breakdown visible
- [ ] Laptop: notifications off, browser in focus, charger packed — check at venue
- [ ] Q&A: each owner answered their question cold, out loud, once

---

## Slide reference (for visual anchors during demo)

| Slide | What to say |
|---|---|
| 1 (Title) | Shown at start — speaker reads the tagline |
| 2 (Problem) | Shown at 0:00–0:30 — stats visible while problem is spoken |
| 3 (How it works) | Shown at 0:30–1:45 — speakers can point to feature cards while demo runs |
| 4 (Demo) | Shown at 1:45–2:15 — criteria visible while SPEAKER_B calls them out |
| 5 (Why it wins) | Can skip if demo ran cleanly |
| 6 (Team close) | Shown at 2:15–2:45 — brand close while SPEAKER_A finishes |
