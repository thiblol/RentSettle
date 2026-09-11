'use client';
import { cn } from '@/lib/cn';

type Role = 'tenant' | 'landlord';

const CONFIG: Record<Role, { label: string; badgeClass: string; dotClass: string }> = {
  tenant: {
    label: 'Tenant view',
    badgeClass: 'bg-tenant/10 text-tenant border border-tenant/20',
    dotClass: 'bg-tenant'
  },
  landlord: {
    label: 'Landlord view',
    badgeClass: 'bg-landlord/10 text-landlord border border-landlord/20',
    dotClass: 'bg-landlord'
  }
};

export function RoleBadge({ role }: { role: Role }) {
  const cfg = CONFIG[role];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-widest', cfg.badgeClass)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dotClass)} />
      {cfg.label}
    </span>
  );
}
