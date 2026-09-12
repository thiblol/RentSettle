import { createCaseAction } from '@/lib/actions/case';
import { redirect } from 'next/navigation';

// Always starts a fresh Whitefield 2BHK demo
export default async function DemoPage() {
  const caseId = await createCaseAction('whitefield-2bhk');
  redirect(`/c/${caseId}/tenant/intake`);
}
