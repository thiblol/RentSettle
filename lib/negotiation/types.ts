export type NegotiationState = {
  currentRound: number;            // 0 = before any offer, 1..3 = in progress
  tenantOffer: number | null;     // paise
  landlordOffer: number | null;   // paise
  status: 'open' | 'settled' | 'escalated';
};

export type NegotiationAction =
  | { type: 'SUBMIT_OFFER'; by: 'tenant' | 'landlord'; amount: number }
  | { type: 'RESET' };

export const MAX_ROUNDS = 3;
export const AUTO_SETTLE_THRESHOLD_BPS = 500; // 5% in basis points (5_00)
export const DEPOSIT_BPS_DENOMINATOR = 10000;

export function computeGapPercent(tenantOffer: number, landlordOffer: number, depositAmount: number): number {
  const gap = Math.abs(tenantOffer - landlordOffer);
  return Math.floor((gap * DEPOSIT_BPS_DENOMINATOR) / depositAmount);
}

export function shouldAutoSettle(gapBps: number): boolean {
  return gapBps <= AUTO_SETTLE_THRESHOLD_BPS;
}
