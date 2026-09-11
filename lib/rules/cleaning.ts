import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

export function decideCleaning(input: ClaimInput): ClaimDecision {
  const authority = [CITATIONS.tpa_108m.short, CITATIONS.ka_rent_48d.short].join('; ');

  // Only allow if extreme damage (e.g., pest infestation from tenant actions).
  // For MVP demo: deny by default.
  return {
    category: 'cleaning',
    decision: 'deny',
    amountAllowed: 0,
    reasoning: 'Routine cleaning is normal end-of-tenancy hygiene, not damage (TPA §108(m) reasonable wear exception; Karnataka Rent Act §48(d) limits tenant to day-to-day repairs).',
    citedAuthority: authority
  };
}
