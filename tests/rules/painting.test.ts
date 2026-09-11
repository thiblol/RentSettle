import { describe, it, expect } from 'vitest';
import { decidePainting } from '@/lib/rules/painting';
import { rupeesToPaise } from '@/lib/money';

describe('decidePainting', () => {
  it('denies claim when no damage evidence (normal wear-and-tear)', () => {
    const result = decidePainting({
      category: 'painting',
      claimedBy: 'landlord',
      amountClaimed: rupeesToPaise(35000),
      hasEvidence: false,
      description: 'Full repaint on move-out'
    });
    expect(result.decision).toBe('deny');
    expect(result.amountAllowed).toBe(0);
    expect(result.citedAuthority).toContain('§108(m)');
    expect(result.citedAuthority).toContain('§47');
  });

  it('allows full claim when damage evidence is provided', () => {
    const result = decidePainting({
      category: 'painting',
      claimedBy: 'landlord',
      amountClaimed: rupeesToPaise(35000),
      hasEvidence: true,
      description: 'Graffiti on 3 walls, tenant-caused'
    });
    expect(result.decision).toBe('allow');
    expect(result.amountAllowed).toBe(rupeesToPaise(35000));
  });
});
