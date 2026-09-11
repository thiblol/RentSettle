import { db } from './client';
import { cases, claims, negotiations, offers } from './schema';
import { eq } from 'drizzle-orm';
import { getScenario } from '@/lib/scenarios';
import { newId } from '@/lib/ids';

export function resetCase(caseId: string): string {
  const caseRow = db.select().from(cases).where(eq(cases.id, caseId)).get();
  if (!caseRow) throw new Error(`Case not found: ${caseId}`);

  const scenario = getScenario(caseRow.scenarioId as any);

  // Wipe related rows
  db.delete(offers).where(eq(offers.caseId, caseId)).run();
  db.delete(negotiations).where(eq(negotiations.caseId, caseId)).run();
  db.delete(claims).where(eq(claims.caseId, caseId)).run();

  // Re-seed claims
  for (const c of [...scenario.landlordClaims, ...scenario.tenantClaims]) {
    db.insert(claims).values({
      id: newId(),
      caseId,
      category: c.category,
      claimedBy: c.claimedBy,
      amountClaimed: c.amountClaimed,
      evidenceJson: JSON.stringify({ description: c.description, hasEvidence: c.hasEvidence }),
      decision: 'pending',
      amountAllowed: 0,
      reasoning: '',
      citedAuthority: ''
    }).run();
  }

  // Re-seed negotiation
  db.insert(negotiations).values({
    id: newId(),
    caseId,
    currentRound: 0,
    tenantOffer: null,
    landlordOffer: null,
    gapPercent: 0,
    status: 'open',
    settledAt: null
  }).run();

  db.update(cases).set({ status: 'intake' }).where(eq(cases.id, caseId)).run();

  return caseId;
}
