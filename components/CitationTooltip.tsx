'use client';
import { useState } from 'react';

type Props = { authority: string; fullText?: string };

export function CitationTooltip({ authority, fullText }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(o => !o)}
        className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-line font-mono text-[10px] font-semibold text-mute transition-colors hover:border-ink hover:text-ink"
        aria-label="Show rule details"
      >?</button>
      {open && (
        <div className="absolute left-1/2 top-7 z-20 w-80 -translate-x-1/2 rounded-lg border border-ink bg-paper p-4 text-xs shadow-lg">
          <div className="font-mono text-[10px] uppercase tracking-widest text-mute">{authority}</div>
          {fullText && <div className="mt-2 font-serif text-sm italic leading-relaxed text-ink">"{fullText}"</div>}
        </div>
      )}
    </span>
  );
}
