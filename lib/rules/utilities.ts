import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

export function decideUtilities(input: ClaimInput): ClaimDecision {
  const authority = [CITATIONS.ka_rent_48a.short, CITATIONS.sc_maula_bux.short].join('; ');

  if (!input.hasEvidence) {
    return {
      category: 'utilities',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'Utility deductions require submitted proof of unpaid bills (Maula Bux v. Union of India). Bare claim denied.',
      citedAuthority: authority
    };
  }

  return {
    category: 'utilities',
    decision: 'allow',
    amountAllowed: input.amountClaimed,
    reasoning: 'Utility deduction supported by submitted bill receipts.',
    citedAuthority: authority
  };
}
