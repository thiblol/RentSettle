# CLAUDE.md

This is a hackathon project. **`/HACKATHON.md` is the source of truth** — read it first in every session before doing anything else.

## Project: RentSettle (Problem 03 — Deposit War Room)

A web platform where Bangalore tenants and landlords resolve security
deposit disputes in minutes using Karnataka's actual rent laws, instead of
fighting them out in Rent Control Court for an average of 14 months.

## Locked constraints (don't re-derive)

- **Problem chosen:** 03 (Deposit War Room). All 5 problems in `/problem-statements.txt` were scored — this one won.
- **Hackathon duration:** 16 hours.
- **Pitch slot:** 3 minutes pitch + 2 minutes Q&A.
- **MVP angle:** "Complete ODR Platform" (every criterion ≥ 3/5, weighted total 4.00/5.00).
- **Tech stack:** Next.js 14 (App Router) + TypeScript, Tailwind CSS + shadcn/ui, react-hook-form + Zod, SQLite + Drizzle ORM, `@react-pdf/renderer`, custom SVG for gap visualizer.
- **Demo rule:** One pre-loaded dispute, end-to-end in 3 minutes, no branching paths.

## Session start protocol

At the start of every session in this directory:

1. **Read `/HACKATHON.md`** to refresh MVP scope, judging-criteria proof points, phase plan, and scope cuts.
2. **Invoke `/hackathon-flow`** to re-orient on which phase is next given what already exists in the repo.
3. **Invoke the phase-specific skill** listed in HACKATHON.md's Phase plan table.

## Skills map (installed only)

| Phase | Skill |
|---|---|
| Re-orient | `/hackathon-flow` |
| Spec the build | `superpowers:brainstorming` → `superpowers:writing-plans` |
| Build the demo | `superpowers:executing-plans` or `superpowers:subagent-driven-development` |
| QA / polish | `ui-ux-pro-max` |
| Research | `researcher` |
| Pitch timing + roles | `/hackathon-skills:pitch-timebox` |

(Reference skills like `gstack:/qa`, `beautiful-hackathon-slides`, `pptx` are
listed in HACKATHON.md's Phase plan table — install them when you reach that
phase.)

## Don'ts

- Don't re-derive the problem choice, MVP scope, angle decision, or tech stack — they're locked.
- Don't invent team member names, roles, or skill strengths — the Team section in HACKATHON.md is intentionally absent.
- Don't invent Karnataka Rent Act section numbers — only the 3 named rules (10% annual depreciation cap on fixtures, 1-month notice rule, wear-and-tear prohibition) are verified from the problem statement.
- Don't expand scope beyond the locked MVP unless the user explicitly asks.
- Don't add facts or numbers not present in `/problem-statements.txt` or HACKATHON.md.