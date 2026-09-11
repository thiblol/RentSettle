import { describe, it, expect } from 'vitest';
import { runRuleEngine, runAll } from '@/lib/rules/engine';
import { rupeesToPaise } from '@/lib/money';

const ctx = { yearsOfTenancy: 2, monthlyRentPaise: rupeesToPaise(25000), fixtureOriginalCostPaise: rupeesToPaise(30000), unpaidRentMonthsClaimed: 0 };

describe('runRuleEngine', () => {
  it('routes painting to decidePainting', () => {
    const r = runRuleEngine({ category: 'painting', claimedBy: 'landlord', amountClaimed: rupeesToPaise(35000), hasEvidence: false }, 'painting', ctx);
    expect(r.decision).toBe('deny');
  });

  it('routes cleaning to decideCleaning', () => {
    const r = runRuleEngine({ category: 'cleaning', claimedBy: 'landlord', amountClaimed: rupeesToPaise(12000), hasEvidence: true }, 'cleaning', ctx);
    expect(r.decision).toBe('deny');
  });
});

describe('runAll', () => {
  it('handles 5 claims at once', () => {
    const claims = [
      { category: 'painting' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(35000), hasEvidence: false },
      { category: 'fixtures' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(18000), hasEvidence: true },
      { category: 'utilities' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(4500), hasEvidence: true },
      { category: 'unpaid_rent' as const, claimedBy: 'landlord' as const, amountClaimed: 0, hasEvidence: false },
      { category: 'cleaning' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(12000), hasEvidence: true }
    ];
    const decisions = runAll(claims, ctx);
    expect(decisions).toHaveLength(5);
    expect(decisions[0].decision).toBe('deny');
    expect(decisions[1].decision).toBe('cap');
    expect(decisions[2].decision).toBe('allow');
    expect(decisions[3].decision).toBe('deny');
    expect(decisions[4].decision).toBe('deny');
  });
});
