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

// Enhancement B: gap urgency escalation
function gapClass(gapPercent: number): string {
  if (gapPercent > 1500) return 'text-mute';
  if (gapPercent <= 500) return 'text-saffron scale-[1.05]';
  return 'text-ink';
}

// Enhancement C: state diagram
function StateDiagram({ currentRound, status }: { currentRound: number; status: 'open' | 'settled' | 'escalated' }) {
  const rounds = [1, 2, 3] as const;
  const settled = status === 'settled';
  const escalated = status === 'escalated';
  return (
    <div className="text-center font-mono text-[10px] uppercase tracking-widest text-mute">
      <span className="text-mute">OPEN</span>
      <span className="text-mute"> → </span>
      {rounds.map((r) => {
        const isCurrent = r === Math.max(1, currentRound);
        const isFuture = r > Math.max(1, currentRound);
        const done = r < Math.max(1, currentRound);
        return (
          <span key={r}>
            <span className={
              isCurrent ? 'text-saffron font-semibold' :
              isFuture ? 'text-mute' :
              'text-mute opacity-50'
            }>
              ROUND {r}
            </span>
            <span className="text-mute"> → </span>
          </span>
        );
      })}
      <span className={
        settled ? 'text-tenant font-semibold' :
        escalated ? 'text-landlord font-semibold' :
        'text-mute'
      }>
        {settled ? 'SETTLED' : escalated ? 'ESCALATED' : status.toUpperCase()}
      </span>
    </div>
  );
}

export function GapVisualizer({ tenantOffer, landlordOffer, depositAmount, gapPercent, currentRound, status }: Props) {
  // Compute positions as percent of deposit (0% = 0 rupees, 100% = full deposit)
  const tenantPos = tenantOffer != null ? Math.min(100, (tenantOffer / depositAmount) * 100) : 0;
  const landlordPos = landlordOffer != null ? Math.min(100, (landlordOffer / depositAmount) * 100) : 0;

  const willSettle = gapPercent <= 500;
  const settled = status === 'settled';
  const escalated = status === 'escalated';

  return (
    <div className="space-y-8">
      {/* State diagram — Enhancement C */}
      <StateDiagram currentRound={currentRound} status={status} />

      {/* TENANT BAR */}
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

      {/* LANDLORD BAR */}
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

      {/* GAP INDICATOR — Enhancement A (saffron when close) + Enhancement B (urgency escalation) */}
      {tenantOffer != null && landlordOffer != null && (
        <div className="border-t border-line pt-6 text-center">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-mute">Gap</div>
          <div
            className={`font-mono text-5xl font-medium leading-none text-ink transition-all duration-300 ${gapClass(gapPercent)}`}
          >
            {(gapPercent / 100).toFixed(2)}<span className="text-2xl text-mute">%</span>
          </div>

          {/* AUTO-SETTLE ELIGIBLE pill — Enhancement A: saffron pulse */}
          <div className="mt-3 flex justify-center">
            <div
              className={`inline-block rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest transition-all duration-300 ${
                willSettle
                  ? 'bg-saffron/15 text-saffron animate-pulseSaffron'
                  : escalated
                  ? 'bg-landlord/10 text-landlord'
                  : settled
                  ? 'bg-tenant/10 text-tenant'
                  : 'bg-line/60 text-mute'
              }`}
            >
              {settled
                ? 'Settled'
                : escalated
                ? 'Escalated'
                : willSettle
                ? 'Auto-settle eligible'
                : `Need round ${Math.min(3, currentRound + 1)} to close`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
