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

function getSteps(category: DeductionCategory, hasEvidence: boolean, yearsOfTenancy: number) {
  switch (category) {
    case 'painting':
      return [
        { icon: '1', label: 'Claim received', detail: 'landlord claims for repainting' },
        { icon: '2', label: 'Rule check', detail: hasEvidence ? 'Evidence provided → damage beyond wear' : 'No evidence → apply TPA §108(m) wear exception' },
        { icon: '3', label: 'Outcome', detail: hasEvidence ? 'Damage qualifies as tenant liability' : "Normal wear — landlord's duty per KA Rent §47" }
      ];
    case 'fixtures':
      return [
        { icon: '1', label: 'Claim received', detail: 'landlord claims for fixture damage' },
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
  const [revealedSteps, setRevealedSteps] = useState(0);

  useEffect(() => {
    setRevealedSteps(0);
    const timers: NodeJS.Timeout[] = [];
    // Step 1 at 0ms, Step 2 at 200ms, Step 3 at 400ms, Final at 600ms
    for (let i = 1; i <= 3; i++) {
      timers.push(setTimeout(() => setRevealedSteps(i), i * 200));
    }
    timers.push(setTimeout(() => setRevealedSteps(4), 600));
    return () => timers.forEach(clearTimeout);
  }, [claim.category, claim.amountClaimed, claim.amountAllowed, claim.decision]);

  const hasEvidence = claim.decision === 'allow' || (claim.decision === 'cap' && claim.amountAllowed > 0);
  const yearsOfTenancy = 2;
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
          revealedSteps >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="text-[10px] font-bold uppercase tracking-wider">Final</div>
          <div className="text-sm font-bold">{decisionLabel}</div>
        </div>
      </div>
    </div>
  );
}
