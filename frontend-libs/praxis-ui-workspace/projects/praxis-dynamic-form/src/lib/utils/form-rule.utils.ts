import { FormLayoutRule } from '@praxis/core';
import { DslParser, Specification } from '@praxis/specification';

/**
 * Evaluates whether a rule's condition is satisfied for the given data.
 * If no condition is defined, defaults to true.
 */
const parser = new DslParser<any>();

export function isRuleSatisfied(rule: FormLayoutRule, data: unknown): boolean {
  const { condition } = rule.effect;
  if (!condition) {
    return true;
  }

  try {
    let specification: Specification<any>;
    if (typeof condition === 'string') {
      specification = parser.parse(condition);
    } else {
      specification = condition as Specification<any>;
    }
    return specification.isSatisfiedBy(data);
  } catch {
    // If parsing fails, default to visible to avoid blocking the form
    return true;
  }
}

/**
 * Applies all visibility rules to the provided data and
 * returns a map of field name to visibility state.
 */
export function applyVisibilityRules(
  rules: FormLayoutRule[],
  data: any,
): Record<string, boolean> {
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
