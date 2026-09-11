import Link from 'next/link';
import { cn } from '@/lib/cn';

type Stage = 'tenant-intake' | 'landlord-intake' | 'calc' | 'negotiate' | 'settle';

const STAGES: { key: Stage; label: string; href: (caseId: string) => string }[] = [
  { key: 'tenant-intake', label: 'Tenant', href: id => `/c/${id}/tenant/intake` },
  { key: 'landlord-intake', label: 'Landlord', href: id => `/c/${id}/landlord/intake` },
  { key: 'calc', label: 'Calculation', href: id => `/c/${id}/calc` },
  { key: 'negotiate', label: 'Negotiate', href: id => `/c/${id}/negotiate` },
  { key: 'settle', label: 'Settle', href: id => `/c/${id}/settle` }
];

export function StageNav({ caseId, current }: { caseId: string; current: Stage }) {
  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line py-3">
      {STAGES.map((s, i) => {
        const isCurrent = current === s.key;
        return (
          <Link
            key={s.key}
            href={s.href(caseId)}
            className={cn(
              'group flex items-center gap-2 text-sm transition-colors',
              isCurrent ? 'text-ink' : 'text-mute hover:text-ink'
            )}
          >
            <span className={cn(
              'font-mono text-xs',
              isCurrent ? 'text-saffron' : 'text-mute'
            )}>
              0{i + 1}
            </span>
            <span className={cn(isCurrent && 'font-semibold')}>{s.label}</span>
            {isCurrent && <span className="ml-1 inline-block h-1 w-1 rounded-full bg-saffron" />}
          </Link>
        );
      })}
    </nav>
  );
}
