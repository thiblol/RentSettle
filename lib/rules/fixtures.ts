import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

// Industry-standard 10% annual depreciation cap.
// NOT statutory — must be labelled as industry standard in tooltips.
const ANNUAL_DEPRECIATION_PCT = 10;
const TYPICAL_USEFUL_LIFE_YEARS = 10;
const MAX_DEPRECIATION_PCT = 90; // never depreciate below 10% of original

export function decideFixtures(input: ClaimInput, _ctx: { yearsOfTenancy: number; originalCostPaise: number }): ClaimDecision {
  const authority = [CITATIONS.tpa_108m.short, CITATIONS.sc_fateh_chand.short, CITATIONS.industry_10pct.short].join('; ');

  if (!input.hasEvidence) {
    return {
      category: 'fixtures',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'No evidence of damage or itemised bills. Bare assertion insufficient per Kamal Kumar v. Premlata Joshi.',
      citedAuthority: authority
    };
  }

  // Cap using industry-standard 10% per year depreciation, but never more than claimed.
  const annualDepreciation = Math.floor((_ctx.originalCostPaise * ANNUAL_DEPRECIATION_PCT) / 100);
  const totalDepreciation = Math.min(annualDepreciation * _ctx.yearsOfTenancy, _ctx.originalCostPaise * MAX_DEPRECIATION_PCT / 100);
  const capped = Math.min(input.amountClaimed, Math.floor(totalDepreciation));

  if (capped === 0) {
    return {
      category: 'fixtures',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'Fixtures fully depreciated under industry-standard 10% per year convention over the tenancy period.',
      citedAuthority: authority
    };
  }

  if (capped < input.amountClaimed) {
    return {
      category: 'fixtures',
      decision: 'cap',
      amountAllowed: capped,
      reasoning: `Claim capped at industry-standard depreciation (10% per year × ${_ctx.yearsOfTenancy} years of ${TYPICAL_USEFUL_LIFE_YEARS}-year useful life).`,
      citedAuthority: authority
    };
  }

  return {
    category: 'fixtures',
    decision: 'allow',
    amountAllowed: input.amountClaimed,
    reasoning: 'Within industry-standard depreciation cap.',
    citedAuthority: authority
  };
}
