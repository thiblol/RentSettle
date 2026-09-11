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
