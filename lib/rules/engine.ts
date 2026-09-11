import type { ClaimInput, ClaimDecision, DeductionCategory } from './types';
import { decidePainting } from './painting';
import { decideFixtures } from './fixtures';
import { decideUtilities } from './utilities';
import { decideUnpaidRent } from './unpaid-rent';
import { decideCleaning } from './cleaning';

export type RuleContext = {
  yearsOfTenancy: number;
  monthlyRentPaise: number;
  fixtureOriginalCostPaise: number;
  unpaidRentMonthsClaimed: number;
};

export function runRuleEngine(input: ClaimInput, category: DeductionCategory, ctx: RuleContext): ClaimDecision {
  switch (category) {
    case 'painting': return decidePainting(input);
    case 'fixtures': return decideFixtures(input, { yearsOfTenancy: ctx.yearsOfTenancy, originalCostPaise: ctx.fixtureOriginalCostPaise });
    case 'utilities': return decideUtilities(input);
    case 'unpaid_rent': return decideUnpaidRent(input, { monthlyRentPaise: ctx.monthlyRentPaise, claimedMonths: ctx.unpaidRentMonthsClaimed });
    case 'cleaning': return decideCleaning(input);
  }
}

export function runAll(claims: ClaimInput[], ctx: RuleContext): ClaimDecision[] {
  return claims.map(c => runRuleEngine(c, c.category, ctx));
}
