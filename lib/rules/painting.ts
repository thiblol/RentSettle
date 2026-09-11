import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

export function decidePainting(input: ClaimInput): ClaimDecision {
  const authority = [CITATIONS.tpa_108m.short, CITATIONS.ka_rent_47.short, CITATIONS.ka_rent_48d.short].join('; ');

  if (input.hasEvidence) {
    return {
      category: 'painting',
      decision: 'allow',
      amountAllowed: input.amountClaimed,
      reasoning: 'Damage beyond normal wear-and-tear with evidence — landlord claim allowed.',
      citedAuthority: authority
    };
  }

  return {
    category: 'painting',
    decision: 'deny',
    amountAllowed: 0,
    reasoning: 'No evidence of damage beyond normal wear-and-tear. Periodic repainting is structural maintenance, the landlord\'s duty under Karnataka Rent Act §47.',
    citedAuthority: authority
  };
}
