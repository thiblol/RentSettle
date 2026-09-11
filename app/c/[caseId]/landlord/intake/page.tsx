import { loadClaimsAction } from '@/lib/actions/claim';
import { loadCaseAction } from '@/lib/actions/case';
import { StageNav } from '@/components/StageNav';
import { RoleBadge } from '@/components/RoleBadge';
import { ResetButton } from '@/components/ResetButton';
import { LandlordIntakeForm } from './LandlordIntakeForm';
import { DeductionCategory } from '@/lib/rules/types';

const CATEGORIES: DeductionCategory[] = ['painting', 'fixtures', 'utilities', 'unpaid_rent', 'cleaning'];
const LABELS: Record<DeductionCategory, string> = {
  painting: 'Painting',
  fixtures: 'Fixtures & fittings',
  utilities: 'Utilities (electricity, water)',
  unpaid_rent: 'Unpaid rent',
  cleaning: 'Cleaning'
};

export default async function LandlordIntakePage({ params }: { params: { caseId: string } }) {
  const c = await loadCaseAction(params.caseId);
  const claims = await loadClaimsAction(params.caseId, 'landlord');
  const claimsByCategory = Object.fromEntries(claims.map(cl => [cl.category, cl]));

  return (
    <div>
      <div className="mb-12 flex items-end justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-mute">02 · Your claims</div>
          <h1 className="font-display text-4xl italic text-ink">Landlord intake.</h1>
          <p className="mt-3 max-w-md text-sm text-mute">
            State your deductions and evidence. Pre-filled for the demo — adjust as needed.
          </p>
        </div>
        <ResetButton caseId={c.id} />
      </div>

      <div className="mb-8">
        <RoleBadge role="landlord" />
      </div>

      <div className="mb-8">
        <StageNav caseId={c.id} current="landlord-intake" />
      </div>

      <LandlordIntakeForm caseId={c.id} categories={CATEGORIES} labels={LABELS} initialClaims={claimsByCategory} />
    </div>
  );
}
