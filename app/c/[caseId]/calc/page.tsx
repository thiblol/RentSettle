import { loadCaseAction } from '@/lib/actions/case';
import { runRuleEngineAction } from '@/lib/actions/claim';
import { StageNav } from '@/components/StageNav';
import { ResetButton } from '@/components/ResetButton';
import { RuleExplainer } from '@/components/RuleExplainer';
import { CitationTooltip } from '@/components/CitationTooltip';
import { ReasoningChain } from '@/components/ReasoningChain';
import { RuleEngineHero } from '@/components/RuleEngineHero';
import { DeductionCategory } from '@/lib/rules/types';
import { db } from '@/lib/db/client';
import { claims } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { formatRupees } from '@/lib/money';

const LABELS: Record<DeductionCategory, string> = {
  painting: 'Painting',
  fixtures: 'Fixtures & fittings',
  utilities: 'Utilities',
  unpaid_rent: 'Unpaid rent',
  cleaning: 'Cleaning'
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
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-mute">03 \xb7 Calculation</div>
          <h1 className="font-display text-4xl italic text-ink">The rule engine.</h1>
        </div>
        <ResetButton caseId={c.id} />
      </div>

      <div className="mb-8">
        <StageNav caseId={c.id} current="calc" />
      </div>

      <div className="my-10 max-w-5xl">
        <RuleEngineHero claims={landlordClaims} />
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
      <div id="deduction-breakdown" className="space-y-3">
        {landlordClaims.map(cl => (
          <div key={cl.id} className="rounded-lg border border-line bg-white p-6 transition-all hover:border-ink hover:shadow-sm">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mute">{LABELS[cl.category as DeductionCategory]}</span>
                  <CitationTooltip authority={cl.citedAuthority} />
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
        Applies federal + Karnataka law + industry standards \xb7 Not legal advice
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
