import { loadCaseAction } from '@/lib/actions/case';
import { loadNegotiationAction } from '@/lib/actions/negotiate';
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
        Demo complete · <a href="/showcase/mediator" className="underline decoration-line decoration-1 underline-offset-4 hover:text-ink">what if they can&apos;t agree? →</a>
      </p>
    </div>
  );
}
