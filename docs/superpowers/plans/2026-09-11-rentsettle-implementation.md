# RentSettle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build RentSettle — a web app that walks one realistic Bangalore deposit dispute from intake → rule engine → negotiation → settlement PDF in under 3 minutes.

**Architecture:** Single Next.js 14 (App Router) full-stack app. SQLite database via Drizzle ORM. Server actions for mutations. Pre-loaded + editable dispute scenarios. Custom SVG gap visualizer. `@react-pdf/renderer` for client-side PDF. Two portals (tenant, landlord) plus a separate mediator showcase route.

**Tech Stack:** Next.js 14 (App Router) + TypeScript, Tailwind CSS, shadcn/ui, react-hook-form + Zod, better-sqlite3 + Drizzle ORM, `@react-pdf/renderer`, vitest for tests.

**Spec:** `docs/superpowers/specs/2026-09-11-rentsettle-design.md`
**Legal research:** `docs/research/legal-research-synthesis.md`

---

## Global Constraints

- **Hackathon window:** 16 hours total. This plan covers T+0 to T+12h (build + QA). Deck/pitch/rehearsal are separate.
- **Pitch slot:** 3 minutes pitch + 2 minutes Q&A. Demo runs in exactly 3 minutes.
- **Money type:** all currency stored as **integer paise** (₹1 = 100 paise). No floats anywhere.
- **Stack lock:** do NOT substitute libraries. Next.js 14, Tailwind, shadcn/ui, better-sqlite3, Drizzle, `@react-pdf/renderer`.
- **No authentication.** Role switch via URL or header toggle.
- **No cloud deployment.** Local `next dev` only.
- **Demo path always ends in auto-settlement.** Pre-loaded scenarios are tuned for gap ≤ 5% within 2 rounds.
- **Frequent commits.** One commit per task minimum.
- **Demo path must be unbreakable.** Every error path has a fallback that doesn't break the demo.
- **Cite only verified law.** Citations come from `docs/research/legal-research-synthesis.md`. Industry-standard rules MUST be labelled as such in tooltips.

## Design System (locked — "The Settlement Table" aesthetic)

This is the visual identity. Every page derives colors, typography, and spacing from this section. **Do not introduce ad-hoc colors or fonts.**

### Palette tokens

```
--paper:    #FAF8F3   /* warm off-white, page background */
--ink:      #0F1A2E   /* deep navy, primary text */
--saffron:  #FF6B35   /* signature accent — gap visualizer, key CTAs */
--tenant:   #0E7C66   /* emerald — tenant role color */
--landlord: #B85C00   /* amber — landlord role color */
--mute:     #6B6358   /* warm gray, secondary text */
--line:     #E8E2D5   /* warm hairline divider, card borders */
```

In Tailwind config these map to `bg-paper`, `text-ink`, `bg-saffron`, `text-tenant`, `bg-landlord`, `text-mute`, `border-line`.

### Typography

| Role | Family | Usage |
|---|---|---|
| Display (hero, page titles) | **Instrument Serif** (italic, 400 weight) | Landing hero h1, settlement page "Agreed refund" label |
| Body | **Inter** (400, 500) | All body copy, buttons, form labels |
| Mono | **JetBrains Mono** | Currency amounts, timestamps, state machine labels, citation IDs |

Loaded from Google Fonts via Next.js `<link>` in `app/layout.tsx`. **Never mix display fonts.** Instrument Serif is the risk — keep it for hero moments only.

### Type scale (intentional)

- Hero: 56px / 1.05 line-height / Instrument Serif italic
- H1: 40px / 1.15 / Inter 600
- H2: 28px / 1.25 / Inter 600
- H3: 20px / 1.3 / Inter 600
- Body: 15px / 1.55 / Inter 400
- Caption: 13px / 1.4 / Inter 500
- Eyebrow: 11px / 1.2 / Inter 600 / uppercase / tracking-widest / text-mute
- Mono amount: 32px / 1.1 / JetBrains Mono 500

### Layout principles

- **Paper-document feel.** Cards use `border border-line` (1px warm hairline). No shadows except a single subtle `shadow-sm` on the live demo badge.
- **Generous whitespace.** Default vertical rhythm: 24px between siblings, 48px between sections, 96px above hero on landing.
- **Asymmetric hero.** Landing page H1 sits left-aligned with a small saffron dot to its right (signature mark). Description below in muted color.
- **Strong horizontal rules** separate major sections in negotiation and calc pages — feels like a legal document.
- **One bold color per page.** Each page has at most one saturated element: landing (saffron dot), tenant portal (emerald accents), landlord portal (amber accents), calc (saffron on the refund number), negotiation (saffron bars in the visualizer), settlement (saffron on the download button).

### Signature element: the Gap Visualizer

Two horizontal bars (tenant emerald on top, landlord amber on bottom) animate their fill widths as offers change. A thin saffron vertical line marks the gap between them. When the gap closes to ≤5%, both bars pulse saffron once and a "✓ AUTO-SETTLE ELIGIBLE" pill appears in mono caps. This is the moment judges remember.

The same mini-version of the gap (single horizontal bar with both markers) appears inside each OfferForm as the "live coach hint" background.

### Components should use these tokens

- **Card**: `rounded-lg border border-line bg-white p-6`
- **Button primary**: `bg-ink text-paper hover:bg-ink/90`
- **Button accent (saffron)**: `bg-saffron text-white hover:bg-saffron/90`
- **Eyebrow label**: `<div className="text-[11px] font-semibold uppercase tracking-widest text-mute">EYEBROW</div>`
- **Amount display**: `<div className="font-mono text-[32px] font-medium leading-none">₹1,50,000</div>`

---

## File Structure (locked)

```
rentSettle/
  package.json
  next.config.mjs
  tsconfig.json
  tailwind.config.ts
  postcss.config.mjs
  drizzle.config.ts
  components.json
  vitest.config.ts
  .gitignore
  app/
    layout.tsx
    globals.css
    page.tsx
    c/[caseId]/
      tenant/intake/page.tsx
      landlord/intake/page.tsx
      calc/page.tsx
      negotiate/page.tsx
      settle/page.tsx
    showcase/mediator/page.tsx
    api/
      reset/[caseId]/route.ts
      negotiate/[caseId]/auto-settle/route.ts
  components/
    ui/                              # shadcn primitives
    RoleBadge.tsx
    DeductionRow.tsx
    GapVisualizer.tsx
    OfferForm.tsx
    ScenarioCard.tsx
    RuleExplainer.tsx
    CitationTooltip.tsx
    ResetButton.tsx
    StageNav.tsx
    PdfSettlement.tsx
  lib/
    db/
      schema.ts
      client.ts
      seed.ts
      reset.ts
    rules/
      citations.ts
      painting.ts
      fixtures.ts
      utilities.ts
      unpaid-rent.ts
      cleaning.ts
      engine.ts
      types.ts
    negotiation/
      types.ts
      machine.ts
    scenarios/
      index.ts
      whitefield-2bhk.ts
      koramangala-1bhk.ts
      indiranagar-3bhk.ts
    actions/
      case.ts
      claim.ts
      negotiate.ts
    money.ts
    ids.ts
  tests/
    rules/
      painting.test.ts
      fixtures.test.ts
      utilities.test.ts
      unpaid-rent.test.ts
      cleaning.test.ts
      engine.test.ts
    negotiation/
      machine.test.ts
  docs/
    research/legal-research-synthesis.md
    superpowers/
      specs/2026-09-11-rentsettle-design.md
      plans/2026-09-11-rentsettle-implementation.md
  HACKATHON.md
  CLAUDE.md
```

---

## Phase A: Project foundation (T+0 to T+3h — Feature Zero)

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`

**Step 1: Init git and create package.json**

```bash
cd "C:/Users/haath/Desktop/Hackathon"
git init
```

Write `package.json`:
```json
{
  "name": "rentsettle",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "drizzle-kit push",
    "db:seed": "tsx lib/db/seed.ts",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "better-sqlite3": "^11.0.0",
    "drizzle-orm": "^0.33.0",
    "@react-pdf/renderer": "^3.4.4",
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.8",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "lucide-react": "^0.408.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/better-sqlite3": "^7.6.11",
    "@types/uuid": "^10.0.0",
    "typescript": "^5.5.3",
    "tailwindcss": "^3.4.6",
    "postcss": "^8.4.39",
    "autoprefixer": "^10.4.19",
    "drizzle-kit": "^0.24.0",
    "vitest": "^2.0.4",
    "tsx": "^4.16.2"
  }
}
```

**Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 3: Write `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  experimental: { serverActions: { bodySizeLimit: '2mb' } }
};
export default nextConfig;
```

**Step 4: Write `tailwind.config.ts`** (with design system tokens)

```ts
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F3',
        ink: '#0F1A2E',
        saffron: '#FF6B35',
        tenant: '#0E7C66',
        landlord: '#B85C00',
        mute: '#6B6358',
        line: '#E8E2D5'
      },
      fontFamily: {
        display: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace']
      },
      fontSize: {
        hero: ['56px', { lineHeight: '1.05', letterSpacing: '-0.02em' }]
      },
      maxWidth: { prose: '38rem', content: '52rem' },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'none' } },
        pulseSaffron: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,107,53,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(255,107,53,0)' } }
      },
      animation: {
        fadeIn: 'fadeIn 280ms ease-out both',
        pulseSaffron: 'pulseSaffron 1.2s ease-out 2'
      }
    }
  },
  plugins: []
};
export default config;
```

**Step 5: Write `postcss.config.mjs`**

```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

**Step 6: Write `.gitignore`**

```
node_modules
.next
out
dist
*.log
.DS_Store
data.db
data.db-journal
.env*.local
```

**Step 7: Write `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }

html, body {
  background: #FAF8F3;
  color: #0F1A2E;
  font-family: var(--font-inter), system-ui, sans-serif;
  font-feature-settings: "ss01", "cv11";
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: #FF6B35;
  color: #FAF8F3;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Step 8: Write `app/layout.tsx`** (with Google Fonts via next/font)

```tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Instrument_Serif } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], variable: '--font-instrument-serif', weight: '400', style: ['normal', 'italic'], display: 'swap' });

export const metadata: Metadata = {
  title: 'RentSettle · Resolve your deposit in minutes',
  description: 'A working deposit dispute resolution platform built on Karnataka law and Supreme Court precedent.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
```

**Step 9: Write minimal `app/page.tsx` (placeholder)**

```tsx
export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">RentSettle</h1>
      <p className="mt-2 text-slate-600">Initializing…</p>
    </main>
  );
}
```

**Step 10: Install dependencies**

Run: `cd "C:/Users/haath/Desktop/Hackathon" && npm install`
Expected: dependencies install without error.

**Step 11: Verify dev server starts**

Run: `npm run dev` (background, then kill after 5 seconds)
Expected: server starts on http://localhost:3000 without error.

**Step 12: Commit**

```bash
git add .
git commit -m "feat: project scaffold (Next.js 14, Tailwind, deps)"
```

---

### Task 2: Drizzle schema + database client

**Files:**
- Create: `lib/db/schema.ts`, `lib/db/client.ts`, `drizzle.config.ts`, `lib/money.ts`, `lib/ids.ts`

**Step 1: Write `lib/money.ts`**

```ts
// All currency in integer paise (₹1 = 100).
export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);
export const paiseToRupees = (paise: number): number => paise / 100;
export const formatRupees = (paise: number): string =>
  `₹${paiseToRupees(paise).toLocaleString('en-IN')}`;
```

**Step 2: Write `lib/ids.ts`**

```ts
import { v4 as uuid } from 'uuid';
export const newId = (): string => uuid();
```

**Step 3: Write `lib/db/schema.ts`**

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const cases = sqliteTable('cases', {
  id: text('id').primaryKey(),
  scenarioId: text('scenario_id').notNull(),
  tenantName: text('tenant_name').notNull(),
  landlordName: text('landlord_name').notNull(),
  propertyAddress: text('property_address').notNull(),
  monthlyRent: integer('monthly_rent').notNull(),     // paise
  depositAmount: integer('deposit_amount').notNull(),   // paise
  moveInDate: text('move_in_date').notNull(),
  moveOutDate: text('move_out_date').notNull(),
  status: text('status', { enum: ['intake', 'calc', 'negotiate', 'settled', 'escalated'] }).notNull().default('intake'),
  createdAt: text('created_at').notNull()
});

export const claims = sqliteTable('claims', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  category: text('category', { enum: ['painting', 'fixtures', 'utilities', 'unpaid_rent', 'cleaning'] }).notNull(),
  claimedBy: text('claimed_by', { enum: ['tenant', 'landlord'] }).notNull(),
  amountClaimed: integer('amount_claimed').notNull().default(0),
  evidenceJson: text('evidence_json').notNull().default('{}'),
  decision: text('decision', { enum: ['allow', 'deny', 'cap', 'pending'] }).notNull().default('pending'),
  amountAllowed: integer('amount_allowed').notNull().default(0),
  reasoning: text('reasoning').notNull().default(''),
  citedAuthority: text('cited_authority').notNull().default('')
});

export const negotiations = sqliteTable('negotiations', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  currentRound: integer('current_round').notNull().default(0),
  tenantOffer: integer('tenant_offer'),
  landlordOffer: integer('landlord_offer'),
  gapPercent: integer('gap_percent').notNull().default(0),  // basis points (500 = 5%)
  status: text('status', { enum: ['open', 'settled', 'escalated'] }).notNull().default('open'),
  settledAt: text('settled_at')
});

export const offers = sqliteTable('offers', {
  id: text('id').primaryKey(),
  caseId: text('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  roundNumber: integer('round_number').notNull(),
  byRole: text('by_role', { enum: ['tenant', 'landlord'] }).notNull(),
  amount: integer('amount').notNull(),
  timestamp: text('timestamp').notNull()
});

export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;
export type Claim = typeof claims.$inferSelect;
export type NewClaim = typeof claims.$inferInsert;
export type Negotiation = typeof negotiations.$inferSelect;
export type NewNegotiation = typeof negotiations.$inferInsert;
export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
```

**Step 4: Write `lib/db/client.ts`**

```ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('data.db');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export { schema };
```

**Step 5: Write `drizzle.config.ts`**

```ts
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: { url: 'data.db' }
});
```

**Step 6: Generate and push schema**

Run: `npx drizzle-kit push`
Expected: tables created in `data.db`.

**Step 7: Commit**

```bash
git add .
git commit -m "feat: Drizzle schema (cases, claims, negotiations, offers)"
```

---

### Task 3: Citations module (rule engine foundation)

**Files:**
- Create: `lib/rules/citations.ts`, `lib/rules/types.ts`

**Step 1: Write `lib/rules/types.ts`**

```ts
export type DeductionCategory = 'painting' | 'fixtures' | 'utilities' | 'unpaid_rent' | 'cleaning';

export type ClaimInput = {
  category: DeductionCategory;
  claimedBy: 'tenant' | 'landlord';
  amountClaimed: number;          // paise
  hasEvidence?: boolean;
  description?: string;
};

export type ClaimDecision = {
  category: DeductionCategory;
  decision: 'allow' | 'deny' | 'cap';
  amountAllowed: number;          // paise
  reasoning: string;              // human-readable
  citedAuthority: string;         // for tooltip
};
```

**Step 2: Write `lib/rules/citations.ts`** (verbatim text from `docs/research/legal-research-synthesis.md`)

```ts
export const CITATIONS = {
  tpa_108m: {
    short: 'Transfer of Property Act, 1882 §108(m)',
    full: 'The lessee is bound to put the lessor into possession of the property at the termination of the lease, in as good condition as it was when he took it, reasonable wear and tear excepted, and to repair all damage caused by his negligence or that of persons employed by him.'
  },
  ka_rent_47: {
    short: 'Karnataka Rent Act, 1999 §47',
    full: 'Every landlord shall be bound to keep the premises let to a tenant in good and tenantable condition. The landlord shall carry out structural repairs specified in Part A of the Fifth Schedule.'
  },
  ka_rent_48a: {
    short: 'Karnataka Rent Act, 1999 §48(a)',
    full: 'A tenant shall be bound to pay the rent and other charges due from him to the landlord in accordance with the terms and conditions of the agreement.'
  },
  ka_rent_48b: {
    short: 'Karnataka Rent Act, 1999 §48(b)',
    full: 'A tenant shall be bound to maintain the premises in good and clean condition and not to cause any damage to the premises.'
  },
  ka_rent_48d: {
    short: 'Karnataka Rent Act, 1999 §48(d)',
    full: 'A tenant shall be bound to carry out the day to day repairs specified in Part B of the Fifth Schedule at his own cost.'
  },
  mta_11_advisory: {
    short: 'Model Tenancy Act, 2021 §11(2) (advisory — Karnataka has not adopted)',
    full: 'The security deposit shall be refunded by the landlord to the tenant at the time of taking over vacant possession of the premises, after making due deductions.'
  },
  sc_fateh_chand: {
    short: 'Fateh Chand v. Balkishan Dass (AIR 1963 SC 1405)',
    full: 'Compensation for breach of contract cannot be awarded arbitrarily and must correspond to the actual loss suffered.'
  },
  sc_maula_bux: {
    short: 'Maula Bux v. Union of India (AIR 1970 SC 1955)',
    full: 'Damages must reflect genuine, demonstrable loss — not assumptions or assertions.'
  },
  sc_kamal_kumar: {
    short: 'Kamal Kumar v. Premlata Joshi',
    full: 'Deductions from a security deposit require evidentiary support; mere assertions by the landlord are insufficient.'
  },
  industry_10pct: {
    short: 'Industry standard (Karnataka rental agreements)',
    full: '10% annual depreciation on fixtures is a common contractual convention in Karnataka rental agreements. It is NOT a statutory cap and depends on the specific agreement.'
  }
} as const;

export type CitationKey = keyof typeof CITATIONS;
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: rule engine citations module (verified law + case law)"
```

---

### Task 4: Rule engine — painting

**Files:**
- Create: `lib/rules/painting.ts`, `tests/rules/painting.test.ts`
- Create: `vitest.config.ts`

**Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } }
});
```

**Step 2: Write failing test `tests/rules/painting.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { decidePainting } from '@/lib/rules/painting';
import { rupeesToPaise } from '@/lib/money';

describe('decidePainting', () => {
  it('denies claim when no damage evidence (normal wear-and-tear)', () => {
    const result = decidePainting({
      category: 'painting',
      claimedBy: 'landlord',
      amountClaimed: rupeesToPaise(35000),
      hasEvidence: false,
      description: 'Full repaint on move-out'
    });
    expect(result.decision).toBe('deny');
    expect(result.amountAllowed).toBe(0);
    expect(result.citedAuthority).toContain('§108(m)');
    expect(result.citedAuthority).toContain('§47');
  });

  it('allows full claim when damage evidence is provided', () => {
    const result = decidePainting({
      category: 'painting',
      claimedBy: 'landlord',
      amountClaimed: rupeesToPaise(35000),
      hasEvidence: true,
      description: 'Graffiti on 3 walls, tenant-caused'
    });
    expect(result.decision).toBe('allow');
    expect(result.amountAllowed).toBe(rupeesToPaise(35000));
  });
});
```

**Step 3: Run test, verify failure**

Run: `npm test -- painting`
Expected: FAIL (module not found)

**Step 4: Implement `lib/rules/painting.ts`**

```ts
import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

export function decidePainting(input: ClaimInput): ClaimDecision {
  const authority = [CITATIONS.tpa_108m.short, CITATIONS.ka_rent_47.short, CITATIONS.ka_rent_48d.short].join('; ');

  if (input.hasEvidence) {
    return {
      category: 'painting',
      decision: 'allow',
      amountAllowed: input.amountClaimed,
      reasoning: 'Damage beyond normal wear-and-tear with evidence — landlord claim allowed.',
      citedAuthority: authority
    };
  }

  return {
    category: 'painting',
    decision: 'deny',
    amountAllowed: 0,
    reasoning: 'No evidence of damage beyond normal wear-and-tear. Periodic repainting is structural maintenance, the landlord\'s duty under Karnataka Rent Act §47.',
    citedAuthority: authority
  };
}
```

**Step 5: Run test, verify pass**

Run: `npm test -- painting`
Expected: PASS (2 tests)

**Step 6: Commit**

```bash
git add .
git commit -m "feat: rule engine — painting (TPA §108(m) + KA Rent §47, §48(d))"
```

---

### Task 5: Rule engine — fixtures, utilities, unpaid rent, cleaning + orchestrator

**Files:**
- Create: `lib/rules/fixtures.ts`, `lib/rules/utilities.ts`, `lib/rules/unpaid-rent.ts`, `lib/rules/cleaning.ts`, `lib/rules/engine.ts`
- Create: `tests/rules/fixtures.test.ts`, `tests/rules/utilities.test.ts`, `tests/rules/unpaid-rent.test.ts`, `tests/rules/cleaning.test.ts`, `tests/rules/engine.test.ts`

**Step 1: Write `lib/rules/fixtures.ts`**

```ts
import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

// Industry-standard 10% annual depreciation cap.
// NOT statutory — must be labelled as industry standard in tooltips.
const ANNUAL_DEPRECIATION_PCT = 10;
const TYPICAL_USEFUL_LIFE_YEARS = 10;
const MAX_DEPRECIATION_PCT = 90; // never depreciate below 10% of original

export function decideFixtures(input: ClaimInput, _ctx: { yearsOfTenancy: number; originalCostPaise: number }): ClaimDecision {
  const authority = [CITATIONS.tpa_108m.short, CITATIONS.sc_fateh_chand.short, CITATIONS.industry_10pct.short].join('; ');

  if (!input.hasEvidence) {
    return {
      category: 'fixtures',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'No evidence of damage or itemised bills. Bare assertion insufficient per Kamal Kumar v. Premlata Joshi.',
      citedAuthority: authority
    };
  }

  // Cap using industry-standard 10% per year depreciation, but never more than claimed.
  const annualDepreciation = Math.floor((_ctx.originalCostPaise * ANNUAL_DEPRECIATION_PCT) / 100);
  const totalDepreciation = Math.min(annualDepreciation * _ctx.yearsOfTenancy, _ctx.originalCostPaise * MAX_DEPRECIATION_PCT / 100);
  const capped = Math.min(input.amountClaimed, Math.floor(totalDepreciation));

  if (capped === 0) {
    return {
      category: 'fixtures',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'Fixtures fully depreciated under industry-standard 10% per year convention over the tenancy period.',
      citedAuthority: authority
    };
  }

  if (capped < input.amountClaimed) {
    return {
      category: 'fixtures',
      decision: 'cap',
      amountAllowed: capped,
      reasoning: `Claim capped at industry-standard depreciation (10% per year × ${_ctx.yearsOfTenancy} years of ${TYPICAL_USEFUL_LIFE_YEARS}-year useful life).`,
      citedAuthority: authority
    };
  }

  return {
    category: 'fixtures',
    decision: 'allow',
    amountAllowed: input.amountClaimed,
    reasoning: 'Within industry-standard depreciation cap.',
    citedAuthority: authority
  };
}
```

**Step 2: Write `lib/rules/utilities.ts`**

```ts
import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

export function decideUtilities(input: ClaimInput): ClaimDecision {
  const authority = [CITATIONS.ka_rent_48a.short, CITATIONS.sc_maula_bux.short].join('; ');

  if (!input.hasEvidence) {
    return {
      category: 'utilities',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'Utility deductions require submitted proof of unpaid bills (Maula Bux v. Union of India). Bare claim denied.',
      citedAuthority: authority
    };
  }

  return {
    category: 'utilities',
    decision: 'allow',
    amountAllowed: input.amountClaimed,
    reasoning: 'Utility deduction supported by submitted bill receipts.',
    citedAuthority: authority
  };
}
```

**Step 3: Write `lib/rules/unpaid-rent.ts`**

```ts
import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

export function decideUnpaidRent(input: ClaimInput, _ctx: { monthlyRentPaise: number; claimedMonths: number }): ClaimDecision {
  const authority = CITATIONS.ka_rent_48a.short;

  if (_ctx.claimedMonths <= 0) {
    return {
      category: 'unpaid_rent',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'No unpaid rent claimed.',
      citedAuthority: authority
    };
  }

  if (!input.hasEvidence) {
    return {
      category: 'unpaid_rent',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'Unpaid rent claim requires evidence of arrears (rent receipts, notice).',
      citedAuthority: authority
    };
  }

  const amountAllowed = _ctx.monthlyRentPaise * _ctx.claimedMonths;
  return {
    category: 'unpaid_rent',
    decision: 'allow',
    amountAllowed,
    reasoning: `${_ctx.claimedMonths} months × ${(_ctx.monthlyRentPaise / 100).toLocaleString('en-IN')} = strict arithmetic per Karnataka Rent Act §48(a).`,
    citedAuthority: authority
  };
}
```

**Step 4: Write `lib/rules/cleaning.ts`**

```ts
import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

export function decideCleaning(input: ClaimInput): ClaimDecision {
  const authority = [CITATIONS.tpa_108m.short, CITATIONS.ka_rent_48d.short].join('; ');

  // Only allow if extreme damage (e.g., pest infestation from tenant actions).
  // For MVP demo: deny by default.
  return {
    category: 'cleaning',
    decision: 'deny',
    amountAllowed: 0,
    reasoning: 'Routine cleaning is normal end-of-tenancy hygiene, not damage (TPA §108(m) reasonable wear exception; Karnataka Rent Act §48(d) limits tenant to day-to-day repairs).',
    citedAuthority: authority
  };
}
```

**Step 5: Write `lib/rules/engine.ts`**

```ts
import type { ClaimInput, ClaimDecision, DeductionCategory } from './types';
import { decidePainting } from './painting';
import { decideFixtures } from './fixtures';
import { decideUtilities } from './utilities';
import { decideUnpaidRent } from './unpaid-rent';
import { decideCleaning } from './cleaning';

export type RuleContext = {
  yearsOfTenancy: number;
  monthlyRentPaise: number;
  fixtureOriginalCostPaise: number;
  unpaidRentMonthsClaimed: number;
};

export function runRuleEngine(input: ClaimInput, category: DeductionCategory, ctx: RuleContext): ClaimDecision {
  switch (category) {
    case 'painting': return decidePainting(input);
    case 'fixtures': return decideFixtures(input, { yearsOfTenancy: ctx.yearsOfTenancy, originalCostPaise: ctx.fixtureOriginalCostPaise });
    case 'utilities': return decideUtilities(input);
    case 'unpaid_rent': return decideUnpaidRent(input, { monthlyRentPaise: ctx.monthlyRentPaise, claimedMonths: ctx.unpaidRentMonthsClaimed });
    case 'cleaning': return decideCleaning(input);
  }
}

export function runAll(claims: ClaimInput[], ctx: RuleContext): ClaimDecision[] {
  return claims.map(c => runRuleEngine(c, c.category, ctx));
}
```

**Step 6: Write all four test files** (one per rule, 2 cases each)

`tests/rules/fixtures.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { decideFixtures } from '@/lib/rules/fixtures';
import { rupeesToPaise } from '@/lib/money';

describe('decideFixtures', () => {
  it('denies without evidence', () => {
    const r = decideFixtures({ category: 'fixtures', claimedBy: 'landlord', amountClaimed: rupeesToPaise(18000), hasEvidence: false }, { yearsOfTenancy: 2, originalCostPaise: rupeesToPaise(30000) });
    expect(r.decision).toBe('deny');
  });

  it('caps at 10% per year depreciation over 2 years (max 20% of ₹30,000 = ₹6,000)', () => {
    const r = decideFixtures({ category: 'fixtures', claimedBy: 'landlord', amountClaimed: rupeesToPaise(18000), hasEvidence: true }, { yearsOfTenancy: 2, originalCostPaise: rupeesToPaise(30000) });
    expect(r.decision).toBe('cap');
    expect(r.amountAllowed).toBe(rupeesToPaise(6000)); // 20% of 30000
  });

  it('returns industry-standard citation', () => {
    const r = decideFixtures({ category: 'fixtures', claimedBy: 'landlord', amountClaimed: rupeesToPaise(1000), hasEvidence: true }, { yearsOfTenancy: 1, originalCostPaise: rupeesToPaise(5000) });
    expect(r.citedAuthority).toContain('Industry standard');
  });
});
```

`tests/rules/utilities.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { decideUtilities } from '@/lib/rules/utilities';
import { rupeesToPaise } from '@/lib/money';

describe('decideUtilities', () => {
  it('denies without proof', () => {
    const r = decideUtilities({ category: 'utilities', claimedBy: 'landlord', amountClaimed: rupeesToPaise(4500), hasEvidence: false });
    expect(r.decision).toBe('deny');
    expect(r.amountAllowed).toBe(0);
  });

  it('allows with proof', () => {
    const r = decideUtilities({ category: 'utilities', claimedBy: 'landlord', amountClaimed: rupeesToPaise(4500), hasEvidence: true });
    expect(r.decision).toBe('allow');
    expect(r.amountAllowed).toBe(rupeesToPaise(4500));
  });
});
```

`tests/rules/unpaid-rent.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { decideUnpaidRent } from '@/lib/rules/unpaid-rent';
import { rupeesToPaise } from '@/lib/money';

describe('decideUnpaidRent', () => {
  it('denies when 0 months claimed', () => {
    const r = decideUnpaidRent({ category: 'unpaid_rent', claimedBy: 'landlord', amountClaimed: 0, hasEvidence: false }, { monthlyRentPaise: rupeesToPaise(25000), claimedMonths: 0 });
    expect(r.decision).toBe('deny');
  });

  it('allows strict arithmetic 2 months × ₹25,000 = ₹50,000', () => {
    const r = decideUnpaidRent({ category: 'unpaid_rent', claimedBy: 'landlord', amountClaimed: rupeesToPaise(50000), hasEvidence: true }, { monthlyRentPaise: rupeesToPaise(25000), claimedMonths: 2 });
    expect(r.decision).toBe('allow');
    expect(r.amountAllowed).toBe(rupeesToPaise(50000));
  });
});
```

`tests/rules/cleaning.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { decideCleaning } from '@/lib/rules/cleaning';
import { rupeesToPaise } from '@/lib/money';

describe('decideCleaning', () => {
  it('always denies (default MVP behavior)', () => {
    const r = decideCleaning({ category: 'cleaning', claimedBy: 'landlord', amountClaimed: rupeesToPaise(12000), hasEvidence: true });
    expect(r.decision).toBe('deny');
    expect(r.amountAllowed).toBe(0);
  });
});
```

`tests/rules/engine.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runRuleEngine, runAll } from '@/lib/rules/engine';
import { rupeesToPaise } from '@/lib/money';

const ctx = { yearsOfTenancy: 2, monthlyRentPaise: rupeesToPaise(25000), fixtureOriginalCostPaise: rupeesToPaise(30000), unpaidRentMonthsClaimed: 0 };

describe('runRuleEngine', () => {
  it('routes painting to decidePainting', () => {
    const r = runRuleEngine({ category: 'painting', claimedBy: 'landlord', amountClaimed: rupeesToPaise(35000), hasEvidence: false }, 'painting', ctx);
    expect(r.decision).toBe('deny');
  });

  it('routes cleaning to decideCleaning', () => {
    const r = runRuleEngine({ category: 'cleaning', claimedBy: 'landlord', amountClaimed: rupeesToPaise(12000), hasEvidence: true }, 'cleaning', ctx);
    expect(r.decision).toBe('deny');
  });
});

describe('runAll', () => {
  it('handles 5 claims at once', () => {
    const claims = [
      { category: 'painting' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(35000), hasEvidence: false },
      { category: 'fixtures' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(18000), hasEvidence: true },
      { category: 'utilities' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(4500), hasEvidence: true },
      { category: 'unpaid_rent' as const, claimedBy: 'landlord' as const, amountClaimed: 0, hasEvidence: false },
      { category: 'cleaning' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(12000), hasEvidence: true }
    ];
    const decisions = runAll(claims, ctx);
    expect(decisions).toHaveLength(5);
    expect(decisions[0].decision).toBe('deny');
    expect(decisions[1].decision).toBe('cap');
    expect(decisions[2].decision).toBe('allow');
    expect(decisions[3].decision).toBe('deny');
    expect(decisions[4].decision).toBe('deny');
  });
});
```

**Step 7: Run all rule tests, verify pass**

Run: `npm test -- rules`
Expected: ALL PASS

**Step 8: Commit**

```bash
git add .
git commit -m "feat: rule engine — fixtures, utilities, unpaid rent, cleaning, orchestrator"
```

---

## Phase B: Scenarios + state machine (T+3h to T+7h)

### Task 6: Pre-loaded scenarios

**Files:**
- Create: `lib/scenarios/whitefield-2bhk.ts`, `lib/scenarios/koramangala-1bhk.ts`, `lib/scenarios/indiranagar-3bhk.ts`, `lib/scenarios/index.ts`

**Step 1: Write `lib/scenarios/whitefield-2bhk.ts`** (primary demo)

```ts
import type { ClaimInput } from '@/lib/rules/types';
import { rupeesToPaise } from '@/lib/money';

export const whitefield2BHK = {
  id: 'whitefield-2bhk',
  displayName: 'Whitefield 2BHK — Priya vs Rajesh',
  tagline: '₹2,00,000 deposit · 24 months · Painting + tap dispute',
  case: {
    tenantName: 'Priya Sharma',
    landlordName: 'Rajesh Iyer',
    propertyAddress: 'Prestige Shantiniketan, Whitefield, Bangalore — Tower 4, Flat 1207',
    monthlyRent: rupeesToPaise(25000),
    depositAmount: rupeesToPaise(200000),
    moveInDate: '2024-08-01',
    moveOutDate: '2026-08-01'
  },
  // Landlord's claims (deductions being made)
  landlordClaims: [
    { category: 'painting' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(35000), hasEvidence: false, description: 'Full repaint after 24 months' },
    { category: 'fixtures' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(18000), hasEvidence: true, description: 'New geyser + cracked basin replacement' },
    { category: 'utilities' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(4500), hasEvidence: true, description: 'Last 3 months electricity unpaid' },
    { category: 'unpaid_rent' as const, claimedBy: 'landlord' as const, amountClaimed: 0, hasEvidence: false, description: 'N/A' },
    { category: 'cleaning' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(12000), hasEvidence: false, description: 'Deep cleaning service' }
  ],
  // Tenant's counter-version
  tenantClaims: [
    { category: 'painting' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'No damage — normal aging. Walls were freshly painted at move-in.' },
    { category: 'fixtures' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Geyser was 8 years old at move-in; basin pre-existing crack' },
    { category: 'utilities' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'All bills paid via UPI — receipts attached' },
    { category: 'unpaid_rent' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'All rent paid' },
    { category: 'cleaning' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Routine cleaning is normal end-of-tenancy hygiene' }
  ],
  // Rule engine context
  ruleContext: { yearsOfTenancy: 2, monthlyRentPaise: rupeesToPaise(25000), fixtureOriginalCostPaise: rupeesToPaise(30000), unpaidRentMonthsClaimed: 0 },
  // Pre-loaded negotiation scripted to auto-settle by round 2
  negotiationScript: {
    initial: {
      tenantOffer: rupeesToPaise(55000),    // tenant's bottom line
      landlordOffer: rupeesToPaise(45000)    // landlord's bottom line
    },
    round2Adjustment: {
      tenantOffer: rupeesToPaise(52000),
      landlordOffer: rupeesToPaise(50000)    // gap = ₹2,000 / ₹2,00,000 = 1% — auto-settles
    }
  }
};
```

**Step 2: Write Koramangala 1BHK and Indiranagar 3BHK** (similar structure, different data)

`lib/scenarios/koramangala-1bhk.ts`:
```ts
import type { ClaimInput } from '@/lib/rules/types';
import { rupeesToPaise } from '@/lib/money';

export const koramangala1BHK = {
  id: 'koramangala-1bhk',
  displayName: 'Koramangala 1BHK — Amit vs Sunita',
  tagline: '₹90,000 deposit · 18 months · Real damage',
  case: {
    tenantName: 'Amit Verma',
    landlordName: 'Sunita Reddy',
    propertyAddress: '5th Block, Koramangala, Bangalore — 2nd Floor, No. 412',
    monthlyRent: rupeesToPaise(18000),
    depositAmount: rupeesToPaise(90000),
    moveInDate: '2024-12-01',
    moveOutDate: '2026-06-01'
  },
  landlordClaims: [
    { category: 'painting' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(15000), hasEvidence: true, description: 'Tenant-caused stains and a cigarette burn on living room wall' },
    { category: 'fixtures' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(8000), hasEvidence: true, description: 'Broken wardrobe handle + missing curtain rod' },
    { category: 'utilities' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(2200), hasEvidence: false, description: 'Last 2 months electricity (no receipts)' },
    { category: 'unpaid_rent' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(18000), hasEvidence: true, description: '1 month unpaid (final month)' },
    { category: 'cleaning' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(6000), hasEvidence: false, description: 'Deep cleaning' }
  ],
  tenantClaims: [
    { category: 'painting' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Stain was pre-existing; cigarette burn is true, accept partial' },
    { category: 'fixtures' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Accept partial — items old' },
    { category: 'utilities' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'All paid, will provide UPI records' },
    { category: 'unpaid_rent' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Dispute — paid via cash to landlord\'s brother' },
    { category: 'cleaning' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Routine cleaning denied' }
  ],
  ruleContext: { yearsOfTenancy: 1.5, monthlyRentPaise: rupeesToPaise(18000), fixtureOriginalCostPaise: rupeesToPaise(15000), unpaidRentMonthsClaimed: 1 },
  negotiationScript: {
    initial: { tenantOffer: rupeesToPaise(18000), landlordOffer: rupeesToPaise(15000) },
    round2Adjustment: { tenantOffer: rupeesToPaise(17000), landlordOffer: rupeesToPaise(16500) }
  }
};
```

`lib/scenarios/indiranagar-3bhk.ts`:
```ts
import { rupeesToPaise } from '@/lib/money';

export const indiranagar3BHK = {
  id: 'indiranagar-3bhk',
  displayName: 'Indiranagar 3BHK — Sneha & Karthik vs Farooq',
  tagline: '₹4,50,000 deposit · 36 months · High-value dispute',
  case: {
    tenantName: 'Sneha Iyer',
    landlordName: 'Mohammed Farooq',
    propertyAddress: '12th Main, Indiranagar, Bangalore — Independent House, Ground Floor',
    monthlyRent: rupeesToPaise(45000),
    depositAmount: rupeesToPaise(450000),
    moveInDate: '2023-09-01',
    moveOutDate: '2026-09-01'
  },
  landlordClaims: [
    { category: 'painting' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(60000), hasEvidence: false, description: 'Full repaint of all rooms after 3 years' },
    { category: 'fixtures' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(45000), hasEvidence: true, description: 'AC servicing + broken exhaust fan + cracked tile' },
    { category: 'utilities' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(8500), hasEvidence: false, description: 'Water bills (no proof)' },
    { category: 'unpaid_rent' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(90000), hasEvidence: true, description: '2 months unpaid during COVID hardship (with notice)' },
    { category: 'cleaning' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(18000), hasEvidence: true, description: 'Pest control service (cockroach infestation from kitchen grease)' }
  ],
  tenantClaims: [
    { category: 'painting' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Normal aging' },
    { category: 'fixtures' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Accept exhaust fan and tile; dispute AC servicing (pre-existing)' },
    { category: 'utilities' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'All paid via online portal' },
    { category: 'unpaid_rent' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Dispute — disputed notice validity' },
    { category: 'cleaning' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Accept pest control (kitchen grease was tenant issue)' }
  ],
  ruleContext: { yearsOfTenancy: 3, monthlyRentPaise: rupeesToPaise(45000), fixtureOriginalCostPaise: rupeesToPaise(80000), unpaidRentMonthsClaimed: 2 },
  negotiationScript: {
    initial: { tenantOffer: rupeesToPaise(45000), landlordOffer: rupeesToPaise(35000) },
    round2Adjustment: { tenantOffer: rupeesToPaise(42000), landlordOffer: rupeesToPaise(40000) }
  }
};
```

**Step 3: Write `lib/scenarios/index.ts`**

```ts
import { whitefield2BHK } from './whitefield-2bhk';
import { koramangala1BHK } from './koramangala-1bhk';
import { indiranagar3BHK } from './indiranagar-3bhk';

export const SCENARIOS = [whitefield2BHK, koramangala1BHK, indiranagar3BHK] as const;

export type ScenarioId = typeof SCENARIOS[number]['id'];

export function getScenario(id: ScenarioId) {
  const s = SCENARIOS.find(x => x.id === id);
  if (!s) throw new Error(`Unknown scenario: ${id}`);
  return s;
}
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: 3 pre-loaded scenarios (Whitefield, Koramangala, Indiranagar)"
```

---

### Task 7: Seed script

**Files:**
- Create: `lib/db/seed.ts`

**Step 1: Write `lib/db/seed.ts`**

```ts
import { db } from './client';
import { cases, claims, negotiations } from './schema';
import { SCENARIOS, getScenario } from '@/lib/scenarios';
import { newId } from '@/lib/ids';

async function seedOne(scenarioId: string) {
  const s = getScenario(scenarioId as any);
  const caseId = newId();
  const now = new Date().toISOString();

  db.insert(cases).values({
    id: caseId,
    scenarioId: s.id,
    tenantName: s.case.tenantName,
    landlordName: s.case.landlordName,
    propertyAddress: s.case.propertyAddress,
    monthlyRent: s.case.monthlyRent,
    depositAmount: s.case.depositAmount,
    moveInDate: s.case.moveInDate,
    moveOutDate: s.case.moveOutDate,
    status: 'intake',
    createdAt: now
  }).run();

  for (const c of [...s.landlordClaims, ...s.tenantClaims]) {
    db.insert(claims).values({
      id: newId(),
      caseId,
      category: c.category,
      claimedBy: c.claimedBy,
      amountClaimed: c.amountClaimed,
      evidenceJson: JSON.stringify({ description: c.description, hasEvidence: c.hasEvidence }),
      decision: 'pending',
      amountAllowed: 0,
      reasoning: '',
      citedAuthority: ''
    }).run();
  }

  db.insert(negotiations).values({
    id: newId(),
    caseId,
    currentRound: 0,
    tenantOffer: null,
    landlordOffer: null,
    gapPercent: 0,
    status: 'open',
    settledAt: null
  }).run();

  return caseId;
}

export async function seedAll() {
  const ids: Record<string, string> = {};
  for (const s of SCENARIOS) {
    ids[s.id] = await seedOne(s.id);
  }
  return ids;
}

if (require.main === module) {
  // Clear all data
  db.delete(negotiations).run();
  db.delete(claims).run();
  db.delete(cases).run();
  seedAll().then(ids => {
    console.log('Seeded cases:', ids);
    process.exit(0);
  });
}
```

**Step 2: Run seed**

Run: `npm run db:seed`
Expected: `Seeded cases: { 'whitefield-2bhk': '...', 'koramangala-1bhk': '...', 'indiranagar-3bhk': '...' }`

**Step 3: Commit**

```bash
git add .
git commit -m "feat: seed script — creates 3 demo cases with claims"
```

---

### Task 8: Negotiation state machine

**Files:**
- Create: `lib/negotiation/types.ts`, `lib/negotiation/machine.ts`, `tests/negotiation/machine.test.ts`

**Step 1: Write `lib/negotiation/types.ts`**

```ts
export type NegotiationState = {
  currentRound: number;            // 0 = before any offer, 1..3 = in progress
  tenantOffer: number | null;     // paise
  landlordOffer: number | null;   // paise
  status: 'open' | 'settled' | 'escalated';
};

export type NegotiationAction =
  | { type: 'SUBMIT_OFFER'; by: 'tenant' | 'landlord'; amount: number }
  | { type: 'RESET' };

export const MAX_ROUNDS = 3;
export const AUTO_SETTLE_THRESHOLD_BPS = 500; // 5% in basis points (5_00)
export const DEPOSIT_BPS_DENOMINATOR = 10000;

export function computeGapPercent(tenantOffer: number, landlordOffer: number, depositAmount: number): number {
  const gap = Math.abs(tenantOffer - landlordOffer);
  return Math.floor((gap * DEPOSIT_BPS_DENOMINATOR) / depositAmount);
}

export function shouldAutoSettle(gapBps: number): boolean {
  return gapBps <= AUTO_SETTLE_THRESHOLD_BPS;
}
```

**Step 2: Write failing tests `tests/negotiation/machine.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { negotiationReducer, initialNegotiation } from '@/lib/negotiation/machine';
import { computeGapPercent, shouldAutoSettle } from '@/lib/negotiation/types';

describe('computeGapPercent', () => {
  it('returns 0 when both offers match', () => {
    expect(computeGapPercent(50000, 50000, 200000)).toBe(0);
  });

  it('returns 500 (5%) when gap is ₹10,000 on ₹2L deposit', () => {
    expect(computeGapPercent(55000, 45000, 200000)).toBe(500);
  });
});

describe('shouldAutoSettle', () => {
  it('settles at exactly 5%', () => {
    expect(shouldAutoSettle(500)).toBe(true);
  });

  it('does not settle at 5.01%', () => {
    expect(shouldAutoSettle(501)).toBe(false);
  });
});

describe('negotiationReducer', () => {
  it('records first offer and enters round 1', () => {
    const s = negotiationReducer(initialNegotiation(), { type: 'SUBMIT_OFFER', by: 'tenant', amount: 55000 });
    expect(s.tenantOffer).toBe(55000);
    expect(s.currentRound).toBe(1);
  });

  it('auto-settles when both offers within 5%', () => {
    let s = negotiationReducer(initialNegotiation(), { type: 'SUBMIT_OFFER', by: 'tenant', amount: 52000 });
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'landlord', amount: 50000 });
    expect(s.status).toBe('settled');
  });

  it('escalates after 3 rounds with gap > 5%', () => {
    // Round 1
    let s = negotiationReducer(initialNegotiation(), { type: 'SUBMIT_OFFER', by: 'tenant', amount: 60000 });
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'landlord', amount: 40000 });
    expect(s.currentRound).toBe(2);
    // Round 2
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'tenant', amount: 60000 });
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'landlord', amount: 40000 });
    expect(s.currentRound).toBe(3);
    // Round 3 — gap still > 5%, no more rounds, escalate
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'tenant', amount: 60000 });
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'landlord', amount: 40000 });
    expect(s.status).toBe('escalated');
  });
});
```

**Step 3: Implement `lib/negotiation/machine.ts`**

```ts
import { NegotiationState, NegotiationAction, MAX_ROUNDS, computeGapPercent, shouldAutoSettle } from './types';

export const initialNegotiation = (): NegotiationState => ({
  currentRound: 0,
  tenantOffer: null,
  landlordOffer: null,
  status: 'open'
});

export function negotiationReducer(state: NegotiationState, action: NegotiationAction, depositAmount: number = 200000): NegotiationState {
  switch (action.type) {
    case 'RESET': return initialNegotiation();

    case 'SUBMIT_OFFER': {
      if (state.status !== 'open') return state;

      const next: NegotiationState = { ...state };
      if (action.by === 'tenant') next.tenantOffer = action.amount;
      else next.landlordOffer = action.amount;

      // First submission ever: enter round 1.
      if (state.currentRound === 0) {
        next.currentRound = 1;
      }

      // Both offers present in current round → check auto-settle, then advance.
      if (next.tenantOffer != null && next.landlordOffer != null) {
        const gapBps = computeGapPercent(next.tenantOffer, next.landlordOffer, depositAmount);
        if (shouldAutoSettle(gapBps)) {
          return { ...next, status: 'settled' };
        }
        // Both sides have offered this round without settling.
        if (state.currentRound >= MAX_ROUNDS) {
          return { ...next, status: 'escalated' };
        }
        next.currentRound = state.currentRound + 1;
      }

      return next;
    }
  }
}
```

**Step 4: Run tests, verify pass**

Run: `npm test -- negotiation`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add .
git commit -m "feat: negotiation state machine (3 rounds, auto-settle at 5%)"
```

---

## Phase C: Server actions + portals + calc (T+7h to T+11h)

### Task 9: Server actions — case, claim, negotiate

**Files:**
- Create: `lib/actions/case.ts`, `lib/actions/claim.ts`, `lib/actions/negotiate.ts`, `lib/db/reset.ts`

**Step 1: Write `lib/db/reset.ts`**

```ts
import { db } from './client';
import { cases, claims, negotiations, offers } from './schema';
import { eq } from 'drizzle-orm';
import { getScenario } from '@/lib/scenarios';
import { newId } from '@/lib/ids';

export function resetCase(caseId: string): string {
  const caseRow = db.select().from(cases).where(eq(cases.id, caseId)).get();
  if (!caseRow) throw new Error(`Case not found: ${caseId}`);

  const scenario = getScenario(caseRow.scenarioId as any);
  const now = new Date().toISOString();

  // Wipe related rows
  db.delete(offers).where(eq(offers.caseId, caseId)).run();
  db.delete(negotiations).where(eq(negotiations.caseId, caseId)).run();
  db.delete(claims).where(eq(claims.caseId, caseId)).run();

  // Re-seed claims
  for (const c of [...scenario.landlordClaims, ...scenario.tenantClaims]) {
    db.insert(claims).values({
      id: newId(),
      caseId,
      category: c.category,
      claimedBy: c.claimedBy,
      amountClaimed: c.amountClaimed,
      evidenceJson: JSON.stringify({ description: c.description, hasEvidence: c.hasEvidence }),
      decision: 'pending',
      amountAllowed: 0,
      reasoning: '',
      citedAuthority: ''
    }).run();
  }

  // Re-seed negotiation
  db.insert(negotiations).values({
    id: newId(),
    caseId,
    currentRound: 0,
    tenantOffer: null,
    landlordOffer: null,
    gapPercent: 0,
    status: 'open',
    settledAt: null
  }).run();

  db.update(cases).set({ status: 'intake' }).where(eq(cases.id, caseId)).run();

  return caseId;
}
```

**Step 2: Write `lib/actions/case.ts`**

```ts
'use server';
import { db } from '@/lib/db/client';
import { cases, claims, negotiations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getScenario, ScenarioId, SCENARIOS } from '@/lib/scenarios';
import { resetCase } from '@/lib/db/reset';
import { newId } from '@/lib/ids';

export async function createCaseAction(scenarioId: ScenarioId): Promise<string> {
  const scenario = getScenario(scenarioId);
  const caseId = newId();
  const now = new Date().toISOString();

  db.insert(cases).values({
    id: caseId,
    scenarioId,
    tenantName: scenario.case.tenantName,
    landlordName: scenario.case.landlordName,
    propertyAddress: scenario.case.propertyAddress,
    monthlyRent: scenario.case.monthlyRent,
    depositAmount: scenario.case.depositAmount,
    moveInDate: scenario.case.moveInDate,
    moveOutDate: scenario.case.moveOutDate,
    status: 'intake',
    createdAt: now
  }).run();

  for (const c of [...scenario.landlordClaims, ...scenario.tenantClaims]) {
    db.insert(claims).values({
      id: newId(),
      caseId,
      category: c.category,
      claimedBy: c.claimedBy,
      amountClaimed: c.amountClaimed,
      evidenceJson: JSON.stringify({ description: c.description, hasEvidence: c.hasEvidence }),
      decision: 'pending',
      amountAllowed: 0,
      reasoning: '',
      citedAuthority: ''
    }).run();
  }

  db.insert(negotiations).values({
    id: newId(),
    caseId,
    currentRound: 0,
    tenantOffer: null,
    landlordOffer: null,
    gapPercent: 0,
    status: 'open',
    settledAt: null
  }).run();

  return caseId;
}

export async function loadCaseAction(caseId: string) {
  const c = db.select().from(cases).where(eq(cases.id, caseId)).get();
  if (!c) throw new Error(`Case not found: ${caseId}`);
  return c;
}

export async function resetCaseAction(caseId: string): Promise<string> {
  return resetCase(caseId);
}

export async function listScenariosAction() {
  return SCENARIOS.map(s => ({ id: s.id, displayName: s.displayName, tagline: s.tagline }));
}
```

**Step 3: Write `lib/actions/claim.ts`**

```ts
'use server';
import { db } from '@/lib/db/client';
import { cases, claims } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { runAll, RuleContext } from '@/lib/rules/engine';
import type { ClaimInput } from '@/lib/rules/types';

export async function runRuleEngineAction(caseId: string): Promise<{ totalAllowed: number; deductionsByCategory: Record<string, number> }> {
  const c = db.select().from(cases).where(eq(cases.id, caseId)).get();
  if (!c) throw new Error(`Case not found`);

  const caseClaims = db.select().from(claims).where(eq(claims.caseId, caseId)).all();
  const landlordClaims = caseClaims.filter(cl => cl.claimedBy === 'landlord');

  // Build rule inputs
  const inputs: ClaimInput[] = landlordClaims.map(cl => ({
    category: cl.category as any,
    claimedBy: 'landlord' as const,
    amountClaimed: cl.amountClaimed,
    hasEvidence: (() => { try { return JSON.parse(cl.evidenceJson).hasEvidence ?? false; } catch { return false; } })(),
    description: (() => { try { return JSON.parse(cl.evidenceJson).description ?? ''; } catch { return ''; } })()
  }));

  // Context for rule engine
  const moveIn = new Date(c.moveInDate);
  const moveOut = new Date(c.moveOutDate);
  const yearsOfTenancy = Math.max(0.5, (moveOut.getTime() - moveIn.getTime()) / (365.25 * 24 * 3600 * 1000));
  const unpaidRentMonths = landlordClaims.find(cl => cl.category === 'unpaid_rent')?.amountClaimed
    ? Math.round((landlordClaims.find(cl => cl.category === 'unpaid_rent')!.amountClaimed) / c.monthlyRent)
    : 0;

  const ctx: RuleContext = {
    yearsOfTenancy,
    monthlyRentPaise: c.monthlyRent,
    fixtureOriginalCostPaise: Math.max(landlordClaims.find(cl => cl.category === 'fixtures')?.amountClaimed ?? 0, 100000),
    unpaidRentMonthsClaimed: unpaidRentMonths
  };

  const decisions = runAll(inputs, ctx);

  // Persist decisions
  for (let i = 0; i < landlordClaims.length; i++) {
    const d = decisions[i];
    const claimRow = landlordClaims[i];
    db.update(claims).set({
      decision: d.decision,
      amountAllowed: d.amountAllowed,
      reasoning: d.reasoning,
      citedAuthority: d.citedAuthority
    }).where(eq(claims.id, claimRow.id)).run();
  }

  // Update case status
  db.update(cases).set({ status: 'calc' }).where(eq(cases.id, caseId)).run();

  const totalAllowed = decisions.reduce((sum, d) => sum + d.amountAllowed, 0);
  const deductionsByCategory = decisions.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = d.amountAllowed;
    return acc;
  }, {});

  return { totalAllowed, deductionsByCategory };
}

export async function loadClaimsAction(caseId: string, role?: 'tenant' | 'landlord') {
  const all = db.select().from(claims).where(eq(claims.caseId, caseId)).all();
  if (role) return all.filter(c => c.claimedBy === role);
  return all;
}

export async function updateClaimAmountAction(claimId: string, amountClaimed: number) {
  db.update(claims).set({ amountClaimed, decision: 'pending', amountAllowed: 0, reasoning: '', citedAuthority: '' })
    .where(eq(claims.id, claimId)).run();
}
```

**Step 4: Write `lib/actions/negotiate.ts`**

```ts
'use server';
import { db } from '@/lib/db/client';
import { cases, negotiations, offers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { negotiationReducer, initialNegotiation } from '@/lib/negotiation/machine';
import { computeGapPercent } from '@/lib/negotiation/types';
import { newId } from '@/lib/ids';

export async function submitOfferAction(caseId: string, by: 'tenant' | 'landlord', amount: number) {
  const c = db.select().from(cases).where(eq(cases.id, caseId)).get();
  if (!c) throw new Error('Case not found');

  const n = db.select().from(negotiations).where(eq(negotiations.caseId, caseId)).get();
  if (!n) throw new Error('Negotiation not found');

  const current = { currentRound: n.currentRound, tenantOffer: n.tenantOffer, landlordOffer: n.landlordOffer, status: n.status as 'open' | 'settled' | 'escalated' };
  const next = negotiationReducer(current, { type: 'SUBMIT_OFFER', by, amount }, c.depositAmount);

  // Persist offer history
  db.insert(offers).values({
    id: newId(),
    caseId,
    roundNumber: next.currentRound,
    byRole: by,
    amount,
    timestamp: new Date().toISOString()
  }).run();

  // Compute gap
  const gapBps = (next.tenantOffer != null && next.landlordOffer != null)
    ? computeGapPercent(next.tenantOffer, next.landlordOffer, c.depositAmount)
    : 0;

  // Persist negotiation state
  db.update(negotiations).set({
    currentRound: next.currentRound,
    tenantOffer: next.tenantOffer,
    landlordOffer: next.landlordOffer,
    gapPercent: gapBps,
    status: next.status,
    settledAt: next.status === 'settled' ? new Date().toISOString() : null
  }).where(eq(negotiations.caseId, caseId)).run();

  if (next.status === 'settled') {
    db.update(cases).set({ status: 'settled' }).where(eq(cases.id, caseId)).run();
  } else if (next.status === 'escalated') {
    db.update(cases).set({ status: 'escalated' }).where(eq(cases.id, caseId)).run();
  }

  return { ...next, gapPercent: gapBps };
}

export async function loadNegotiationAction(caseId: string) {
  return db.select().from(negotiations).where(eq(negotiations.caseId, caseId)).get();
}

export async function loadOffersAction(caseId: string) {
  return db.select().from(offers).where(eq(offers.caseId, caseId)).all();
}

export async function loadNegotiationStateAction(caseId: string) {
  const n = await loadNegotiationAction(caseId);
  if (!n) return null;
  return {
    currentRound: n.currentRound,
    tenantOffer: n.tenantOffer,
    landlordOffer: n.landlordOffer,
    gapPercent: n.gapPercent,
    status: n.status,
    settledAt: n.settledAt
  };
}
```

**Step 5: Verify dev server still starts**

Run: `npm run dev` (background, then kill)
Expected: no compile errors

**Step 6: Commit**

```bash
git add .
git commit -m "feat: server actions (case, claim, negotiate) + reset"
```

---

### Task 10: Landing page + scenario picker

**Files:**
- Create: `components/ScenarioCard.tsx`, modify: `app/page.tsx`

**Step 1: Write `components/ScenarioCard.tsx`**

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createCaseAction } from '@/lib/actions/case';

type Props = { id: string; displayName: string; tagline: string };

export function ScenarioCard({ id, displayName, tagline }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const caseId = await createCaseAction(id as any);
      router.push(`/c/${caseId}/tenant/intake`);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="block w-full text-left rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow-md disabled:opacity-50"
    >
      <div className="text-lg font-semibold text-slate-900">{displayName}</div>
      <div className="mt-2 text-sm text-slate-600">{tagline}</div>
      <div className="mt-4 text-sm font-medium text-blue-600">
        {isPending ? 'Creating case…' : 'Start demo →'}
      </div>
    </button>
  );
}
```

**Step 2: Rewrite `app/page.tsx`** (landing page — the brand impression)

```tsx
import { SCENARIOS } from '@/lib/scenarios';
import { ScenarioCard } from '@/components/ScenarioCard';

export default function Home() {
  return (
    <main className="mx-auto max-w-content px-8 py-24 animate-fadeIn">
      {/* Live indicator — small, top-right of page */}
      <div className="mb-16 flex items-center gap-2 text-xs text-mute">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-saffron animate-pulseSaffron" />
        <span className="font-mono uppercase tracking-widest">Live demo · {SCENARIOS.length} scenarios loaded</span>
      </div>

      {/* Hero */}
      <header className="mb-20 max-w-prose">
        <div className="mb-6 flex items-baseline gap-3">
          <h1 className="font-display text-hero italic text-ink">
            RentSettle
          </h1>
          <span className="inline-block h-3 w-3 rounded-full bg-saffron translate-y-[-8px]" aria-hidden />
        </div>
        <p className="text-2xl leading-snug text-ink">
          Resolve your deposit dispute in <span className="font-display italic">minutes</span>,<br />
          not fourteen months of court.
        </p>
        <p className="mt-6 max-w-md text-base text-mute">
          A working ODR platform built on Karnataka's Rent Act and Supreme Court precedent.
          Pick a dispute below to walk one through from intake to settlement PDF.
        </p>
      </header>

      {/* Section eyebrow */}
      <div className="mb-6 flex items-center gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">01 · Pick a dispute</div>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* Scenario cards */}
      <div className="grid gap-3">
        {SCENARIOS.map(s => (
          <ScenarioCard key={s.id} id={s.id} displayName={s.displayName} tagline={s.tagline} />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-24 flex items-center justify-between border-t border-line pt-6 text-xs text-mute">
        <span className="font-mono uppercase tracking-widest">
          Applies federal + Karnataka law. Not legal advice.
        </span>
        <a href="/showcase/mediator" className="underline decoration-line decoration-1 underline-offset-4 hover:text-ink">
          What if they can't agree? →
        </a>
      </div>
    </main>
  );
}
```

**Step 2b: Rewrite `components/ScenarioCard.tsx`** (apply design system)

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createCaseAction } from '@/lib/actions/case';

type Props = { id: string; displayName: string; tagline: string };

export function ScenarioCard({ id, displayName, tagline }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const caseId = await createCaseAction(id as any);
      router.push(`/c/${caseId}/tenant/intake`);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="group flex w-full items-center justify-between rounded-lg border border-line bg-white px-6 py-5 text-left transition-all hover:border-ink hover:shadow-sm disabled:opacity-50"
    >
      <div>
        <div className="text-base font-semibold text-ink">{displayName}</div>
        <div className="mt-1 text-sm text-mute">{tagline}</div>
      </div>
      <div className="font-mono text-xs text-saffron opacity-0 transition-opacity group-hover:opacity-100">
        {isPending ? 'starting…' : 'start →'}
      </div>
    </button>
  );
}
```

**Step 3: Verify landing page renders**

Run: `npm run dev`, open http://localhost:3000
Expected: see "RentSettle" heading, 3 scenario cards, mediator showcase link.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: landing page with 3 scenario cards"
```

---

### Task 11: StageNav + RoleBadge + ResetButton components

**Files:**
- Create: `components/StageNav.tsx`, `components/RoleBadge.tsx`, `components/ResetButton.tsx`

**Step 1: Write `components/StageNav.tsx`** (apply design system)

```tsx
import Link from 'next/link';
import { cn } from '@/lib/cn';

type Stage = 'tenant-intake' | 'landlord-intake' | 'calc' | 'negotiate' | 'settle';

const STAGES: { key: Stage; label: string; href: (caseId: string) => string }[] = [
  { key: 'tenant-intake', label: 'Tenant', href: id => `/c/${id}/tenant/intake` },
  { key: 'landlord-intake', label: 'Landlord', href: id => `/c/${id}/landlord/intake` },
  { key: 'calc', label: 'Calculation', href: id => `/c/${id}/calc` },
  { key: 'negotiate', label: 'Negotiate', href: id => `/c/${id}/negotiate` },
  { key: 'settle', label: 'Settle', href: id => `/c/${id}/settle` }
];

export function StageNav({ caseId, current }: { caseId: string; current: Stage }) {
  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line py-3">
      {STAGES.map((s, i) => {
        const isCurrent = current === s.key;
        return (
          <Link
            key={s.key}
            href={s.href(caseId)}
            className={cn(
              'group flex items-center gap-2 text-sm transition-colors',
              isCurrent ? 'text-ink' : 'text-mute hover:text-ink'
            )}
          >
            <span className={cn(
              'font-mono text-xs',
              isCurrent ? 'text-saffron' : 'text-mute'
            )}>
              0{i + 1}
            </span>
            <span className={cn(isCurrent && 'font-semibold')}>{s.label}</span>
            {isCurrent && <span className="ml-1 inline-block h-1 w-1 rounded-full bg-saffron" />}
          </Link>
        );
      })}
    </nav>
  );
}
```

**Step 2: Write `lib/cn.ts`**

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 3: Write `components/RoleBadge.tsx`**

```tsx
import { cn } from '@/lib/cn';

const STYLES = {
  tenant: { dot: 'bg-tenant', text: 'text-tenant' },
  landlord: { dot: 'bg-landlord', text: 'text-landlord' },
  mediator: { dot: 'bg-saffron', text: 'text-saffron' }
};

const LABELS = {
  tenant: 'Tenant view',
  landlord: 'Landlord view',
  mediator: 'Mediator view'
};

export function RoleBadge({ role }: { role: 'tenant' | 'landlord' | 'mediator' }) {
  const s = STYLES[role];
  return (
    <div className={cn('flex items-center gap-2 text-xs font-semibold uppercase tracking-widest', s.text)}>
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', s.dot)} />
      <span>{LABELS[role]}</span>
    </div>
  );
}
```

**Step 4: Write `components/ResetButton.tsx`**

```tsx
'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { resetCaseAction } from '@/lib/actions/case';

export function ResetButton({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    if (!confirm('Reset to demo data? This will wipe all claims and negotiation history.')) return;
    startTransition(async () => {
      await resetCaseAction(caseId);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleReset}
      disabled={isPending}
      className="font-mono text-[11px] uppercase tracking-widest text-mute transition-colors hover:text-ink disabled:opacity-50"
    >
      {isPending ? 'resetting…' : '↻ reset to demo data'}
    </button>
  );
}
```

**Step 5: Commit**

```bash
git add .
git commit -m "feat: StageNav, RoleBadge, ResetButton, cn util (design system applied)"
```

---

### Task 12: CitationTooltip + RuleExplainer components

**Files:**
- Create: `components/CitationTooltip.tsx`, `components/RuleExplainer.tsx`

**Step 1: Write `components/CitationTooltip.tsx`** (design system applied)

```tsx
'use client';
import { useState } from 'react';

type Props = { authority: string; fullText?: string };

export function CitationTooltip({ authority, fullText }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(o => !o)}
        className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-line font-mono text-[10px] font-semibold text-mute transition-colors hover:border-ink hover:text-ink"
        aria-label="Show rule details"
      >?</button>
      {open && (
        <div className="absolute left-1/2 top-7 z-20 w-80 -translate-x-1/2 rounded-lg border border-ink bg-paper p-4 text-xs shadow-lg">
          <div className="font-mono text-[10px] uppercase tracking-widest text-mute">{authority}</div>
          {fullText && <div className="mt-2 font-serif text-sm italic leading-relaxed text-ink">"{fullText}"</div>}
        </div>
      )}
    </span>
  );
}
```

**Step 2: Write `components/RuleExplainer.tsx`** (design system applied)

```tsx
'use client';
import { useState } from 'react';
import { CITATIONS, CitationKey } from '@/lib/rules/citations';
import { DeductionCategory } from '@/lib/rules/types';

type RuleData = { authority: CitationKey[]; explanation: string; isIndustryStandard?: boolean };

const RULES: Record<DeductionCategory, RuleData> = {
  painting: {
    authority: ['tpa_108m', 'ka_rent_47', 'ka_rent_48d'],
    explanation: 'Periodic repainting for normal aging is structural maintenance — landlord\'s duty. Tenant pays only for damage beyond normal wear-and-tear.'
  },
  fixtures: {
    authority: ['tpa_108m', 'sc_fateh_chand', 'industry_10pct'],
    explanation: 'Fixtures are depreciated using an industry-standard 10% per year convention. The cap is NOT statutory; it depends on age, condition, and original cost.',
    isIndustryStandard: true
  },
  utilities: {
    authority: ['ka_rent_48a', 'sc_maula_bux'],
    explanation: 'Utility deductions require submitted proof (bills, payment receipts). Bare claims without evidence are denied.'
  },
  unpaid_rent: {
    authority: ['ka_rent_48a'],
    explanation: 'Unpaid rent is a direct contractual obligation. Strict arithmetic: months owed × monthly rent. Proof of arrears required.'
  },
  cleaning: {
    authority: ['tpa_108m', 'ka_rent_48d'],
    explanation: 'Routine cleaning is normal end-of-tenancy hygiene, not damage. Denied unless extreme (e.g., pest infestation from tenant actions).'
  }
};

export function RuleExplainer({ category }: { category: DeductionCategory }) {
  const [open, setOpen] = useState(false);
  const rule = RULES[category];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-baseline justify-between border-b border-line py-2 text-left font-mono text-[10px] uppercase tracking-widest text-mute transition-colors hover:text-ink"
      >
        <span>About this rule</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {rule.isIndustryStandard && (
            <div className="inline-block rounded-sm border border-saffron bg-saffron/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-saffron">
              Industry standard · not statutory
            </div>
          )}
          <p className="font-serif text-sm leading-relaxed text-ink">{rule.explanation}</p>
          <div className="space-y-2 border-l border-line pl-3">
            {rule.authority.map(k => (
              <div key={k} className="text-xs">
                <div className="font-mono text-[10px] uppercase tracking-widest text-mute">{CITATIONS[k].short}</div>
                <div className="mt-0.5 font-serif italic text-ink">"{CITATIONS[k].full}"</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: CitationTooltip + RuleExplainer components"
```

---

### Task 12b: ReasoningChain component (WOW #2)

**Files:**
- Create: `components/ReasoningChain.tsx`

**Step 1: Write `components/ReasoningChain.tsx`**

This is the "show your work" component — judges see the rule engine's reasoning step-by-step with staggered fade-in animation.

```tsx
'use client';
import { useEffect, useState } from 'react';
import type { DeductionCategory } from '@/lib/rules/types';

type Props = {
  claim: {
    category: DeductionCategory;
    amountClaimed: number;
    amountAllowed: number;
    decision: 'allow' | 'deny' | 'cap';
    citedAuthority: string;
  };
};

const CATEGORY_LABEL: Record<DeductionCategory, string> = {
  painting: 'painting',
  fixtures: 'fixtures',
  utilities: 'utility charges',
  unpaid_rent: 'unpaid rent',
  cleaning: 'cleaning'
};

// Per-category reasoning steps
function getSteps(category: DeductionCategory, hasEvidence: boolean, yearsOfTenancy: number) {
  switch (category) {
    case 'painting':
      return [
        { icon: '1', label: 'Claim received', detail: `landlord claims for repainting` },
        { icon: '2', label: 'Rule check', detail: hasEvidence ? 'Evidence provided → damage beyond wear' : 'No evidence → apply TPA §108(m) wear exception' },
        { icon: '3', label: 'Outcome', detail: hasEvidence ? 'Damage qualifies as tenant liability' : 'Normal wear — landlord\'s duty per KA Rent §47' }
      ];
    case 'fixtures':
      return [
        { icon: '1', label: 'Claim received', detail: `landlord claims for fixture damage` },
        { icon: '2', label: 'Rule check', detail: hasEvidence ? 'Industry-standard 10% per year depreciation applied' : 'No evidence → Maula Bux requires proof' },
        { icon: '3', label: 'Outcome', detail: hasEvidence ? `Capped at 10% × ${yearsOfTenancy} yrs of original cost` : 'Bare claim denied' }
      ];
    case 'utilities':
      return [
        { icon: '1', label: 'Claim received', detail: 'landlord claims unpaid utility bills' },
        { icon: '2', label: 'Rule check', detail: hasEvidence ? 'Bill receipts verified' : 'No bill receipts → §48(a) requires proof' },
        { icon: '3', label: 'Outcome', detail: hasEvidence ? 'Deduction allowed in full' : 'Bare claim denied' }
      ];
    case 'unpaid_rent':
      return [
        { icon: '1', label: 'Claim received', detail: 'landlord claims unpaid rent' },
        { icon: '2', label: 'Rule check', detail: hasEvidence ? 'Arrears verified — strict arithmetic' : 'No proof of arrears → §48(a)' },
        { icon: '3', label: 'Outcome', detail: hasEvidence ? 'months × monthly rent = exact amount' : 'Bare claim denied' }
      ];
    case 'cleaning':
      return [
        { icon: '1', label: 'Claim received', detail: 'landlord deducts for cleaning' },
        { icon: '2', label: 'Rule check', detail: 'TPA §108(m) wear exception applies' },
        { icon: '3', label: 'Outcome', detail: 'Routine cleaning is normal end-of-tenancy hygiene' }
      ];
  }
}

export function ReasoningChain({ claim }: Props) {
  // Stagger reveal — each step fades in 200ms after the previous
  const [revealedSteps, setRevealedSteps] = useState(0);

  useEffect(() => {
    setRevealedSteps(0);
    const timers: NodeJS.Timeout[] = [];
    for (let i = 1; i <= 3; i++) {
      timers.push(setTimeout(() => setRevealedSteps(i), i * 200));
    }
    return () => timers.forEach(clearTimeout);
  }, [claim.category, claim.amountClaimed, claim.amountAllowed, claim.decision]);

  // For MVP, we don't track hasEvidence on this view — assume based on decision
  const hasEvidence = claim.decision === 'allow' || (claim.decision === 'cap' && claim.amountAllowed > 0);
  const yearsOfTenancy = 2; // MVP simplification
  const steps = getSteps(claim.category, hasEvidence, yearsOfTenancy);

  const decisionColor = claim.decision === 'allow' ? 'bg-red-100 border-red-300 text-red-900' :
    claim.decision === 'cap' ? 'bg-amber-100 border-amber-300 text-amber-900' :
    'bg-emerald-100 border-emerald-300 text-emerald-900';

  const decisionLabel = claim.decision === 'allow' ? '₹' + (claim.amountAllowed / 100).toLocaleString('en-IN') :
    claim.decision === 'cap' ? 'CAPPED ₹' + (claim.amountAllowed / 100).toLocaleString('en-IN') :
    'DENIED';

  return (
    <div className="rounded-md border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Reasoning chain</div>
      <div className="flex items-center gap-1 overflow-x-auto">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1">
            <div
              className={`min-w-0 flex-shrink-0 rounded-md border px-2 py-2 transition-all duration-300 ${
                revealedSteps > i ? 'border-blue-300 bg-blue-50 opacity-100' : 'border-slate-200 bg-white opacity-0'
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-2">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {step.icon}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-700">{step.label}</div>
                  <div className="text-[11px] text-slate-600">{step.detail}</div>
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`text-xl text-slate-400 transition-opacity duration-300 ${revealedSteps > i ? 'opacity-100' : 'opacity-0'}`}>→</div>
            )}
          </div>
        ))}
        <div className={`min-w-0 flex-shrink-0 rounded-md border-2 px-3 py-2 transition-all duration-500 ${decisionColor} ${
          revealedSteps >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider">Final</div>
          <div className="text-sm font-bold">{decisionLabel}</div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: WOW #2 ReasoningChain — visual reasoning with staggered reveal"
```

---

### Task 13: Tenant intake page

**Files:**
- Create: `app/c/[caseId]/tenant/intake/page.tsx`, `app/c/[caseId]/layout.tsx`

**Step 1: Write `app/c/[caseId]/layout.tsx`** (apply design system)

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadCaseAction } from '@/lib/actions/case';

export default async function CaseLayout({ children, params }: { children: React.ReactNode; params: { caseId: string } }) {
  const c = await loadCaseAction(params.caseId);
  if (!c) notFound();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-content flex-wrap items-baseline justify-between gap-3 px-8 py-4">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-display text-xl italic text-ink">RentSettle</Link>
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute">/ case</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-ink">{c.tenantName} <span className="text-mute">vs</span> {c.landlordName}</div>
            <div className="text-xs text-mute">{c.propertyAddress}</div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-content px-8 py-12 animate-fadeIn">{children}</main>
    </div>
  );
}
```

**Step 2: Write `app/c/[caseId]/tenant/intake/page.tsx`** (design system applied)

```tsx
import { loadClaimsAction } from '@/lib/actions/claim';
import { loadCaseAction } from '@/lib/actions/case';
import { StageNav } from '@/components/StageNav';
import { RoleBadge } from '@/components/RoleBadge';
import { ResetButton } from '@/components/ResetButton';
import { TenantIntakeForm } from './TenantIntakeForm';
import { DeductionCategory } from '@/lib/rules/types';

const CATEGORIES: DeductionCategory[] = ['painting', 'fixtures', 'utilities', 'unpaid_rent', 'cleaning'];
const LABELS: Record<DeductionCategory, string> = {
  painting: 'Painting',
  fixtures: 'Fixtures & fittings',
  utilities: 'Utilities (electricity, water)',
  unpaid_rent: 'Unpaid rent',
  cleaning: 'Cleaning'
};

export default async function TenantIntakePage({ params }: { params: { caseId: string } }) {
  const c = await loadCaseAction(params.caseId);
  const claims = await loadClaimsAction(params.caseId, 'tenant');
  const claimsByCategory = Object.fromEntries(claims.map(cl => [cl.category, cl]));

  return (
    <div>
      <div className="mb-12 flex items-end justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-mute">01 · Your side</div>
          <h1 className="font-display text-4xl italic text-ink">Tenant intake.</h1>
          <p className="mt-3 max-w-md text-sm text-mute">
            For each deduction the landlord is making, share your response. Pre-filled for the demo — adjust anything.
          </p>
        </div>
        <ResetButton caseId={c.id} />
      </div>

      <div className="mb-8">
        <RoleBadge role="tenant" />
      </div>

      <div className="mb-8">
        <StageNav caseId={c.id} current="tenant-intake" />
      </div>

      <TenantIntakeForm caseId={c.id} categories={CATEGORIES} labels={LABELS} initialClaims={claimsByCategory} />
    </div>
  );
}
```

**Step 3: Write `app/c/[caseId]/tenant/intake/TenantIntakeForm.tsx`** (design system applied)

```tsx
'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { DeductionCategory, Claim } from '@/lib/rules/types';
import { formatRupees } from '@/lib/money';

type Props = {
  caseId: string;
  categories: DeductionCategory[];
  labels: Record<DeductionCategory, string>;
  initialClaims: Record<string, Claim>;
};

export function TenantIntakeForm({ caseId, categories, labels, initialClaims }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [descriptions, setDescriptions] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const cat of categories) {
      const claim = initialClaims[cat];
      try {
        out[cat] = claim?.evidenceJson ? JSON.parse(claim.evidenceJson).description ?? '' : '';
      } catch { out[cat] = ''; }
    }
    return out;
  });
  const [hasEvidence, setHasEvidence] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    for (const cat of categories) {
      const claim = initialClaims[cat];
      try {
        out[cat] = claim?.evidenceJson ? JSON.parse(claim.evidenceJson).hasEvidence ?? false : false;
      } catch { out[cat] = false; }
    }
    return out;
  });

  const handleSave = () => {
    startTransition(async () => {
      for (const cat of categories) {
        const claim = initialClaims[cat];
        if (!claim) continue;
        const updatedEvidence = JSON.stringify({ description: descriptions[cat] ?? '', hasEvidence: hasEvidence[cat] ?? false });
        await fetch(`/api/claim/${claim.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ evidenceJson: updatedEvidence, amountClaimed: claim.amountClaimed })
        });
      }
      router.push(`/c/${caseId}/landlord/intake`);
    });
  };

  return (
    <div className="space-y-3">
      {categories.map(cat => {
        const claim = initialClaims[cat];
        if (!claim) return null;
        return (
          <div key={cat} className="rounded-lg border border-line bg-white p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest text-mute">{labels[cat]}</span>
              <span className="font-mono text-xs text-mute">
                landlord claims <span className="text-ink">{formatRupees(claim.amountClaimed)}</span>
              </span>
            </div>
            <textarea
              value={descriptions[cat] ?? ''}
              onChange={e => setDescriptions(s => ({ ...s, [cat]: e.target.value }))}
              rows={2}
              placeholder="Your response…"
              className="w-full resize-none border-0 border-b border-line bg-transparent px-0 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none focus:ring-0 transition-colors"
            />
            <div className="mt-3 flex items-center gap-2">
              <input
                id={`ev-${cat}`}
                type="checkbox"
                checked={hasEvidence[cat] ?? false}
                onChange={e => setHasEvidence(s => ({ ...s, [cat]: e.target.checked }))}
                className="h-3.5 w-3.5 accent-tenant"
              />
              <label htmlFor={`ev-${cat}`} className="text-xs text-mute">
                I have evidence (receipts, photos, agreement clauses)
              </label>
            </div>
          </div>
        );
      })}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="mt-8 group flex w-full items-center justify-between rounded-lg border border-ink bg-ink px-8 py-5 text-paper transition-all hover:bg-saffron hover:border-saffron disabled:opacity-50"
      >
        <span className="text-sm font-semibold uppercase tracking-widest">
          {isPending ? 'Saving…' : 'Continue to landlord view'}
        </span>
        <span className="font-mono text-sm transition-transform group-hover:translate-x-2">→</span>
      </button>
    </div>
  );
}
```

**Step 4: Write minimal API route `app/api/claim/[claimId]/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { claims } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest, { params }: { params: { claimId: string } }) {
  const body = await req.json();
  db.update(claims).set({
    evidenceJson: body.evidenceJson,
    amountClaimed: body.amountClaimed
  }).where(eq(claims.id, params.claimId)).run();
  return NextResponse.json({ ok: true });
}
```

**Step 5: Verify tenant intake renders**

Run: `npm run dev`, navigate to landing → click Whitefield → check tenant intake page
Expected: see RoleBadge "Tenant view", 5 form fields pre-filled, save button.

**Step 6: Commit**

```bash
git add .
git commit -m "feat: tenant intake page with editable pre-filled forms"
```

---

### Task 14: Landlord intake page

**Files:**
- Create: `app/c/[caseId]/landlord/intake/page.tsx`, `app/c/[caseId]/landlord/intake/LandlordIntakeForm.tsx`

**Step 1: Write `app/c/[caseId]/landlord/intake/page.tsx`** (design system applied)

```tsx
import { loadClaimsAction } from '@/lib/actions/claim';
import { loadCaseAction } from '@/lib/actions/case';
import { StageNav } from '@/components/StageNav';
import { RoleBadge } from '@/components/RoleBadge';
import { ResetButton } from '@/components/ResetButton';
import { LandlordIntakeForm } from './LandlordIntakeForm';
import { DeductionCategory } from '@/lib/rules/types';

const CATEGORIES: DeductionCategory[] = ['painting', 'fixtures', 'utilities', 'unpaid_rent', 'cleaning'];
const LABELS: Record<DeductionCategory, string> = {
  painting: 'Painting',
  fixtures: 'Fixtures & fittings',
  utilities: 'Utilities (electricity, water)',
  unpaid_rent: 'Unpaid rent',
  cleaning: 'Cleaning'
};

export default async function LandlordIntakePage({ params }: { params: { caseId: string } }) {
  const c = await loadCaseAction(params.caseId);
  const claims = await loadClaimsAction(params.caseId, 'landlord');
  const claimsByCategory = Object.fromEntries(claims.map(cl => [cl.category, cl]));

  return (
    <div>
      <div className="mb-12 flex items-end justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-mute">02 · Your claims</div>
          <h1 className="font-display text-4xl italic text-ink">Landlord intake.</h1>
          <p className="mt-3 max-w-md text-sm text-mute">
            State your deductions and evidence. Pre-filled for the demo — adjust as needed.
          </p>
        </div>
        <ResetButton caseId={c.id} />
      </div>

      <div className="mb-8">
        <RoleBadge role="landlord" />
      </div>

      <div className="mb-8">
        <StageNav caseId={c.id} current="landlord-intake" />
      </div>

      <LandlordIntakeForm caseId={c.id} categories={CATEGORIES} labels={LABELS} initialClaims={claimsByCategory} />
    </div>
  );
}
```

**Step 2: Write `app/c/[caseId]/landlord/intake/LandlordIntakeForm.tsx`** (design system applied)

```tsx
'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { DeductionCategory, Claim } from '@/lib/rules/types';
import { runRuleEngineAction } from '@/lib/actions/claim';

type Props = {
  caseId: string;
  categories: DeductionCategory[];
  labels: Record<DeductionCategory, string>;
  initialClaims: Record<string, Claim>;
};

export function LandlordIntakeForm({ caseId, categories, labels, initialClaims }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [amounts, setAmounts] = useState<Record<string, number>>(() => {
    const out: Record<string, number> = {};
    for (const cat of categories) {
      out[cat] = initialClaims[cat]?.amountClaimed ?? 0;
    }
    return out;
  });
  const [hasEvidence, setHasEvidence] = useState<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {};
    for (const cat of categories) {
      try {
        out[cat] = initialClaims[cat]?.evidenceJson ? JSON.parse(initialClaims[cat].evidenceJson).hasEvidence ?? false : false;
      } catch { out[cat] = false; }
    }
    return out;
  });

  const handleRun = () => {
    startTransition(async () => {
      for (const cat of categories) {
        const claim = initialClaims[cat];
        if (!claim) continue;
        const updatedEvidence = JSON.stringify({
          description: (() => { try { return JSON.parse(claim.evidenceJson).description ?? ''; } catch { return ''; } })(),
          hasEvidence: hasEvidence[cat] ?? false
        });
        await fetch(`/api/claim/${claim.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ evidenceJson: updatedEvidence, amountClaimed: amounts[cat] ?? 0 })
        });
      }
      await runRuleEngineAction(caseId);
      router.push(`/c/${caseId}/calc`);
    });
  };

  return (
    <div className="space-y-3">
      {categories.map(cat => {
        const claim = initialClaims[cat];
        if (!claim) return null;
        const amountRupees = (amounts[cat] ?? 0) / 100;
        return (
          <div key={cat} className="rounded-lg border border-line bg-white p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest text-mute">{labels[cat]}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-mute">amount to deduct</span>
            </div>
            <div className="flex items-baseline gap-2 border-b border-line pb-3 focus-within:border-ink transition-colors">
              <span className="font-mono text-lg text-mute">₹</span>
              <input
                type="number"
                value={amountRupees}
                onChange={e => setAmounts(s => ({ ...s, [cat]: Math.round(Number(e.target.value) * 100) }))}
                min={0}
                step={100}
                className="w-full border-0 bg-transparent font-mono text-2xl text-ink focus:outline-none focus:ring-0"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                id={`landlord-ev-${cat}`}
                type="checkbox"
                checked={hasEvidence[cat] ?? false}
                onChange={e => setHasEvidence(s => ({ ...s, [cat]: e.target.checked }))}
                className="h-3.5 w-3.5 accent-landlord"
              />
              <label htmlFor={`landlord-ev-${cat}`} className="text-xs text-mute">
                I have evidence (bills, photos, receipts)
              </label>
            </div>
          </div>
        );
      })}

      <button
        onClick={handleRun}
        disabled={isPending}
        className="mt-8 group flex w-full items-center justify-between rounded-lg border border-ink bg-ink px-8 py-5 text-paper transition-all hover:bg-saffron hover:border-saffron disabled:opacity-50"
      >
        <span className="text-sm font-semibold uppercase tracking-widest">
          {isPending ? 'Running rule engine…' : 'Run rule engine'}
        </span>
        <span className="font-mono text-sm transition-transform group-hover:translate-x-2">→</span>
      </button>
    </div>
  );
}
```

**Step 3: Verify landlord intake renders and rule engine runs**

Run: `npm run dev`, navigate through full intake flow.
Expected: rule engine runs, navigates to /calc.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: landlord intake page + rule engine trigger"
```

---

### Task 15: Calculation page with citation tooltips

**Files:**
- Create: `app/c/[caseId]/calc/page.tsx`

**Step 1: Write `app/c/[caseId]/calc/page.tsx`** (with WOW #2 — visual reasoning chain + design system)

```tsx
import { loadCaseAction } from '@/lib/actions/case';
import { runRuleEngineAction } from '@/lib/actions/claim';
import { StageNav } from '@/components/StageNav';
import { ResetButton } from '@/components/ResetButton';
import { RuleExplainer } from '@/components/RuleExplainer';
import { CitationTooltip } from '@/components/CitationTooltip';
import { ReasoningChain } from '@/components/ReasoningChain';
import { DeductionCategory } from '@/lib/rules/types';
import { db } from '@/lib/db/client';
import { claims } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { formatRupees } from '@/lib/money';

const LABELS: Record<DeductionCategory, string> = {
  painting: 'Painting', fixtures: 'Fixtures & fittings', utilities: 'Utilities',
  unpaid_rent: 'Unpaid rent', cleaning: 'Cleaning'
};

export default async function CalcPage({ params }: { params: { caseId: string } }) {
  const c = await loadCaseAction(params.caseId);

  if (c.status === 'intake') {
    await runRuleEngineAction(c.id);
  }

  const landlordClaims = db.select().from(claims).where(eq(claims.caseId, c.id)).all().filter(cl => cl.claimedBy === 'landlord');
  const totalAllowed = landlordClaims.reduce((s, cl) => s + cl.amountAllowed, 0);
  const refund = c.depositAmount - totalAllowed;

  return (
    <div>
      {/* Header */}
      <div className="mb-12 flex items-end justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-mute">03 · Calculation</div>
          <h1 className="font-display text-4xl italic text-ink">The rule engine.</h1>
        </div>
        <ResetButton caseId={c.id} />
      </div>

      <div className="mb-8">
        <StageNav caseId={c.id} current="calc" />
      </div>

      {/* Summary row — paper-table style */}
      <div className="my-12 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
        <div className="bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">Deposit</div>
          <div className="mt-2 font-mono text-2xl text-ink">{formatRupees(c.depositAmount)}</div>
        </div>
        <div className="bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">Total allowed deductions</div>
          <div className="mt-2 font-mono text-2xl text-ink">{formatRupees(totalAllowed)}</div>
        </div>
        <div className="bg-paper p-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-saffron">Refund to tenant</div>
          <div className="mt-2 font-mono text-3xl font-medium text-saffron">{formatRupees(refund)}</div>
        </div>
      </div>

      {/* Per-deduction cards */}
      <div className="space-y-3">
        {landlordClaims.map(cl => (
          <div key={cl.id} className="rounded-lg border border-line bg-white p-6 transition-all hover:border-ink hover:shadow-sm">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mute">{LABELS[cl.category as DeductionCategory]}</span>
                  <CitationTooltip authority={cl.citedAuthority}>
                    <span className="hidden" />
                  </CitationTooltip>
                </div>
                <div className="mt-2 text-sm leading-relaxed text-ink">{cl.reasoning}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-widest text-mute">Claimed</div>
                <div className="font-mono text-sm text-mute">{formatRupees(cl.amountClaimed)}</div>
                <div className={`mt-3 font-mono text-2xl font-medium transition-all ${
                  cl.decision === 'allow' ? 'text-landlord' :
                  cl.decision === 'cap' ? 'text-saffron' : 'text-mute'
                }`}>
                  {cl.decision === 'deny' ? 'denied' : formatRupees(cl.amountAllowed)}
                </div>
              </div>
            </div>

            {/* WOW #2: Visual reasoning chain */}
            <div className="mt-6">
              <ReasoningChain claim={{
                category: cl.category as DeductionCategory,
                amountClaimed: cl.amountClaimed,
                amountAllowed: cl.amountAllowed,
                decision: cl.decision as 'allow' | 'deny' | 'cap',
                citedAuthority: cl.citedAuthority
              }} />
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <RuleExplainer category={cl.category as DeductionCategory} />
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer — small, italic, mono caps */}
      <div className="mt-12 border-t border-line pt-4 text-center font-mono text-[10px] uppercase tracking-widest text-mute">
        Applies federal + Karnataka law + industry standards · Not legal advice
      </div>

      {/* Continue CTA */}
      <div className="mt-12">
        <Link
          href={`/c/${c.id}/negotiate`}
          className="group flex items-center justify-between rounded-lg border border-ink bg-ink px-8 py-5 text-paper transition-all hover:bg-saffron hover:border-saffron"
        >
          <span className="text-sm font-semibold uppercase tracking-widest">Continue to negotiation</span>
          <span className="font-mono text-sm transition-transform group-hover:translate-x-2">→</span>
        </Link>
      </div>
    </div>
  );
}
```

**Step 2: Verify calc page renders with all 5 deductions**

Run: `npm run dev`, navigate to /c/[caseId]/calc
Expected: see breakdown with 5 deduction lines, decision badges, citation tooltips.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: calculation page with citations + tooltips + explanations"
```

---

## Phase D: Negotiation + Settlement + Showcase (T+11h to T+13.5h)

### Task 16: GapVisualizer + OfferForm components

**Files:**
- Create: `components/GapVisualizer.tsx`, `components/OfferForm.tsx`

**Step 1: Write `components/GapVisualizer.tsx`** (THE signature element — design system applied)

```tsx
'use client';
import { formatRupees } from '@/lib/money';

type Props = {
  tenantOffer: number | null;
  landlordOffer: number | null;
  depositAmount: number;
  gapPercent: number;
  currentRound: number;
  status: 'open' | 'settled' | 'escalated';
};

export function GapVisualizer({ tenantOffer, landlordOffer, depositAmount, gapPercent, currentRound, status }: Props) {
  // Compute positions as percent of deposit (0% = 0 rupees, 100% = full deposit)
  const tenantPos = tenantOffer != null ? Math.min(100, (tenantOffer / depositAmount) * 100) : 0;
  const landlordPos = landlordOffer != null ? Math.min(100, (landlordOffer / depositAmount) * 100) : 0;

  const willSettle = gapPercent <= 500;
  const settled = status === 'settled';

  return (
    <div className="space-y-8">
      {/* State diagram — top eyebrow */}
      <div className="text-center font-mono text-[10px] uppercase tracking-widest text-mute">
        OPEN → ROUND {Math.max(1, currentRound)} → ROUND 2 → ROUND 3 → {' '}
        <span className={settled ? 'text-tenant font-semibold' : status === 'escalated' ? 'text-landlord font-semibold' : 'text-mute'}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* TENANT BAR — emerald */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-tenant">Tenant wants back</span>
          <span className="font-mono text-xl text-ink">{tenantOffer != null ? formatRupees(tenantOffer) : '—'}</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="absolute inset-y-0 left-0 bg-tenant transition-all duration-500 ease-out"
            style={{ width: `${tenantPos}%` }}
          />
        </div>
      </div>

      {/* LANDLORD BAR — amber */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-landlord">Landlord will release</span>
          <span className="font-mono text-xl text-ink">{landlordOffer != null ? formatRupees(landlordOffer) : '—'}</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-line">
          <div
            className="absolute inset-y-0 left-0 bg-landlord transition-all duration-500 ease-out"
            style={{ width: `${landlordPos}%` }}
          />
        </div>
      </div>

      {/* GAP INDICATOR — mono caps, saffron when close */}
      {tenantOffer != null && landlordOffer != null && (
        <div className="border-t border-line pt-6 text-center">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-mute">Gap</div>
          <div className={`font-mono text-5xl font-medium leading-none transition-colors ${willSettle ? 'text-saffron' : 'text-ink'}`}>
            {(gapPercent / 100).toFixed(2)}<span className="text-2xl text-mute">%</span>
          </div>
          <div className={`mt-3 font-mono text-[11px] uppercase tracking-widest ${willSettle ? 'text-saffron' : 'text-mute'}`}>
            {willSettle ? '✓ Auto-settle eligible' : `Need round ${Math.min(3, currentRound + 1)} to close`}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Write `components/OfferForm.tsx`** (with WOW #1 — live negotiation coach)

```tsx
'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { submitOfferAction } from '@/lib/actions/negotiate';
import { computeGapPercent, shouldAutoSettle } from '@/lib/negotiation/types';

type Props = {
  caseId: string;
  by: 'tenant' | 'landlord';
  currentOffer: number | null;
  otherPartyOffer: number | null;
  depositAmount: number;
};

const COACH_THRESHOLD_BPS = 500; // 5%

export function OfferForm({ caseId, by, currentOffer, otherPartyOffer, depositAmount }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState((currentOffer ?? 50000) / 100);
  const [pending, setPending] = useState(false);

  // LIVE: compute hypothetical gap as user types — no server call, pure math
  const livePreview = useMemo(() => {
    if (otherPartyOffer == null) return null;
    const myOfferPaise = Math.round(amount * 100);
    const tenant = by === 'tenant' ? myOfferPaise : otherPartyOffer;
    const landlord = by === 'landlord' ? myOfferPaise : otherPartyOffer;
    const gapBps = computeGapPercent(tenant, landlord, depositAmount);
    const settle = shouldAutoSettle(gapBps);
    return { gapBps, settle, gapRupees: Math.abs(tenant - landlord) };
  }, [amount, by, otherPartyOffer, depositAmount]);

  const handleSubmit = async () => {
    setPending(true);
    const result = await submitOfferAction(caseId, by, Math.round(amount * 100));
    setPending(false);
    if (result.status === 'settled') {
      router.push(`/c/${caseId}/settle`);
    } else {
      router.refresh();
    }
  };

  const label = by === 'tenant' ? 'Tenant offer (₹)' : 'Landlord offer (₹)';

  // Coach hint logic
  const coachHint = (() => {
    if (livePreview == null) return null;
    if (livePreview.settle) return { type: 'settle' as const, msg: `Would auto-settle — gap only ${(livePreview.gapBps / 100).toFixed(1)}%` };
    if (livePreview.gapBps < 1500) return { type: 'close' as const, msg: `Close — ${(livePreview.gapBps / 100).toFixed(1)}% gap. Try ₹${by === 'tenant' ? Math.ceil((otherPartyOffer! + COACH_THRESHOLD_BPS * depositAmount / 10000) / 100) : Math.floor((otherPartyOffer! - COACH_THRESHOLD_BPS * depositAmount / 10000) / 100)} to settle.` };
    return { type: 'far' as const, msg: `${(livePreview.gapBps / 100).toFixed(1)}% gap — needs round 2` };
  })();

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        min={0}
        step={500}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />

      {/* WOW #1: Live coach hint updates as user types */}
      {coachHint && (
        <div className={`rounded-md px-3 py-2 text-xs transition-all duration-200 ${
          coachHint.type === 'settle' ? 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-300' :
          coachHint.type === 'close' ? 'bg-amber-100 text-amber-900' :
          'bg-slate-100 text-slate-700'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${
              coachHint.type === 'settle' ? 'bg-emerald-500 animate-pulse' :
              coachHint.type === 'close' ? 'bg-amber-500' : 'bg-slate-400'
            }`} />
            <span className="font-medium">Coach:</span>
            <span>{coachHint.msg}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all"
      >
        {pending ? 'Submitting…' : 'Submit offer'}
      </button>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: GapVisualizer + OfferForm components"
```

---

### Task 17: Negotiate page

**Files:**
- Create: `app/c/[caseId]/negotiate/page.tsx`

**Step 1: Write `app/c/[caseId]/negotiate/page.tsx`** (centerpiece page — the wow moment)

```tsx
import { loadCaseAction } from '@/lib/actions/case';
import { loadNegotiationAction, loadOffersAction } from '@/lib/actions/negotiate';
import { StageNav } from '@/components/StageNav';
import { RoleBadge } from '@/components/RoleBadge';
import { ResetButton } from '@/components/ResetButton';
import { GapVisualizer } from '@/components/GapVisualizer';
import { OfferForm } from '@/components/OfferForm';
import { formatRupees } from '@/lib/money';

export default async function NegotiatePage({ params }: { params: { caseId: string } }) {
  const c = await loadCaseAction(params.caseId);
  const n = await loadNegotiationAction(params.caseId);
  const offerHistory = await loadOffersAction(params.caseId);

  if (!n || n.status === 'settled') {
    return (
      <div>
        <p className="text-mute">This case is settled. <a href={`/c/${c.id}/settle`} className="text-ink underline decoration-saffron decoration-2 underline-offset-4">View settlement →</a></p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-12 flex items-end justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-mute">04 · Negotiate</div>
          <h1 className="font-display text-4xl italic text-ink">Close the gap.</h1>
        </div>
        <ResetButton caseId={c.id} />
      </div>

      <div className="mb-8">
        <StageNav caseId={c.id} current="negotiate" />
      </div>

      {/* Stage info */}
      <div className="mb-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-mute">
        <span>Round {Math.max(1, n.currentRound)} of 3</span>
        <span>Auto-settle when gap ≤ 5%</span>
      </div>

      {/* THE GAP VISUALIZER — the centerpiece */}
      <div className="my-8 rounded-lg border border-line bg-white p-10 shadow-sm">
        <GapVisualizer
          tenantOffer={n.tenantOffer}
          landlordOffer={n.landlordOffer}
          depositAmount={c.depositAmount}
          gapPercent={n.gapPercent}
          currentRound={n.currentRound}
          status={n.status as any}
        />
      </div>

      {/* Two-party offer forms */}
      <div className="grid gap-px bg-line md:grid-cols-2 overflow-hidden rounded-lg border border-line">
        <div className="bg-white p-8">
          <RoleBadge role="tenant" />
          <div className="mt-6">
            <OfferForm
              caseId={c.id}
              by="tenant"
              currentOffer={n.tenantOffer}
              otherPartyOffer={n.landlordOffer}
              depositAmount={c.depositAmount}
            />
          </div>
        </div>
        <div className="bg-white p-8">
          <RoleBadge role="landlord" />
          <div className="mt-6">
            <OfferForm
              caseId={c.id}
              by="landlord"
              currentOffer={n.landlordOffer}
              otherPartyOffer={n.tenantOffer}
              depositAmount={c.depositAmount}
            />
          </div>
        </div>
      </div>

      {/* Offer history — small, mono, secondary */}
      <div className="mt-10">
        <div className="mb-3 flex items-baseline gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">Activity</div>
          <div className="h-px flex-1 bg-line" />
        </div>
        <ol className="space-y-1 font-mono text-xs text-mute">
          {offerHistory.map(o => (
            <li key={o.id}>
              <span className="text-line">{new Date(o.timestamp).toLocaleTimeString()}</span>
              <span className="ml-3">R{o.roundNumber}</span>
              <span className={o.byRole === 'tenant' ? 'ml-3 text-tenant' : 'ml-3 text-landlord'}>{o.byRole}</span>
              <span className="ml-3 text-ink">{formatRupees(o.amount)}</span>
            </li>
          ))}
          {offerHistory.length === 0 && (
            <li className="italic text-mute">No offers yet — both parties can begin below.</li>
          )}
        </ol>
      </div>
    </div>
  );
}
```

**Step 2: Verify negotiate page works end-to-end**

Run: `npm run dev`, navigate to /c/[caseId]/negotiate
Expected: tenant and landlord forms, gap visualizer, submit offer triggers state transitions.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: negotiate page with gap visualizer + offer form + history"
```

---

### Task 18: Settlement page + PDF generation

**Files:**
- Create: `components/PdfSettlement.tsx`, `app/c/[caseId]/settle/page.tsx`

**Step 1: Write `components/PdfSettlement.tsx`**

```tsx
'use client';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { formatRupees } from '@/lib/money';
import { DeductionCategory } from '@/lib/rules/types';

type Props = {
  case: {
    tenantName: string;
    landlordName: string;
    propertyAddress: string;
    depositAmount: number;
  };
  deductions: Array<{
    category: DeductionCategory;
    amountAllowed: number;
    reasoning: string;
    citedAuthority: string;
  }>;
  settlementAmount: number;
  settlementTimestamp: string;
};

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#0f172a' },
  subheader: { fontSize: 10, color: '#64748b', marginBottom: 20 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#0f172a' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottom: '1pt solid #e2e8f0' },
  rowLabel: { color: '#475569' },
  rowValue: { fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTop: '2pt solid #0f172a', marginTop: 6 },
  totalLabel: { fontWeight: 'bold', fontSize: 12 },
  totalValue: { fontWeight: 'bold', fontSize: 14, color: '#059669' },
  consent: { marginTop: 20, paddingTop: 10, borderTop: '1pt solid #cbd5e1' },
  consentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  footer: { marginTop: 30, fontSize: 8, color: '#94a3b8', textAlign: 'center' }
});

const CATEGORY_LABELS: Record<DeductionCategory, string> = {
  painting: 'Painting', fixtures: 'Fixtures & fittings', utilities: 'Utilities',
  unpaid_rent: 'Unpaid rent', cleaning: 'Cleaning'
};

function PdfDoc({ case: c, deductions, settlementAmount, settlementTimestamp }: Props) {
  const totalAllowed = deductions.reduce((s, d) => s + d.amountAllowed, 0);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>DEPOSIT SETTLEMENT AGREEMENT</Text>
        <Text style={styles.subheader}>Generated by RentSettle · {settlementTimestamp}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties</Text>
          <View style={styles.row}><Text style={styles.rowLabel}>Tenant</Text><Text>{c.tenantName}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Landlord</Text><Text>{c.landlordName}</Text></View>
          <View style={styles.row}><Text style={styles.rowLabel}>Property</Text><Text>{c.propertyAddress}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deduction Breakdown</Text>
          {deductions.map(d => (
            <View key={d.category} style={{ marginBottom: 4 }}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{CATEGORY_LABELS[d.category]}</Text>
                <Text style={d.amountAllowed === 0 ? { color: '#059669' } : styles.rowValue}>
                  {d.amountAllowed === 0 ? 'DENIED' : formatRupees(d.amountAllowed)}
                </Text>
              </View>
              {d.amountAllowed > 0 && (
                <Text style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>{d.citedAuthority}</Text>
              )}
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total deductions allowed</Text>
            <Text style={styles.totalValue}>{formatRupees(totalAllowed)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settlement</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Original deposit</Text>
            <Text>{formatRupees(c.depositAmount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Agreed refund to tenant</Text>
            <Text style={styles.totalValue}>{formatRupees(settlementAmount)}</Text>
          </View>
        </View>

        <View style={styles.consent}>
          <Text style={styles.sectionTitle}>Digital Consent</Text>
          <View style={styles.consentRow}>
            <View>
              <Text style={{ fontSize: 9, color: '#64748b' }}>Tenant signature</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>{c.tenantName}</Text>
              <Text style={{ fontSize: 8, color: '#94a3b8' }}>{settlementTimestamp}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 9, color: '#64748b' }}>Landlord signature</Text>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>{c.landlordName}</Text>
              <Text style={{ fontSize: 8, color: '#94a3b8' }}>{settlementTimestamp}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          RentSettle applies federal and Karnataka-specific law plus standard industry practices.
          Not legal advice. Disputing parties retain rights to pursue Rent Control Court.
        </Text>
      </Page>
    </Document>
  );
}

export function PdfSettlement(props: Props) {
  return (
    <PDFDownloadLink
      document={<PdfDoc {...props} />}
      fileName={`RentSettle-${props.case.tenantName.replace(/\s+/g, '-')}.pdf`}
      className="group inline-flex items-center gap-3 rounded-lg border border-saffron bg-saffron px-10 py-5 text-paper transition-all hover:bg-ink hover:border-ink"
    >
      {({ loading }) => (
        <>
          <span className="text-sm font-semibold uppercase tracking-widest">
            {loading ? 'Generating…' : 'Download settlement PDF'}
          </span>
          <span className="font-mono text-sm transition-transform group-hover:translate-x-1">→</span>
        </>
      )}
    </PDFDownloadLink>
  );
}
```

**Step 2: Write `app/c/[caseId]/settle/page.tsx`** (the climactic moment)

```tsx
import { loadCaseAction } from '@/lib/actions/case';
import { loadNegotiationAction, loadOffersAction } from '@/lib/actions/negotiate';
import { db } from '@/lib/db/client';
import { claims } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { StageNav } from '@/components/StageNav';
import { ResetButton } from '@/components/ResetButton';
import { formatRupees } from '@/lib/money';
import { PdfSettlement } from '@/components/PdfSettlement';
import { DeductionCategory } from '@/lib/rules/types';

export default async function SettlePage({ params }: { params: { caseId: string } }) {
  const c = await loadCaseAction(params.caseId);
  const n = await loadNegotiationAction(params.caseId);
  if (!n) return <p className="text-mute">No negotiation found.</p>;

  const landlordClaims = db.select().from(claims).where(eq(claims.caseId, c.id)).all().filter(cl => cl.claimedBy === 'landlord');
  const totalAllowed = landlordClaims.reduce((s, cl) => s + cl.amountAllowed, 0);
  const refund = c.depositAmount - totalAllowed;
  const timestamp = n.settledAt ?? new Date().toISOString();

  return (
    <div>
      <div className="mb-12 flex items-end justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-mute">05 · Settled</div>
          <h1 className="font-display text-4xl italic text-ink">Done.</h1>
        </div>
        <ResetButton caseId={c.id} />
      </div>

      <div className="mb-8">
        <StageNav caseId={c.id} current="settle" />
      </div>

      {/* HERO NUMBER — the agreed refund */}
      <div className="my-12 border-y border-line py-12 text-center">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-mute">Agreed refund to {c.tenantName}</div>
        <div className="font-mono text-[80px] font-medium leading-none text-saffron">
          {formatRupees(refund)}
        </div>
        <div className="mt-6 font-mono text-xs uppercase tracking-widest text-mute">
          Tenant {n.tenantOffer ? formatRupees(n.tenantOffer) : '—'} · Landlord {n.landlordOffer ? formatRupees(n.landlordOffer) : '—'}
        </div>
      </div>

      {/* Download CTA — single accent button */}
      <div className="mb-12 text-center">
        <PdfSettlement
          case={{ tenantName: c.tenantName, landlordName: c.landlordName, propertyAddress: c.propertyAddress, depositAmount: c.depositAmount }}
          deductions={landlordClaims.map(cl => ({ category: cl.category as DeductionCategory, amountAllowed: cl.amountAllowed, reasoning: cl.reasoning, citedAuthority: cl.citedAuthority }))}
          settlementAmount={refund}
          settlementTimestamp={timestamp}
        />
      </div>

      {/* Deduction breakdown — paper-table style */}
      <div className="border-t border-line pt-6">
        <div className="mb-4 flex items-baseline gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">Breakdown</div>
          <div className="h-px flex-1 bg-line" />
        </div>
        <div className="divide-y divide-line">
          {landlordClaims.map(cl => (
            <div key={cl.id} className="flex items-baseline justify-between py-3">
              <div>
                <div className="text-sm text-ink capitalize">{cl.category.replace('_', ' ')}</div>
                <div className="font-mono text-[11px] text-mute">Claimed {formatRupees(cl.amountClaimed)}</div>
              </div>
              <div className={`font-mono text-base ${cl.amountAllowed === 0 ? 'text-mute' : 'text-ink'}`}>
                {cl.amountAllowed === 0 ? 'denied' : formatRupees(cl.amountAllowed)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-16 text-center font-mono text-[11px] uppercase tracking-widest text-mute">
        Demo complete · <a href="/showcase/mediator" className="underline decoration-line decoration-1 underline-offset-4 hover:text-ink">what if they can't agree? →</a>
      </p>
    </div>
  );
}
```

**Step 3: Verify settlement page renders and PDF downloads**

Run: `npm run dev`, navigate through full flow → settle page
Expected: settlement amount visible, PDF download button works, opens in browser with all fields.

**Step 4: Commit**

```bash
git add .
git commit -m "feat: settlement page + PDF generation with digital consent"
```

---

### Task 19: Mediator showcase page

**Files:**
- Create: `app/showcase/mediator/page.tsx`

**Step 1: Write `app/showcase/mediator/page.tsx`** (design system applied)

```tsx
'use client';
import { useState } from 'react';
import { RoleBadge } from '@/components/RoleBadge';
import { formatRupees } from '@/lib/money';
import Link from 'next/link';

export default function MediatorShowcase() {
  const [tenantFinal] = useState(40000);
  const [landlordFinal] = useState(25000);
  const [verdict, setVerdict] = useState<'tenant' | 'landlord' | 'force' | null>(null);
  const [forceAmount, setForceAmount] = useState(32500);

  return (
    <main className="mx-auto max-w-content px-8 py-24 animate-fadeIn">
      <div className="mb-12">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-mute">Showcase</div>
        <h1 className="font-display text-4xl italic text-ink">What if they can't agree?</h1>
        <p className="mt-3 max-w-md text-sm text-mute">
          When negotiation fails after 3 rounds, the case escalates to a RentSettle-trained mediator
          who reviews both positions and issues a binding verdict. This view demonstrates that path.
        </p>
      </div>

      <div className="mb-8">
        <RoleBadge role="mediator" />
      </div>

      {/* Final positions */}
      <div className="mb-12">
        <div className="mb-4 flex items-baseline gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">Final positions</div>
          <div className="h-px flex-1 bg-line" />
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
          <div className="bg-white p-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-tenant">Tenant (Priya)</div>
            <div className="mt-2 font-mono text-3xl text-ink">{formatRupees(tenantFinal * 100)}</div>
          </div>
          <div className="bg-white p-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-landlord">Landlord (Rajesh)</div>
            <div className="mt-2 font-mono text-3xl text-ink">{formatRupees(landlordFinal * 100)}</div>
          </div>
        </div>
        <div className="mt-3 text-center font-mono text-[11px] uppercase tracking-widest text-mute">
          Gap {formatRupees((tenantFinal - landlordFinal) * 100)} · 15% of deposit · exceeds auto-settle threshold
        </div>
      </div>

      {/* Mediator verdict */}
      <div>
        <div className="mb-4 flex items-baseline gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">Mediator verdict</div>
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setVerdict('tenant')}
            className={`flex w-full items-center justify-between rounded-lg border px-6 py-5 text-left transition-all ${
              verdict === 'tenant' ? 'border-tenant bg-tenant/5' : 'border-line bg-white hover:border-ink'
            }`}
          >
            <div>
              <div className="text-sm text-ink">Accept tenant's final position</div>
              <div className="font-mono text-xs text-mute">{formatRupees(tenantFinal * 100)}</div>
            </div>
            <div className={`font-mono text-xs uppercase tracking-widest ${verdict === 'tenant' ? 'text-tenant' : 'text-mute'}`}>
              {verdict === 'tenant' ? '✓ selected' : '→'}
            </div>
          </button>

          <button
            onClick={() => setVerdict('landlord')}
            className={`flex w-full items-center justify-between rounded-lg border px-6 py-5 text-left transition-all ${
              verdict === 'landlord' ? 'border-landlord bg-landlord/5' : 'border-line bg-white hover:border-ink'
            }`}
          >
            <div>
              <div className="text-sm text-ink">Accept landlord's final position</div>
              <div className="font-mono text-xs text-mute">{formatRupees(landlordFinal * 100)}</div>
            </div>
            <div className={`font-mono text-xs uppercase tracking-widest ${verdict === 'landlord' ? 'text-landlord' : 'text-mute'}`}>
              {verdict === 'landlord' ? '✓ selected' : '→'}
            </div>
          </button>

          <div className={`rounded-lg border p-6 transition-all ${
            verdict === 'force' ? 'border-saffron bg-saffron/5' : 'border-line bg-white'
          }`}>
            <button onClick={() => setVerdict('force')} className="flex w-full items-center justify-between text-left">
              <div>
                <div className="text-sm text-ink">Force settlement at midpoint</div>
                <div className="font-mono text-xs text-mute">Mediator's discretion</div>
              </div>
              <div className={`font-mono text-xs uppercase tracking-widest ${verdict === 'force' ? 'text-saffron' : 'text-mute'}`}>
                {verdict === 'force' ? '✓ selected' : '→'}
              </div>
            </button>
            {verdict === 'force' && (
              <div className="mt-4 flex items-baseline gap-2 border-t border-line pt-4">
                <span className="font-mono text-sm text-mute">₹</span>
                <input
                  type="number"
                  value={forceAmount}
                  onChange={e => setForceAmount(Number(e.target.value))}
                  className="w-32 border-0 bg-transparent font-mono text-2xl text-ink focus:outline-none"
                />
                <span className="font-mono text-xs uppercase tracking-widest text-mute">refund</span>
              </div>
            )}
          </div>
        </div>

        {verdict && (
          <div className="mt-8 border-t border-line pt-4 text-center font-mono text-[11px] uppercase tracking-widest text-saffron">
            ✓ Verdict recorded · Both parties notified · Settlement PDF generated
          </div>
        )}
      </div>

      <div className="mt-16 border-t border-line pt-6 text-center">
        <Link href="/" className="font-mono text-[11px] uppercase tracking-widest text-mute underline decoration-line decoration-1 underline-offset-4 hover:text-ink">
          ← Back to scenarios
        </Link>
      </div>
    </main>
  );
}
```

**Step 2: Verify showcase page loads**

Run: `npm run dev`, navigate to /showcase/mediator
Expected: see mediator view with 3 verdict options.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: mediator showcase page (Q&A escalation demo)"
```

---

## Phase E: QA + polish (T+13.5h to T+14h)

### Task 20: API routes (reset + claim PATCH)

**Files:**
- Create: `app/api/reset/[caseId]/route.ts`, `app/api/claim/[claimId]/route.ts` (already created in Task 13 — verify)

**Step 1: Write `app/api/reset/[caseId]/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { resetCase } from '@/lib/db/reset';

export async function POST(_req: NextRequest, { params }: { params: { caseId: string } }) {
  try {
    const id = resetCase(params.caseId);
    return NextResponse.json({ ok: true, caseId: id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
```

**Step 2: Verify existing PATCH route at `app/api/claim/[claimId]/route.ts` from Task 13**

If not present, write it now:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { claims } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest, { params }: { params: { claimId: string } }) {
  const body = await req.json();
  db.update(claims).set({
    evidenceJson: body.evidenceJson,
    amountClaimed: body.amountClaimed
  }).where(eq(claims.id, params.claimId)).run();
  return NextResponse.json({ ok: true });
}
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat: API routes (reset, claim PATCH)"
```

---

### Task 21: End-to-end smoke test

**Step 1: Walk through demo path manually**

Run: `npm run dev`, then:
1. Open http://localhost:3000
2. Click Whitefield 2BHK card → creates case → navigates to tenant intake
3. Click "Save & Continue" → landlord intake
4. Click "Run rule engine" → calc page with 5 deduction rows
5. Click "Continue to negotiation" → negotiate page
6. Submit tenant offer ₹55,000 → submit landlord offer ₹45,000 → check gap = 5%
7. Submit landlord offer ₹50,000 → check auto-settle triggers → navigates to settle
8. On settle page, click "Download Settlement PDF" → PDF opens with all required fields

**Step 2: Verify each criterion**

- [ ] Legal accuracy (30%): Every deduction line shows citation tooltip
- [ ] Dual-party UX (25%): Tenant and landlord pages both render correctly
- [ ] Negotiation SM (20%): Gap visualizer animates, state diagram visible, auto-settle fires
- [ ] Settlement PDF (15%): PDF downloads with all required fields (tenant, landlord, address, breakdown, settlement amount, both timestamps)
- [ ] Creativity (10%): Evidence forms with checkboxes for has-proof flag

**Step 3: Test reset flow**

Click "Reset to demo data" on any page → confirm → page refreshes with seed data

**Step 4: Test scenario switching**

Click "← Back to scenarios" → pick Koramangala → verify new case with different data

**Step 5: Fix any issues found, commit**

```bash
git add .
git commit -m "fix: smoke test fixes (round N)"
```

---

### Task 22: Final polish + buffer

**Step 1: Add disclaimer to landing page footer**

Add to `app/page.tsx` after the existing footer link:
```tsx
<p className="mt-4 text-[10px] text-slate-400">
  RentSettle applies federal and Karnataka-specific law plus standard industry practices. Not legal advice.
</p>
```

**Step 2: Add visual "5 stages" indicator on landing page**

Optionally enhance landing page to show the 5-stage flow visually:
```tsx
<div className="mt-8 grid grid-cols-5 gap-2 text-center text-xs">
  {['Tenant intake', 'Landlord intake', 'Rule engine', 'Negotiate', 'Settle'].map((s, i) => (
    <div key={s} className="rounded-md bg-slate-100 px-2 py-3">
      <div className="font-bold text-slate-900">{i + 1}</div>
      <div className="text-slate-600">{s}</div>
    </div>
  ))}
</div>
```

**Step 3: Add "real-time" feel across the app**

These are the small touches that make judges feel the data is live:

1. **Live indicator on landing page**: subtle pulsing dot near the title:
```tsx
<div className="flex items-center justify-center gap-2 text-xs text-slate-500">
  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
  <span>Live demo · {SCENARIOS.length} scenarios loaded</span>
</div>
```

2. **Stage transition animation**: when navigating between stages, the page fades in:
```tsx
// Wrap each page's content in:
<div className="animate-fadeIn">{/* existing content */}</div>
```

Add to `app/globals.css`:
```css
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.animate-fadeIn { animation: fadeIn 280ms ease-out both; }
```

3. **Gap visualizer bars animate with `transition-all duration-500`** (already in plan).

4. **Decision badges animate on calc page**: when result changes (DENIED → ALLOWED), brief flash:
```tsx
className={`...transition-all duration-500 ${flashKey ? 'ring-2 ring-blue-400' : ''}`}
```

5. **ReasoningChain staggered fade** (already added in Task 12b).

**Step 4: Cross-browser test**

Open the demo in Chrome and Firefox. Verify:
- Animations work
- Forms submit
- PDF downloads
- Live coach hint updates as you type in offer input

**Step 5: Commit final**

```bash
git add .
git commit -m "polish: real-time feel (live indicators, fade transitions, coach hint, animations)"
```

---

## Self-review checklist (run before declaring plan complete)

1. **Spec coverage:**
   - Section 5 rule engine (5 categories + citations) → Tasks 4, 5 ✅
   - Section 6 architecture (route map, file structure, data model, state machine, server actions, forms) → Tasks 6–17 ✅
   - Section 7 scenarios (3 with full data) → Task 6 ✅
   - Section 8 components → Tasks 11, 12, 12b, 16, 18 ✅
   - Section 9 error handling → fallback paths in each component ✅
   - Section 10 testing → Tasks 4, 5, 8, 21 ✅
   - Section 11 demo script → Task 21 manual walkthrough ✅

2. **WOW factors (added per user request 2026-09-11):**
   - WOW #1 Negotiation coach hint → Task 16 (OfferForm now has live coach with rule suggestions) ✅
   - WOW #2 Visual reasoning chain → Task 12b (ReasoningChain component with staggered reveal) ✅
   - Real-time feel → Task 22 Step 3 (live indicators, fade animations, hover transitions) ✅

3. **Placeholder scan:** No "TBD", "TODO", "fill in later" in this plan.

4. **Type consistency:** `Claim`, `Case`, `Negotiation`, `Offer` types defined in Task 2 schema, used consistently. `DeductionCategory` defined in Task 3, used everywhere. `ReasoningChain` accepts the claim shape used by calc page.

5. **Open action items from spec:**
   - Transcribe Fifth Schedule Parts A and B → noted in `legal-research-synthesis.md`, not blocking (uses §47/§48 + TPA §108(m) instead)
   - 3 scenarios authored → Task 6 ✅
   - Verbatim citations in `citations.ts` → Task 3 ✅
   - Gap visualizer with animation → Task 16 (uses div transitions + bar widths) ✅
   - PDF template → Task 18 ✅
   - WOW #1 coach hint → Task 16 ✅
   - WOW #2 reasoning chain → Task 12b ✅
   - Real-time polish → Task 22 ✅
