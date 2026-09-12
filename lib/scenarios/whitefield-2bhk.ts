import type { ClaimInput } from '@/lib/rules/types';
import { rupeesToPaise } from '@/lib/money';

export const whitefield2BHK = {
  id: 'whitefield-2bhk',
  displayName: 'Whitefield 2BHK — Priya vs Rajesh',
  tagline: '₹2,00,000 deposit · 24 months · Painting + tap dispute',
  case: {
    tenantName: 'Priya Sharma',
    landlordName: 'Rajesh Iyer',
    propertyAddress: 'Prestige Shantiniketan, Whitefield, Bangalore — Tower 4, Flat 1207',
    monthlyRent: rupeesToPaise(25000),
    depositAmount: rupeesToPaise(200000),
    moveInDate: '2024-08-01',
    moveOutDate: '2026-08-01'
  },
  // Landlord's claims (deductions being made)
  landlordClaims: [
    { category: 'painting' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(35000), hasEvidence: false, description: 'Full repaint after 24 months' },
    { category: 'fixtures' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(18000), hasEvidence: true, description: 'New geyser + cracked basin replacement' },
    { category: 'utilities' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(4500), hasEvidence: true, description: 'Last 3 months electricity unpaid' },
    { category: 'unpaid_rent' as const, claimedBy: 'landlord' as const, amountClaimed: 0, hasEvidence: false, description: 'N/A' },
    { category: 'cleaning' as const, claimedBy: 'landlord' as const, amountClaimed: rupeesToPaise(12000), hasEvidence: false, description: 'Deep cleaning service' }
  ],
  // Tenant's counter-version
  tenantClaims: [
    { category: 'painting' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'No damage — normal aging. Walls were freshly painted at move-in.' },
    { category: 'fixtures' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Geyser was 8 years old at move-in; basin pre-existing crack' },
    { category: 'utilities' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'All bills paid via UPI — receipts attached' },
    { category: 'unpaid_rent' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'All rent paid' },
    { category: 'cleaning' as const, claimedBy: 'tenant' as const, amountClaimed: 0, hasEvidence: true, description: 'Routine cleaning is normal end-of-tenancy hygiene' }
  ],
  // Rule engine context
  ruleContext: { yearsOfTenancy: 2, monthlyRentPaise: rupeesToPaise(25000), fixtureOriginalCostPaise: rupeesToPaise(30000), unpaidRentMonthsClaimed: 0 },
  // Pre-loaded negotiation scripted to auto-settle by round 2
  negotiationScript: {
    initial: {
      tenantOffer: rupeesToPaise(55000),    // tenant's bottom line
      landlordOffer: rupeesToPaise(45000)    // landlord's bottom line
    },
    round2Adjustment: {
      tenantOffer: rupeesToPaise(52000),
      landlordOffer: rupeesToPaise(50000)    // gap = ₹2,000 / ₹2,00,000 = 1% — auto-settles
    }
  },
  escalationData: {
    tenantFinalPosition: rupeesToPaise(55000),   // ₹55,000 in paise
    landlordFinalPosition: rupeesToPaise(45000), // ₹45,000 in paise
    gapPercent: 500,                            // 5% in basis points (500 bps = 5%)
    escalatedAt: '2026-08-15T10:30:00Z'
  }
};
