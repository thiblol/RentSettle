import { loadClaimsAction } from '@/lib/actions/claim';
import { loadCaseAction } from '@/lib/actions/case';
import { StageNav } from '@/components/StageNav';
import { RoleBadge } from '@/components/RoleBadge';
import { ResetButton } from '@/components/ResetButton';
import { TenantIntakeForm } from './TenantIntakeForm';
import { DeductionCategory } from '@/lib/rules/types';

const CATEGORIES: DeductionCategory[] = ['painting', 'fixtures', 'utilities', 'unpaid_rent', 'cleaning'];
const LABELS: Record<DeductionCategory, string> = {
  painting: 'Painting',
  fixtures: 'Fixtures & fittings',
  utilities: 'Utilities (electricity, water)',
  unpaid_rent: 'Unpaid rent',
  cleaning: 'Cleaning'
};

export default async function TenantIntakePage({ params }: { params: { caseId: string } }) {
  const c = await loadCaseAction(params.caseId);
  const claims = await loadClaimsAction(params.caseId, 'tenant');
  const claimsByCategory = Object.fromEntries(claims.map(cl => [cl.category, cl]));

  return (
    <div>
      <div className="mb-12 flex items-end justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-mute">01 · Your side</div>
          <h1 className="font-display text-4xl italic text-ink">Tenant intake.</h1>
          <p className="mt-3 max-w-md text-sm text-mute">
            For each deduction the landlord is making, share your response. Pre-filled for the demo — adjust anything.
          </p>
        </div>
        <ResetButton caseId={c.id} />
      </div>

      <div className="mb-8">
        <RoleBadge role="tenant" />
      </div>

      <div className="mb-8">
        <StageNav caseId={c.id} current="tenant-intake" />
      </div>

      <TenantIntakeForm caseId={c.id} categories={CATEGORIES} labels={LABELS} initialClaims={claimsByCategory} />
    </div>
  );
}
