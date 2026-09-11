'use client';
import { useState } from 'react';
import { CITATIONS, CitationKey } from '@/lib/rules/citations';
import { DeductionCategory } from '@/lib/rules/types';

type RuleData = { authority: CitationKey[]; explanation: string; isIndustryStandard?: boolean };

const RULES: Record<DeductionCategory, RuleData> = {
  painting: {
    authority: ['tpa_108m', 'ka_rent_47', 'ka_rent_48d'],
    explanation: "Periodic repainting for normal aging is structural maintenance — landlord's duty. Tenant pays only for damage beyond normal wear-and-tear."
  },
  fixtures: {
    authority: ['tpa_108m', 'sc_fateh_chand', 'industry_10pct'],
    explanation: 'Fixtures are depreciated using an industry-standard 10% per year convention. The cap is NOT statutory; it depends on age, condition, and original cost.',
    isIndustryStandard: true
  },
  utilities: {
    authority: ['ka_rent_48a', 'sc_maula_bux'],
    explanation: 'Utility deductions require submitted proof (bills, payment receipts). Bare claims without evidence are denied.'
  },
  unpaid_rent: {
    authority: ['ka_rent_48a'],
    explanation: 'Unpaid rent is a direct contractual obligation. Strict arithmetic: months owed × monthly rent. Proof of arrears required.'
  },
  cleaning: {
    authority: ['tpa_108m', 'ka_rent_48d'],
    explanation: 'Routine cleaning is normal end-of-tenancy hygiene, not damage. Denied unless extreme (e.g., pest infestation from tenant actions).'
  }
};

export function RuleExplainer({ category }: { category: DeductionCategory }) {
  const [open, setOpen] = useState(false);
  const rule = RULES[category];

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-baseline justify-between border-b border-line py-2 text-left font-mono text-[10px] uppercase tracking-widest text-mute transition-colors hover:text-ink"
      >
        <span>About this rule</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {rule.isIndustryStandard && (
            <div className="inline-block rounded-sm border border-saffron bg-saffron/10 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-saffron">
              Industry standard \xb7 not statutory
            </div>
          )}
          <p className="font-serif text-sm leading-relaxed text-ink">{rule.explanation}</p>
          <div className="space-y-2 border-l border-line pl-3">
            {rule.authority.map(k => (
              <div key={k} className="text-xs">
                <div className="font-mono text-[10px] uppercase tracking-widest text-mute">{CITATIONS[k].short}</div>
                <div className="mt-0.5 font-serif italic text-ink">"{CITATIONS[k].full}"</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
