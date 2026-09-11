export type DeductionCategory = 'painting' | 'fixtures' | 'utilities' | 'unpaid_rent' | 'cleaning';

export type ClaimInput = {
  category: DeductionCategory;
  claimedBy: 'tenant' | 'landlord';
  amountClaimed: number;          // paise
  hasEvidence?: boolean;
  description?: string;
};

export type ClaimDecision = {
  category: DeductionCategory;
  decision: 'allow' | 'deny' | 'cap';
  amountAllowed: number;          // paise
  reasoning: string;              // human-readable
  citedAuthority: string;         // for tooltip
};
