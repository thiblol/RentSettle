'use server';
import { db } from '@/lib/db/client';
import { cases, claims, negotiations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getScenario, ScenarioId, SCENARIOS } from '@/lib/scenarios';
import { resetCase } from '@/lib/db/reset';
import { newId } from '@/lib/ids';

export async function createCaseAction(scenarioId: ScenarioId): Promise<string> {
  const scenario = getScenario(scenarioId);
  const caseId = newId();
  const now = new Date().toISOString();

  db.insert(cases).values({
    id: caseId,
    scenarioId,
    tenantName: scenario.case.tenantName,
    landlordName: scenario.case.landlordName,
    propertyAddress: scenario.case.propertyAddress,
    monthlyRent: scenario.case.monthlyRent,
    depositAmount: scenario.case.depositAmount,
    moveInDate: scenario.case.moveInDate,
    moveOutDate: scenario.case.moveOutDate,
    status: 'intake',
    createdAt: now
  }).run();

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

  return caseId;
}

export async function loadCaseAction(caseId: string) {
  const c = db.select().from(cases).where(eq(cases.id, caseId)).get();
  if (!c) throw new Error(`Case not found: ${caseId}`);
  return c;
}

export async function resetCaseAction(caseId: string): Promise<string> {
  return resetCase(caseId);
}

export async function listScenariosAction() {
  return SCENARIOS.map(s => ({ id: s.id, displayName: s.displayName, tagline: s.tagline }));
}
