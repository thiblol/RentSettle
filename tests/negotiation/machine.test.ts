import { describe, it, expect } from 'vitest';
import { negotiationReducer, initialNegotiation } from '@/lib/negotiation/machine';
import { computeGapPercent, shouldAutoSettle } from '@/lib/negotiation/types';

describe('computeGapPercent', () => {
  it('returns 0 when both offers match', () => {
    expect(computeGapPercent(50000, 50000, 200000)).toBe(0);
  });

  it('returns 500 (5%) when gap is ₹10,000 on ₹2L deposit', () => {
    expect(computeGapPercent(55000, 45000, 200000)).toBe(500);
  });
});

describe('shouldAutoSettle', () => {
  it('settles at exactly 5%', () => {
    expect(shouldAutoSettle(500)).toBe(true);
  });

  it('does not settle at 5.01%', () => {
    expect(shouldAutoSettle(501)).toBe(false);
  });
});

describe('negotiationReducer', () => {
  it('records first offer and enters round 1', () => {
    const s = negotiationReducer(initialNegotiation(), { type: 'SUBMIT_OFFER', by: 'tenant', amount: 55000 });
    expect(s.tenantOffer).toBe(55000);
    expect(s.currentRound).toBe(1);
  });

  it('auto-settles when both offers within 5%', () => {
    let s = negotiationReducer(initialNegotiation(), { type: 'SUBMIT_OFFER', by: 'tenant', amount: 52000 });
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'landlord', amount: 50000 });
    expect(s.status).toBe('settled');
  });

  it('escalates after 3 rounds with gap > 5%', () => {
    // Round 1
    let s = negotiationReducer(initialNegotiation(), { type: 'SUBMIT_OFFER', by: 'tenant', amount: 60000 });
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'landlord', amount: 40000 });
    expect(s.currentRound).toBe(2);
    // Round 2
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'tenant', amount: 60000 });
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'landlord', amount: 40000 });
    expect(s.currentRound).toBe(3);
    // Round 3 — gap still > 5%, no more rounds, escalate
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'tenant', amount: 60000 });
    s = negotiationReducer(s, { type: 'SUBMIT_OFFER', by: 'landlord', amount: 40000 });
    expect(s.status).toBe('escalated');
  });
});
