'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createCaseAction } from '@/lib/actions/case';
import type { ScenarioId } from '@/lib/scenarios';

type Props = { id: ScenarioId; displayName: string; tagline: string };

export function ScenarioCard({ id, displayName, tagline }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const caseId = await createCaseAction(id);
      router.push(`/c/${caseId}/tenant/intake`);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="group flex w-full items-center justify-between rounded-lg border border-line bg-white px-6 py-5 text-left transition-all hover:border-ink hover:shadow-sm disabled:opacity-50"
    >
      <div>
        <div className="text-base font-semibold text-ink">{displayName}</div>
        <div className="mt-1 text-sm text-mute">{tagline}</div>
      </div>
      <div className="font-mono text-xs text-saffron opacity-0 transition-opacity group-hover:opacity-100">
        {isPending ? 'starting…' : 'start →'}
      </div>
    </button>
  );
}
