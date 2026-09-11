import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

export function decideUnpaidRent(input: ClaimInput, _ctx: { monthlyRentPaise: number; claimedMonths: number }): ClaimDecision {
  const authority = CITATIONS.ka_rent_48a.short;

  if (_ctx.claimedMonths <= 0) {
    return {
      category: 'unpaid_rent',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'No unpaid rent claimed.',
      citedAuthority: authority
    };
  }

  if (!input.hasEvidence) {
    return {
      category: 'unpaid_rent',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'Unpaid rent claim requires evidence of arrears (rent receipts, notice).',
      citedAuthority: authority
    };
  }

  const amountAllowed = _ctx.monthlyRentPaise * _ctx.claimedMonths;
  return {
    category: 'unpaid_rent',
    decision: 'allow',
    amountAllowed,
    reasoning: `${_ctx.claimedMonths} months × ${(_ctx.monthlyRentPaise / 100).toLocaleString('en-IN')} = strict arithmetic per Karnataka Rent Act §48(a).`,
    citedAuthority: authority
  };
}
