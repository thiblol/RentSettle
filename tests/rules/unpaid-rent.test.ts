import { describe, it, expect } from 'vitest';
import { decideUnpaidRent } from '@/lib/rules/unpaid-rent';
import { rupeesToPaise } from '@/lib/money';

describe('decideUnpaidRent', () => {
  it('denies when 0 months claimed', () => {
    const r = decideUnpaidRent({ category: 'unpaid_rent', claimedBy: 'landlord', amountClaimed: 0, hasEvidence: false }, { monthlyRentPaise: rupeesToPaise(25000), claimedMonths: 0 });
    expect(r.decision).toBe('deny');
  });

  it('allows strict arithmetic 2 months × ₹25,000 = ₹50,000', () => {
    const r = decideUnpaidRent({ category: 'unpaid_rent', claimedBy: 'landlord', amountClaimed: rupeesToPaise(50000), hasEvidence: true }, { monthlyRentPaise: rupeesToPaise(25000), claimedMonths: 2 });
    expect(r.decision).toBe('allow');
    expect(r.amountAllowed).toBe(rupeesToPaise(50000));
  });
});
