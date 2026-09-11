import type { ClaimInput, ClaimDecision } from './types';
import { CITATIONS } from './citations';

export function decidePainting(input: ClaimInput): ClaimDecision {
  const authority = [CITATIONS.tpa_108m.short, CITATIONS.ka_rent_47.short].join('; ');

  if (!input.hasEvidence) {
    return {
      category: 'painting',
      decision: 'deny',
      amountAllowed: 0,
      reasoning: 'Normal wear-and-tear repaint is landlord obligation under TPA §108(m) and Karnataka Rent Act §47. Claim denied.',
      citedAuthority: authority
    };
  }

  return {
    category: 'painting',
    decision: 'allow',
    amountAllowed: input.amountClaimed,
    reasoning: 'Tenant-caused damage evidenced. Full repaint cost allowed.',
    citedAuthority: authority
  };
}
