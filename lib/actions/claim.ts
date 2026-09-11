'use server';
import { db } from '@/lib/db/client';
import { cases, claims } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { runAll, RuleContext } from '@/lib/rules/engine';
import type { ClaimInput } from '@/lib/rules/types';

export async function runRuleEngineAction(caseId: string): Promise<{ totalAllowed: number; deductionsByCategory: Record<string, number> }> {
  const c = db.select().from(cases).where(eq(cases.id, caseId)).get();
  if (!c) throw new Error(`Case not found`);

  const caseClaims = db.select().from(claims).where(eq(claims.caseId, caseId)).all();
  const landlordClaims = caseClaims.filter(cl => cl.claimedBy === 'landlord');

  // Build rule inputs
  const inputs: ClaimInput[] = landlordClaims.map(cl => ({
    category: cl.category as any,
    claimedBy: 'landlord' as const,
    amountClaimed: cl.amountClaimed,
    hasEvidence: (() => { try { return JSON.parse(cl.evidenceJson).hasEvidence ?? false; } catch { return false; } })(),
    description: (() => { try { return JSON.parse(cl.evidenceJson).description ?? ''; } catch { return ''; } })()
  }));

  // Context for rule engine
  const moveIn = new Date(c.moveInDate);
  const moveOut = new Date(c.moveOutDate);
  const yearsOfTenancy = Math.max(0.5, (moveOut.getTime() - moveIn.getTime()) / (365.25 * 24 * 3600 * 1000));
  const unpaidRentMonths = landlordClaims.find(cl => cl.category === 'unpaid_rent')?.amountClaimed
    ? Math.round((landlordClaims.find(cl => cl.category === 'unpaid_rent')!.amountClaimed) / c.monthlyRent)
    : 0;

  const ctx: RuleContext = {
    yearsOfTenancy,
    monthlyRentPaise: c.monthlyRent,
    fixtureOriginalCostPaise: Math.max(landlordClaims.find(cl => cl.category === 'fixtures')?.amountClaimed ?? 0, 100000),
    unpaidRentMonthsClaimed: unpaidRentMonths
  };

  const decisions = runAll(inputs, ctx);

  // Persist decisions
  for (let i = 0; i < landlordClaims.length; i++) {
    const d = decisions[i];
    const claimRow = landlordClaims[i];
    db.update(claims).set({
      decision: d.decision,
      amountAllowed: d.amountAllowed,
      reasoning: d.reasoning,
      citedAuthority: d.citedAuthority
    }).where(eq(claims.id, claimRow.id)).run();
  }

  // Update case status
  db.update(cases).set({ status: 'calc' }).where(eq(cases.id, caseId)).run();

  const totalAllowed = decisions.reduce((sum, d) => sum + d.amountAllowed, 0);
  const deductionsByCategory = decisions.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = d.amountAllowed;
    return acc;
  }, {});

  return { totalAllowed, deductionsByCategory };
}

export async function loadClaimsAction(caseId: string, role?: 'tenant' | 'landlord') {
  const all = db.select().from(claims).where(eq(claims.caseId, caseId)).all();
  if (role) return all.filter(c => c.claimedBy === role);
  return all;
}

export async function updateClaimAmountAction(claimId: string, amountClaimed: number) {
  db.update(claims).set({ amountClaimed, decision: 'pending', amountAllowed: 0, reasoning: '', citedAuthority: '' })
    .where(eq(claims.id, claimId)).run();
}
