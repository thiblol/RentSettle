'use server';
import { db } from '@/lib/db/client';
import { cases, negotiations, offers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { negotiationReducer } from '@/lib/negotiation/machine';
import { computeGapPercent } from '@/lib/negotiation/types';
import { newId } from '@/lib/ids';

export async function submitOfferAction(caseId: string, by: 'tenant' | 'landlord', amount: number) {
  const c = db.select().from(cases).where(eq(cases.id, caseId)).get();
  if (!c) throw new Error('Case not found');

  const n = db.select().from(negotiations).where(eq(negotiations.caseId, caseId)).get();
  if (!n) throw new Error('Negotiation not found');

  const current = {
    currentRound: n.currentRound,
    tenantOffer: n.tenantOffer,
    landlordOffer: n.landlordOffer,
    status: n.status as 'open' | 'settled' | 'escalated'
  };
  const next = negotiationReducer(current, { type: 'SUBMIT_OFFER', by, amount }, c.depositAmount);

  // Persist offer history
  db.insert(offers).values({
    id: newId(),
    caseId,
    roundNumber: next.currentRound,
    byRole: by,
    amount,
    timestamp: new Date().toISOString()
  }).run();

  // Compute gap
  const gapBps = (next.tenantOffer != null && next.landlordOffer != null)
    ? computeGapPercent(next.tenantOffer, next.landlordOffer, c.depositAmount)
    : 0;

  // Persist negotiation state
  db.update(negotiations).set({
    currentRound: next.currentRound,
    tenantOffer: next.tenantOffer,
    landlordOffer: next.landlordOffer,
    gapPercent: gapBps,
    status: next.status,
    settledAt: next.status === 'settled' ? new Date().toISOString() : null
  }).where(eq(negotiations.caseId, caseId)).run();

  if (next.status === 'settled') {
    db.update(cases).set({ status: 'settled' }).where(eq(cases.id, caseId)).run();
  } else if (next.status === 'escalated') {
    db.update(cases).set({ status: 'escalated' }).where(eq(cases.id, caseId)).run();
  }

  return { ...next, gapPercent: gapBps };
}

export async function loadNegotiationAction(caseId: string) {
  return db.select().from(negotiations).where(eq(negotiations.caseId, caseId)).get();
}

export async function loadOffersAction(caseId: string) {
  return db.select().from(offers).where(eq(offers.caseId, caseId)).all();
}

export async function loadNegotiationStateAction(caseId: string) {
  const n = await loadNegotiationAction(caseId);
  if (!n) return null;
  return {
    currentRound: n.currentRound,
    tenantOffer: n.tenantOffer,
    landlordOffer: n.landlordOffer,
    gapPercent: n.gapPercent,
    status: n.status,
    settledAt: n.settledAt
  };
}
