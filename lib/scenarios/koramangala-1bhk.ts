import type { ClaimInput } from '@/lib/rules/types';
import { rupeesToPaise } from '@/lib/money';

export const koramangala1BHK = {
  id: 'koramangala-1bhk',
  displayName: 'Koramangala 1BHK — Amit vs Sunita',
  tagline: '₹90,000 deposit · 18 months · Real damage',
  case: {
    tenantName: 'Amit Verma',
    landlordName: 'Sunita Reddy',
    propertyAddress: '5th Block, Koramangala, Bangalore — 2nd Floor, No. 412',
    monthlyRent: rupeesToPaise(18000),
    depositAmount: rupeesToPaise(90000),
    moveInDate: '2024-12-01',
    moveOutDate: '2026-06-01'
  },
  landlordClaims: [
    { category: 'painting' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(15000), hasEvidence: true, description: 'Tenant-caused stains and a cigarette burn on living room wall' },
    { category: 'fixtures' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(8000), hasEvidence: true, description: 'Broken wardrobe handle + missing curtain rod' },
    { category: 'utilities' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(2200), hasEvidence: false, description: 'Last 2 months electricity (no receipts)' },
    { category: 'unpaid_rent' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(18000), hasEvidence: true, description: '1 month unpaid (final month)' },
    { category: 'cleaning' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(6000), hasEvidence: false, description: 'Deep cleaning' }
  ],
  tenantClaims: [
    { category: 'painting' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Stain was pre-existing; cigarette burn is true, accept partial' },
    { category: 'fixtures' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Accept partial — items old' },
    { category: 'utilities' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'All paid, will provide UPI records' },
    { category: 'unpaid_rent' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Dispute — paid via cash to landlord\'s brother' },
    { category: 'cleaning' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Routine cleaning denied' }
  ],
  ruleContext: { yearsOfTenancy: 1.5, monthlyRentPaise: rupeesToPaise(18000), fixtureOriginalCostPaise: rupeesToPaise(15000), unpaidRentMonthsClaimed: 1 },
  negotiationScript: {
    initial: { tenantOffer: rupeesToPaise(18000), landlordOffer: rupeesToPaise(15000) },
    round2Adjustment: { tenantOffer: rupeesToPaise(17000), landlordOffer: rupeesToPaise(16500) }
  }
};
