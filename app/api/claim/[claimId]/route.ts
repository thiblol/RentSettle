import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { claims } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: { claimId: string } }
) {
  try {
    const body = await request.json();
    const { amountClaimed, evidenceJson } = body;

    const existing = db.select().from(claims).where(eq(claims.id, params.claimId)).get();
    if (!existing) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    db.update(claims).set({
      ...(amountClaimed !== undefined ? { amountClaimed } : {}),
      ...(evidenceJson !== undefined ? { evidenceJson } : {})
    }).where(eq(claims.id, params.claimId)).run();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/claim/[claimId]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
