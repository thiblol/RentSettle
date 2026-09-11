import { describe, it, expect } from 'vitest';
import { decideUtilities } from '@/lib/rules/utilities';
import { rupeesToPaise } from '@/lib/money';

describe('decideUtilities', () => {
  it('denies without proof', () => {
    const r = decideUtilities({ category: 'utilities', claimedBy: 'landlord', amountClaimed: rupeesToPaise(4500), hasEvidence: false });
    expect(r.decision).toBe('deny');
    expect(r.amountAllowed).toBe(0);
  });

  it('allows with proof', () => {
    const r = decideUtilities({ category: 'utilities', claimedBy: 'landlord', amountClaimed: rupeesToPaise(4500), hasEvidence: true });
    expect(r.decision).toBe('allow');
    expect(r.amountAllowed).toBe(rupeesToPaise(4500));
  });
});
