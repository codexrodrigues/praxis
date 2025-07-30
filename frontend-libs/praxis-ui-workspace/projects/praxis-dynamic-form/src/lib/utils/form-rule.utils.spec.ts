import { SpecificationFactory } from '@praxis/specification';
import { FormLayoutRule } from '@praxis/core';
import { isRuleSatisfied } from './form-rule.utils';

describe('form rule utilities', () => {
  it('evaluates rule conditions', () => {
    const condition = SpecificationFactory.equals('status', 'active');
    const rule: FormLayoutRule = {
      id: '1',
      name: 'activeVisibility',
      context: 'visibility',
      targetFields: ['status'],
      effect: { condition }
    };

    expect(isRuleSatisfied(rule, { status: 'active' })).toBeTrue();
    expect(isRuleSatisfied(rule, { status: 'inactive' })).toBeFalse();
  });
});
