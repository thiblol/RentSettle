'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { DeductionCategory } from '@/lib/rules/types';
import type { Claim } from '@/lib/db/schema';
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
