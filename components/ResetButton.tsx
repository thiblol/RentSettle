'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { resetCaseAction } from '@/lib/actions/case';

export function ResetButton({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    if (!confirm('Reset to demo data? This will wipe all claims and negotiation history.')) return;
    startTransition(async () => {
      await resetCaseAction(caseId);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleReset}
      disabled={isPending}
      className="font-mono text-[11px] uppercase tracking-widest text-mute transition-colors hover:text-ink disabled:opacity-50"
    >
      {isPending ? 'resetting…' : '↻ reset to demo data'}
    </button>
  );
}
