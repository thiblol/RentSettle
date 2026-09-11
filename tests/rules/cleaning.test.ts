import { describe, it, expect } from 'vitest';
import { decideCleaning } from '@/lib/rules/cleaning';
import { rupeesToPaise } from '@/lib/money';

describe('decideCleaning', () => {
  it('always denies (default MVP behavior)', () => {
    const r = decideCleaning({ category: 'cleaning', claimedBy: 'landlord', amountClaimed: rupeesToPaise(12000), hasEvidence: true });
    expect(r.decision).toBe('deny');
    expect(r.amountAllowed).toBe(0);
  });
});
