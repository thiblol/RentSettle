'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { DeductionCategory } from '@/lib/rules/types';
import type { Claim } from '@/lib/db/schema';
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
        out[cat] = initialClaims[cat]?.evidenceJson
          ? JSON.parse(initialClaims[cat].evidenceJson).hasEvidence ?? false
          : false;
      } catch {
        out[cat] = false;
      }
    }
    return out;
  });

  const handleRun = () => {
    startTransition(async () => {
      for (const cat of categories) {
        const claim = initialClaims[cat];
        if (!claim) continue;
        const updatedEvidence = JSON.stringify({
          description: (() => {
            try { return JSON.parse(claim.evidenceJson).description ?? ''; }
            catch { return ''; }
          })(),
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
