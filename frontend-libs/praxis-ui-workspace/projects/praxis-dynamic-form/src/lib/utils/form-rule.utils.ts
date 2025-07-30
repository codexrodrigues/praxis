import { FormLayoutRule } from '../models/form-layout.model';

/**
 * Evaluates whether a rule's condition is satisfied for the given data.
 * If no condition is defined, defaults to true.
 */
export function isRuleSatisfied(rule: FormLayoutRule, data: any): boolean {
  if (!rule.effect.condition) {
    return true;
  }
  try {
    return rule.effect.condition.isSatisfiedBy(data);
  } catch {
    return true;
  }
}

/**
 * Applies all visibility rules to the provided data and
 * returns a map of field name to visibility state.
 */
export function applyVisibilityRules(rules: FormLayoutRule[], data: any): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  for (const rule of rules) {
    if (rule.context !== 'visibility') {
      continue;
    }
    const visible = isRuleSatisfied(rule, data);
    for (const field of rule.targetFields) {
      result[field] = visible;
    }
  }
  return result;
}
