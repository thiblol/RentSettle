import { NegotiationState, NegotiationAction, MAX_ROUNDS, computeGapPercent, shouldAutoSettle } from './types';

export const initialNegotiation = (): NegotiationState => ({
  currentRound: 0,
  tenantOffer: null,
  landlordOffer: null,
  status: 'open'
});

export function negotiationReducer(state: NegotiationState, action: NegotiationAction, depositAmount: number = 200000): NegotiationState {
  switch (action.type) {
    case 'RESET': return initialNegotiation();

    case 'SUBMIT_OFFER': {
      if (state.status !== 'open') return state;

      const next: NegotiationState = { ...state };
      if (action.by === 'tenant') next.tenantOffer = action.amount;
      else next.landlordOffer = action.amount;

      // First submission ever: enter round 1.
      if (state.currentRound === 0) {
        next.currentRound = 1;
      }

      // Both offers present in current round → check auto-settle, then advance.
      if (next.tenantOffer != null && next.landlordOffer != null) {
        const gapBps = computeGapPercent(next.tenantOffer, next.landlordOffer, depositAmount);
        if (shouldAutoSettle(gapBps)) {
          return { ...next, status: 'settled' };
        }
        // Both sides have offered this round without settling.
        if (state.currentRound >= MAX_ROUNDS) {
          return { ...next, status: 'escalated' };
        }
        next.currentRound = state.currentRound + 1;
      }

      return next;
    }
  }
}
