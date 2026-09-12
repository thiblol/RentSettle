'use client';
import { useState } from 'react';
import { whitefield2BHK } from '@/lib/scenarios/whitefield-2bhk';
import { CITATIONS } from '@/lib/rules/citations';
import { formatRupees } from '@/lib/money';
import { RoleBadge } from '@/components/RoleBadge';
import { PdfSettlement } from '@/components/PdfSettlement';
import Link from 'next/link';

type Verdict = 'tenant' | 'landlord' | 'force';

type DeductionDecision = {
  category: string;
  label: string;
  decision: 'ALLOWED' | 'DENIED' | 'CAPPED';
  amount: number;
  citationKey: keyof typeof CITATIONS;
  description: string;
};

const DEPOSIT = whitefield2BHK.case.depositAmount;
const TENANT_FINAL = whitefield2BHK.escalationData.tenantFinalPosition;
const LANDLORD_FINAL = whitefield2BHK.escalationData.landlordFinalPosition;
const MIDPOINT = Math.round((TENANT_FINAL + LANDLORD_FINAL) / 2);

const FIXTURE_ORIGINAL = whitefield2BHK.case.monthlyRent; // approximate: ₹25,000 original cost proxy
const YEARS = whitefield2BHK.ruleContext.yearsOfTenancy;
const FIXTURE_CAP = Math.round((FIXTURE_ORIGINAL * 0.10 * YEARS) / 100) * 100; // 10% per year, rounded to nearest 100

const deductions: DeductionDecision[] = [
  {
    category: 'painting',
    label: 'Painting',
    decision: 'DENIED',
    amount: 0,
    citationKey: 'tpa_108m',
    description: whitefield2BHK.landlordClaims.find(c => c.category === 'painting')?.description ?? '',
  },
  {
    category: 'fixtures',
    label: 'Fixtures & fittings',
    decision: 'CAPPED',
    amount: FIXTURE_CAP,
    citationKey: 'industry_10pct',
    description: whitefield2BHK.landlordClaims.find(c => c.category === 'fixtures')?.description ?? '',
  },
  {
    category: 'utilities',
    label: 'Utilities (electricity)',
    decision: 'ALLOWED',
    amount: whitefield2BHK.landlordClaims.find(c => c.category === 'utilities')?.amountClaimed ?? 0,
    citationKey: 'ka_rent_48b',
    description: whitefield2BHK.landlordClaims.find(c => c.category === 'utilities')?.description ?? '',
  },
  {
    category: 'unpaid_rent',
    label: 'Unpaid rent',
    decision: 'DENIED',
    amount: 0,
    citationKey: 'ka_rent_48a',
    description: 'No unpaid rent claimed',
  },
  {
    category: 'cleaning',
    label: 'Cleaning',
    decision: 'DENIED',
    amount: 0,
    citationKey: 'ka_rent_48b',
    description: whitefield2BHK.landlordClaims.find(c => c.category === 'cleaning')?.description ?? '',
  },
];

const ALLOWED_TOTAL = deductions
  .filter(d => d.decision === 'ALLOWED' || d.decision === 'CAPPED')
  .reduce((sum, d) => sum + d.amount, 0);
const ESTIMATED_REFUND = DEPOSIT - ALLOWED_TOTAL;

const DECISION_STYLE: Record<DeductionDecision['decision'], string> = {
  ALLOWED: 'bg-green-50 text-green-700 border-green-200',
  DENIED: 'bg-red-50 text-red-600 border-red-200',
  CAPPED: 'bg-amber-50 text-amber-700 border-amber-200',
};

const DECISION_TEXT: Record<DeductionDecision['decision'], string> = {
  ALLOWED: 'ALLOWED',
  DENIED: 'DENIED',
  CAPPED: 'CAPPED',
};

export default function MediatorShowcase() {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [forceAmount, setForceAmount] = useState(MIDPOINT);

  const { case: caseData, escalationData } = whitefield2BHK;

  const settlementAmount =
    verdict === 'tenant' ? TENANT_FINAL :
    verdict === 'landlord' ? LANDLORD_FINAL :
    forceAmount;

  const pdfDeductions = deductions.map(d => ({
    category: d.category as 'painting' | 'fixtures' | 'utilities' | 'unpaid_rent' | 'cleaning',
    amountAllowed: d.amount,
    reasoning: d.description,
    citedAuthority: CITATIONS[d.citationKey].short,
  }));

  return (
    <main className="mx-auto max-w-content px-8 py-24 animate-fadeIn">
      {/* Header */}
      <div className="mb-12">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-saffron font-mono">
          Showcase · Escalation
        </div>
        <h1 className="font-display text-4xl italic text-ink">
          What if they can&apos;t agree?
        </h1>
        <p className="mt-3 max-w-md text-sm text-mute">
          After 3 rounds of negotiation, the case escalated to a RentSettle-trained mediator.
          Here is the full case record.
        </p>
        <div className="mt-4 inline-flex flex-col gap-0.5 rounded-lg border border-line bg-white px-4 py-3">
          <span className="font-mono text-xs font-semibold text-ink">
            {caseData.tenantName} vs {caseData.landlordName}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-mute">
            Whitefield 2BHK · {formatRupees(DEPOSIT)} deposit · 24-month tenancy
          </span>
        </div>
      </div>

      <div className="mb-8">
        <RoleBadge role="mediator" />
      </div>

      {/* Two-column: rule breakdown + final positions */}
      <div className="mb-12 grid grid-cols-2 gap-6">
        {/* Left: Rule engine breakdown */}
        <div>
          <div className="mb-4 flex items-baseline gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">
              Rule engine breakdown
            </div>
            <div className="h-px flex-1 bg-line" />
          </div>
          <div className="space-y-2">
            {deductions.map(d => (
              <div key={d.category} className="rounded-lg border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink">{d.label}</div>
                    <div className="mt-0.5 text-xs text-mute">{d.description}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-mute/70">
                      {CITATIONS[d.citationKey].short}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${DECISION_STYLE[d.decision]}`}>
                      {DECISION_TEXT[d.decision]}
                    </span>
                    {d.decision !== 'DENIED' ? (
                      <span className="font-mono text-sm font-medium text-ink">
                        {formatRupees(d.amount)}
                      </span>
                    ) : (
                      <span className="font-mono text-sm text-mute">—</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {/* Subtotal */}
            <div className="mt-3 flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3">
              <span className="font-mono text-xs uppercase tracking-widest text-mute">
                Estimated refund to tenant
              </span>
              <span className="font-mono text-sm font-semibold text-ink">
                {formatRupees(ESTIMATED_REFUND)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Final positions */}
        <div>
          <div className="mb-4 flex items-baseline gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">
              Final positions
            </div>
            <div className="h-px flex-1 bg-line" />
          </div>
          <div className="space-y-3">
            {/* Tenant card */}
            <div className="rounded-lg border border-line bg-white p-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-tenant">
                Tenant&apos;s bottom line
              </div>
              <div className="mt-2 font-mono text-3xl text-ink">
                {formatRupees(TENANT_FINAL)}
              </div>
              <div className="mt-1 font-mono text-xs text-mute">{caseData.tenantName}</div>
            </div>
            {/* Landlord card */}
            <div className="rounded-lg border border-line bg-white p-6">
              <div className="font-mono text-[10px] uppercase tracking-widest text-landlord">
                Landlord&apos;s bottom line
              </div>
              <div className="mt-2 font-mono text-3xl text-ink">
                {formatRupees(LANDLORD_FINAL)}
              </div>
              <div className="mt-1 font-mono text-xs text-mute">{caseData.landlordName}</div>
            </div>
            {/* Gap */}
            <div className="flex items-center justify-between rounded-lg border border-saffron/30 bg-saffron/5 px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-saffron">
                Gap
              </span>
              <span className="font-mono text-xs font-medium text-saffron">
                {formatRupees(TENANT_FINAL - LANDLORD_FINAL)} · {escalationData.gapPercent / 100}% of deposit
              </span>
            </div>
            {/* Status badge */}
            <div className="rounded-lg border border-landlord/30 bg-landlord/5 px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-landlord">
                ESCALATED — Round 3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verdict section */}
      <div>
        <div className="mb-4 flex items-baseline gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">
            Mediator verdict
          </div>
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setVerdict('tenant')}
            className={`flex w-full items-center justify-between rounded-lg border px-6 py-5 text-left transition-all ${
              verdict === 'tenant'
                ? 'border-tenant bg-tenant/5'
                : 'border-line bg-white hover:border-ink'
            }`}
          >
            <div>
              <div className="text-sm text-ink">Accept tenant&apos;s final position</div>
              <div className="font-mono text-xs text-mute">{formatRupees(TENANT_FINAL)}</div>
            </div>
            <div
              className={`font-mono text-xs uppercase tracking-widest ${
                verdict === 'tenant' ? 'text-tenant' : 'text-mute'
              }`}
            >
              {verdict === 'tenant' ? '✓ selected' : '→'}
            </div>
          </button>

          <button
            onClick={() => setVerdict('landlord')}
            className={`flex w-full items-center justify-between rounded-lg border px-6 py-5 text-left transition-all ${
              verdict === 'landlord'
                ? 'border-landlord bg-landlord/5'
                : 'border-line bg-white hover:border-ink'
            }`}
          >
            <div>
              <div className="text-sm text-ink">Accept landlord&apos;s final position</div>
              <div className="font-mono text-xs text-mute">{formatRupees(LANDLORD_FINAL)}</div>
            </div>
            <div
              className={`font-mono text-xs uppercase tracking-widest ${
                verdict === 'landlord' ? 'text-landlord' : 'text-mute'
              }`}
            >
              {verdict === 'landlord' ? '✓ selected' : '→'}
            </div>
          </button>

          <div
            className={`rounded-lg border p-6 transition-all ${
              verdict === 'force' ? 'border-saffron bg-saffron/5' : 'border-line bg-white'
            }`}
          >
            <button
              onClick={() => setVerdict('force')}
              className="flex w-full items-center justify-between text-left"
            >
              <div>
                <div className="text-sm text-ink">Force settlement at midpoint</div>
                <div className="font-mono text-xs text-mute">Mediator&apos;s discretion</div>
              </div>
              <div
                className={`font-mono text-xs uppercase tracking-widest ${
                  verdict === 'force' ? 'text-saffron' : 'text-mute'
                }`}
              >
                {verdict === 'force' ? '✓ selected' : '→'}
              </div>
            </button>
            {verdict === 'force' && (
              <div className="mt-4 flex items-baseline gap-2 border-t border-line pt-4">
                <span className="font-mono text-sm text-mute">₹</span>
                <input
                  type="number"
                  value={forceAmount / 100}
                  onChange={(e) => setForceAmount(Math.round(Number(e.target.value) * 100))}
                  className="w-32 border-0 bg-transparent font-mono text-2xl text-ink focus:outline-none"
                />
                <span className="font-mono text-xs uppercase tracking-widest text-mute">refund</span>
              </div>
            )}
          </div>
        </div>

        {verdict && (
          <>
            <div className="mt-8 border-t border-line pt-4 text-center font-mono text-[11px] uppercase tracking-widest text-saffron">
              ✓ Verdict recorded · Both parties notified · Settlement PDF ready
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <PdfSettlement
                case={{
                  tenantName: caseData.tenantName,
                  landlordName: caseData.landlordName,
                  propertyAddress: caseData.propertyAddress,
                  depositAmount: DEPOSIT,
                }}
                deductions={pdfDeductions}
                settlementAmount={settlementAmount}
                settlementTimestamp={escalationData.escalatedAt}
              />
              <Link
                href="/"
                className="font-mono text-[11px] uppercase tracking-widest text-mute underline decoration-line decoration-1 underline-offset-4 hover:text-ink"
              >
                ← Back to scenarios
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="mt-16 border-t border-line pt-6 text-center">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-widest text-mute underline decoration-line decoration-1 underline-offset-4 hover:text-ink"
        >
          ← Back to scenarios
        </Link>
      </div>
    </main>
  );
}
