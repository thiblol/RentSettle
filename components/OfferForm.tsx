'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { submitOfferAction } from '@/lib/actions/negotiate';
import { computeGapPercent, shouldAutoSettle } from '@/lib/negotiation/types';

type Props = {
  caseId: string;
  by: 'tenant' | 'landlord';
  currentOffer: number | null;
  otherPartyOffer: number | null;
  depositAmount: number;
};

const COACH_THRESHOLD_BPS = 500; // 5%

export function OfferForm({ caseId, by, currentOffer, otherPartyOffer, depositAmount }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState((currentOffer ?? 50000) / 100);
  const [pending, setPending] = useState(false);

  // Enhancement D: debounce ~150ms so hint doesn't flicker on every keystroke
  const [debouncedAmount, setDebouncedAmount] = useState(amount);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedAmount(amount), 150);
    return () => clearTimeout(t);
  }, [amount]);

  // LIVE: compute hypothetical gap as user types — no server call, pure math
  const livePreview = useMemo(() => {
    if (otherPartyOffer == null) return null;
    const myOfferPaise = Math.round(debouncedAmount * 100);
    const tenant = by === 'tenant' ? myOfferPaise : otherPartyOffer;
    const landlord = by === 'landlord' ? myOfferPaise : otherPartyOffer;
    const gapBps = computeGapPercent(tenant, landlord, depositAmount);
    const settle = shouldAutoSettle(gapBps);
    return { gapBps, settle, gapRupees: Math.abs(tenant - landlord) };
  }, [debouncedAmount, by, otherPartyOffer, depositAmount]);

  const handleSubmit = useCallback(async () => {
    setPending(true);
    const result = await submitOfferAction(caseId, by, Math.round(amount * 100));
    setPending(false);
    if (result.status === 'settled') {
      router.push(`/c/${caseId}/settle`);
    } else {
      router.refresh();
    }
  }, [amount, caseId, by, router]);

  const label = by === 'tenant' ? 'Tenant offer (Rs)' : 'Landlord offer (Rs)';

  // Coach hint logic
  const coachHint = (() => {
    if (livePreview == null) return null;
    if (livePreview.settle) {
      return {
        type: 'settle' as const,
        msg: `Would auto-settle — gap only ${(livePreview.gapBps / 100).toFixed(1)}%`,
        settle: true,
      };
    }
    if (livePreview.gapBps < 1500) {
      const suggestedRupee = by === 'tenant'
        ? Math.ceil((otherPartyOffer! + COACH_THRESHOLD_BPS * depositAmount / 10000) / 100)
        : Math.floor((otherPartyOffer! - COACH_THRESHOLD_BPS * depositAmount / 10000) / 100);
      return {
        type: 'close' as const,
        msg: `Close — ${(livePreview.gapBps / 100).toFixed(1)}% gap. Try Rs ${suggestedRupee.toLocaleString('en-IN')} to settle.`,
        settle: false,
      };
    }
    return {
      type: 'far' as const,
      msg: `${(livePreview.gapBps / 100).toFixed(1)}% gap — needs round 2`,
      settle: false,
    };
  })();

  // Enhancement D: left-border glow classes
  const coachHintClass = coachHint
    ? coachHint.type === 'settle'
      ? 'border-l-4 border-emerald-500 bg-emerald-50 text-emerald-900'
      : coachHint.type === 'close'
      ? 'border-l-4 border-amber-500 bg-amber-50 text-amber-900'
      : 'border-l-4 border-slate-300 bg-slate-50 text-slate-700'
    : '';

  const dotClass = coachHint
    ? coachHint.type === 'settle'
      ? 'bg-emerald-500 animate-pulse'
      : coachHint.type === 'close'
      ? 'bg-amber-500'
      : 'bg-slate-400'
    : '';

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        min={0}
        step={500}
        className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink transition-colors focus:border-saffron focus:ring-2 focus:ring-saffron/20"
      />

      {/* Enhancement D: Live coach hint with left-border glow + pulsing dot */}
      {coachHint && (
        <div className={`rounded-md px-3 py-2 text-xs transition-all duration-200 ${coachHintClass}`}>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
            <span className="font-medium">Coach:</span>
            <span>{coachHint.msg}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={pending}
        className="w-full rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper transition-all hover:bg-ink/80 disabled:opacity-50"
      >
        {pending ? 'Submitting…' : 'Submit offer'}
      </button>
    </div>
  );
}
