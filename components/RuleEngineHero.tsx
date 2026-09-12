'use client';
import { useEffect, useState } from 'react';
import { formatRupees } from '@/lib/money';
import type { Claim } from '@/lib/db/schema';
import type { DeductionCategory } from '@/lib/rules/types';

export type ClaimDisplay = Pick<Claim, 'category' | 'amountClaimed' | 'amountAllowed' | 'decision' | 'reasoning' | 'citedAuthority'>;

interface RuleEngineHeroProps {
  claims: ClaimDisplay[];
}

const CATEGORY_LABELS: Record<DeductionCategory, string> = {
  painting: 'Painting',
  fixtures: 'Fixtures & fittings',
  utilities: 'Utilities',
  unpaid_rent: 'Unpaid rent',
  cleaning: 'Cleaning'
};

export function RuleEngineHero({ claims }: RuleEngineHeroProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  // Show the first non-zero claim as the featured example
  const featuredClaim = claims.find(cl => cl.amountClaimed > 0) ?? claims[0];
  const featuredLabel = CATEGORY_LABELS[featuredClaim?.category as DeductionCategory] ?? 'Claim';

  useEffect(() => {
    setRevealedCount(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Steps: 0→1→2→3→verdict
    timers.push(setTimeout(() => setRevealedCount(1), 300));
    timers.push(setTimeout(() => setRevealedCount(2), 600));
    timers.push(setTimeout(() => setRevealedCount(3), 900));
    timers.push(setTimeout(() => setRevealedCount(4), 1200));
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleViewBreakdown = () => {
    const el = document.getElementById('deduction-breakdown');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const isDenied = featuredClaim?.decision === 'deny' || featuredClaim?.amountAllowed === 0;

  return (
    <div className="rounded-lg border border-line bg-white p-8 text-center">
      {/* Section label */}
      <div className="mb-6 text-left">
        <span className="font-mono text-[11px] uppercase tracking-widest text-saffron">
          Rule engine is running&hellip;
        </span>
      </div>

      {/* Steps row */}
      <div className="flex flex-col items-center gap-3 overflow-hidden sm:flex-row sm:flex-wrap sm:items-start sm:justify-center">
        {/* Step 1: Claim received */}
        <div
          className={`w-full overflow-hidden rounded-md border border-line bg-white px-4 py-3 transition-all duration-300 sm:flex-none sm:w-72 ${
            revealedCount >= 1 ? 'border-saffron/30 bg-saffron/5 opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-saffron text-xs font-bold text-white">1</div>
            <div className="min-w-0 text-left">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">Claim received</div>
              <div className="mt-0.5 font-serif text-sm italic leading-relaxed text-mute truncate">
                {featuredClaim && `${featuredLabel}: ${formatRupees(featuredClaim.amountClaimed)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className={`hidden text-xl text-mute transition-all duration-300 sm:block ${revealedCount >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          &rarr;
        </div>

        {/* Step 2: Rule check */}
        <div
          className={`w-full overflow-hidden rounded-md border border-line bg-white px-4 py-3 transition-all duration-300 sm:flex-none sm:w-72 ${
            revealedCount >= 2 ? 'border-saffron/30 bg-saffron/5 opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-saffron text-xs font-bold text-white">2</div>
            <div className="min-w-0 text-left">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">Rule check</div>
              <div className="mt-0.5 font-serif text-sm italic leading-relaxed text-mute">
                <span className="break-words">{featuredClaim?.citedAuthority || 'Karnataka Rent Act applied'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className={`hidden text-xl text-mute transition-all duration-300 sm:block ${revealedCount >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          &rarr;
        </div>

        {/* Step 3: Outcome */}
        <div
          className={`w-full overflow-hidden rounded-md border border-line bg-white px-4 py-3 transition-all duration-300 sm:flex-none sm:w-72 ${
            revealedCount >= 3 ? 'border-saffron/30 bg-saffron/5 opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-saffron text-xs font-bold text-white">3</div>
            <div className="min-w-0 text-left">
              <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">Outcome</div>
              <div className="mt-0.5 font-serif text-sm italic leading-relaxed text-mute">
                {isDenied ? 'Wear-and-tear exclusion' : featuredClaim?.reasoning?.substring(0, 50) ?? 'Rule applied'}
                {(featuredClaim?.reasoning?.length ?? 0) > 50 ? '…' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className={`hidden text-xl text-mute transition-all duration-300 sm:block ${revealedCount >= 4 ? 'opacity-100' : 'opacity-0'}`}>
          &rarr;
        </div>

        {/* Verdict badge */}
        <div
          className={`w-full flex-col items-center gap-1 rounded-lg border-2 px-5 py-4 transition-all duration-500 sm:flex-none sm:w-auto sm:items-start ${
            revealedCount >= 4
              ? isDenied
                ? 'border-red-200 bg-red-50 opacity-100 scale-100'
                : 'border-saffron/40 bg-saffron/5 opacity-100 scale-100'
              : 'border-slate-200 bg-slate-50 opacity-0 scale-95'
          }`}
          style={{ display: 'flex' }}
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Verdict</span>
          <span className={`font-mono text-sm font-bold uppercase tracking-wide ${isDenied ? 'text-red-600' : 'text-landlord'}`}>
            {isDenied ? 'Denied' : featuredClaim?.decision === 'cap' ? 'Capped' : 'Allowed'}
          </span>
          <span className={`font-mono text-2xl font-bold ${isDenied ? 'text-red-500' : 'text-landlord'}`}>
            {formatRupees(featuredClaim?.amountAllowed ?? 0)}
          </span>
        </div>
      </div>

      {/* View breakdown button */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleViewBreakdown}
          className="font-mono text-[11px] uppercase tracking-widest text-mute transition-colors hover:text-ink"
        >
          View breakdown &darr;
        </button>
      </div>
    </div>
  );
}
