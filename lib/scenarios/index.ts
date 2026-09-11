import { whitefield2BHK } from './whitefield-2bhk';
import { koramangala1BHK } from './koramangala-1bhk';
import { indiranagar3BHK } from './indiranagar-3bhk';

export const SCENARIOS = [whitefield2BHK, koramangala1BHK, indiranagar3BHK] as const;

export type ScenarioId = typeof SCENARIOS[number]['id'];

export function getScenario(id: ScenarioId) {
  const s = SCENARIOS.find(x => x.id === id);
  if (!s) throw new Error(`Unknown scenario: ${id}`);
  return s;
}
