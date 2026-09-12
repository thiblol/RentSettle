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

  if (!n || n.status === 'settled' || n.status === 'escalated') {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-mute">
          {n?.status === 'escalated' ? 'Escalated to mediator' : 'Case settled'}
        </div>
        <p className="mb-8 font-display text-2xl italic text-ink">
          {n?.status === 'escalated'
            ? 'Both parties agreed to mediation.'
            : 'Both parties reached an agreement.'}
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href={`/c/${c.id}/settle`}
            className="rounded-lg border border-ink bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-paper transition-all hover:border-saffron hover:bg-saffron"
          >
            View settlement →
          </a>
          <ResetButton caseId={c.id} />
        </div>
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
          status={n.status as 'open' | 'settled' | 'escalated'}
        />
      </div>

      {/* Two-party offer forms */}
      <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
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
