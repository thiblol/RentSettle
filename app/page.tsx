import { SCENARIOS } from '@/lib/scenarios';
import { ScenarioCard } from '@/components/ScenarioCard';

export default function Home() {
  return (
    <main className="mx-auto max-w-content px-8 py-24 animate-fadeIn">
      {/* Live indicator — small, top-right of page */}
      <div className="mb-16 flex items-center gap-2 text-xs text-mute">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-saffron animate-pulseSaffron" />
        <span className="font-mono uppercase tracking-widest">Live demo · {SCENARIOS.length} scenarios loaded</span>
      </div>

      {/* Hero */}
      <header className="mb-20 max-w-prose">
        <div className="mb-6 flex items-baseline gap-3">
          <h1 className="font-display text-hero italic text-ink">
            RentSettle
          </h1>
          <span className="inline-block h-3 w-3 rounded-full bg-saffron translate-y-[-8px]" aria-hidden />
        </div>
        <p className="text-2xl leading-snug text-ink">
          Resolve your deposit dispute in <span className="font-display italic">minutes</span>,<br />
          not fourteen months of court.
        </p>
        <p className="mt-6 max-w-md text-base text-mute">
          A working ODR platform built on Karnataka's Rent Act and Supreme Court precedent.
          Pick a dispute below to walk one through from intake to settlement PDF.
        </p>
      </header>

      {/* Section eyebrow */}
      <div className="mb-6 flex items-center gap-4">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-mute">01 · Pick a dispute</div>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* Scenario cards */}
      <div className="grid gap-3">
        {SCENARIOS.map(s => (
          <ScenarioCard key={s.id} id={s.id} displayName={s.displayName} tagline={s.tagline} />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-24 flex items-center justify-between border-t border-line pt-6 text-xs text-mute">
        <span className="font-mono uppercase tracking-widest">
          Applies federal + Karnataka law. Not legal advice.
        </span>
        <a href="/showcase/mediator" className="underline decoration-line decoration-1 underline-offset-4 hover:text-ink">
          What if they can't agree? →
        </a>
      </div>
    </main>
  );
}
