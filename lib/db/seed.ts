import { db } from './client';
import { cases, claims, negotiations } from './schema';
import { SCENARIOS, getScenario } from '@/lib/scenarios';
import { newId } from '@/lib/ids';

async function seedOne(scenarioId: string) {
  const s = getScenario(scenarioId as any);
  const caseId = newId();
  const now = new Date().toISOString();

  db.insert(cases).values({
    id: caseId,
    scenarioId: s.id,
    tenantName: s.case.tenantName,
    landlordName: s.case.landlordName,
    propertyAddress: s.case.propertyAddress,
    monthlyRent: s.case.monthlyRent,
    depositAmount: s.case.depositAmount,
    moveInDate: s.case.moveInDate,
    moveOutDate: s.case.moveOutDate,
    status: 'intake',
    createdAt: now
  }).run();

  for (const c of [...s.landlordClaims, ...s.tenantClaims]) {
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

export async function seedAll() {
  const ids: Record<string, string> = {};
  for (const s of SCENARIOS) {
    ids[s.id] = await seedOne(s.id);
  }
  return ids;
}

if (require.main === module) {
  // Clear all data
  db.delete(negotiations).run();
  db.delete(claims).run();
  db.delete(cases).run();
  seedAll().then(ids => {
    console.log('Seeded cases:', ids);
    process.exit(0);
  });
}
