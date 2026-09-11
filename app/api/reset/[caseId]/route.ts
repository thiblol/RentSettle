import { NextRequest, NextResponse } from 'next/server';
import { resetCase } from '@/lib/db/reset';

export async function POST(_req: NextRequest, { params }: { params: { caseId: string } }) {
  try {
    const id = resetCase(params.caseId);
    return NextResponse.json({ ok: true, caseId: id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
