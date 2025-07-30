import { FormContextService } from './form-context.service';
import { FormLayoutRule } from '@praxis/core';

describe('FormContextService', () => {
  let service: FormContextService;

  beforeEach(() => {
    service = new FormContextService();
  });

  it('should register and retrieve field components', () => {
    const componentRef = { id: 1 } as any;
    service.registerFieldComponent('name', componentRef);
    expect(service.getFieldComponent('name')).toBe(componentRef);
    service.unregisterFieldComponent('name');
    expect(service.getFieldComponent('name')).toBeNull();
  });

  it('should store and retrieve form rules', () => {
    const rule: FormLayoutRule = {
      id: '1',
      name: 'r',
      context: 'visibility',
      targetFields: ['name'],
      effect: { condition: null }
    };
    service.setFormRules([rule]);
    expect(service.getFormRuleById('1')).toEqual(rule);
    expect(service.getFormRulesByContext('visibility')).toEqual([rule]);
  });
});
