import { rupeesToPaise } from '@/lib/money';

export const indiranagar3BHK = {
  id: 'indiranagar-3bhk',
  displayName: 'Indiranagar 3BHK — Sneha & Karthik vs Farooq',
  tagline: '₹4,50,000 deposit · 36 months · High-value dispute',
  case: {
    tenantName: 'Sneha Iyer',
    landlordName: 'Mohammed Farooq',
    propertyAddress: '12th Main, Indiranagar, Bangalore — Independent House, Ground Floor',
    monthlyRent: rupeesToPaise(45000),
    depositAmount: rupeesToPaise(450000),
    moveInDate: '2023-09-01',
    moveOutDate: '2026-09-01'
  },
  landlordClaims: [
    { category: 'painting' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(60000), hasEvidence: false, description: 'Full repaint of all rooms after 3 years' },
    { category: 'fixtures' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(45000), hasEvidence: true, description: 'AC servicing + broken exhaust fan + cracked tile' },
    { category: 'utilities' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(8500), hasEvidence: false, description: 'Water bills (no proof)' },
    { category: 'unpaid_rent' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(90000), hasEvidence: true, description: '2 months unpaid during COVID hardship (with notice)' },
    { category: 'cleaning' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(18000), hasEvidence: true, description: 'Pest control service (cockroach infestation from kitchen grease)' }
  ],
  tenantClaims: [
    { category: 'painting' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Normal aging' },
    { category: 'fixtures' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Accept exhaust fan and tile; dispute AC servicing (pre-existing)' },
    { category: 'utilities' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'All paid via online portal' },
    { category: 'unpaid_rent' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Dispute — disputed notice validity' },
    { category: 'cleaning' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Accept pest control (kitchen grease was tenant issue)' }
  ],
  ruleContext: { yearsOfTenancy: 3, monthlyRentPaise: rupeesToPaise(45000), fixtureOriginalCostPaise: rupeesToPaise(80000), unpaidRentMonthsClaimed: 2 },
  negotiationScript: {
    initial: { tenantOffer: rupeesToPaise(45000), landlordOffer: rupeesToPaise(35000) },
    round2Adjustment: { tenantOffer: rupeesToPaise(42000), landlordOffer: rupeesToPaise(40000) }
  }
};
