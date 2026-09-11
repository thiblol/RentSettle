import { describe, it, expect } from 'vitest';
import { decideFixtures } from '@/lib/rules/fixtures';
import { rupeesToPaise } from '@/lib/money';

describe('decideFixtures', () => {
  it('denies without evidence', () => {
    const r = decideFixtures({ category: 'fixtures', claimedBy: 'landlord', amountClaimed: rupeesToPaise(18000), hasEvidence: false }, { yearsOfTenancy: 2, originalCostPaise: rupeesToPaise(30000) });
    expect(r.decision).toBe('deny');
  });

  it('caps at 10% per year depreciation over 2 years (max 20% of ₹30,000 = ₹6,000)', () => {
    const r = decideFixtures({ category: 'fixtures', claimedBy: 'landlord', amountClaimed: rupeesToPaise(18000), hasEvidence: true }, { yearsOfTenancy: 2, originalCostPaise: rupeesToPaise(30000) });
    expect(r.decision).toBe('cap');
    expect(r.amountAllowed).toBe(rupeesToPaise(6000)); // 20% of 30000
  });

  it('returns industry-standard citation', () => {
    const r = decideFixtures({ category: 'fixtures', claimedBy: 'landlord', amountClaimed: rupeesToPaise(1000), hasEvidence: true }, { yearsOfTenancy: 1, originalCostPaise: rupeesToPaise(5000) });
    expect(r.citedAuthority).toContain('Industry standard');
  });
});
