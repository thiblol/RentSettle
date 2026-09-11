import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadCaseAction } from '@/lib/actions/case';

export default async function CaseLayout({ children, params }: { children: React.ReactNode; params: { caseId: string } }) {
  const c = await loadCaseAction(params.caseId);
  if (!c) notFound();

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-content flex-wrap items-baseline justify-between gap-3 px-8 py-4">
          <div className="flex items-baseline gap-3">
            <Link href="/" className="font-display text-xl italic text-ink">RentSettle</Link>
            <span className="font-mono text-[10px] uppercase tracking-widest text-mute">/ case</span>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-ink">{c.tenantName} <span className="text-mute">vs</span> {c.landlordName}</div>
            <div className="text-xs text-mute">{c.propertyAddress}</div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-content px-8 py-12 animate-fadeIn">{children}</main>
    </div>
  );
}
