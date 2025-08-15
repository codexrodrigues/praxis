import { FormLayoutRule } from '@praxis/core';
import { RuleBuilderState } from '@praxis/visual-builder';
import {
  formLayoutRulesToBuilderState,
  ruleBuilderStateToFormLayoutRules,
} from './rule-converters';

describe('rule-converters', () => {
  it('converts builder state to form layout rules', () => {
    const state: RuleBuilderState = {
      nodes: {
        r1: {
          id: 'r1',
          type: 'visibleIf',
          config: {
            type: 'visibleIf',
            validatorType: 'visibleIf',
            targetField: 'fieldA',
            conditionNodeId: 'c1',
          },
        },
        c1: {
          id: 'c1',
          type: 'fieldCondition',
          config: {
            type: 'fieldCondition',
            fieldName: 'fieldB',
            operator: 'eq',
            value: 'x',
          },
        },
      },
      rootNodes: ['r1'],
      validationErrors: [],
      mode: 'visual',
      isDirty: false,
      history: [],
      historyPosition: 0,
    };

    const rules = ruleBuilderStateToFormLayoutRules(state);
    expect(rules.length).toBe(1);
    expect(rules[0]).toEqual({
      id: 'r1',
      name: 'r1',
      context: 'visibility',
      targetFields: ['fieldA'],
      effect: { condition: 'fieldB eq "x"' },
      description: undefined,
    } as FormLayoutRule);
  });

  it('converts form layout rules to builder state', () => {
    const formRule: FormLayoutRule = {
      id: 'r1',
      name: 'rule-1',
      context: 'visibility',
      targetFields: ['fieldA'],
      effect: { condition: 'fieldB eq "x"' },
    };

    const state = formLayoutRulesToBuilderState([formRule]);
    expect(state.rootNodes.length).toBe(1);
    const rootNode = state.nodes[state.rootNodes[0]];
    expect(rootNode.type).toBe('visibleIf');
    const config: any = rootNode.config;
    expect(config.targetField).toBe('fieldA');
    const conditionNode = state.nodes[config.conditionNodeId];
    expect(conditionNode.type).toBe('fieldCondition');
    const condConfig: any = conditionNode.config;
    expect(condConfig.fieldName).toBe('fieldB');
    expect(condConfig.operator).toBe('eq');
    expect(condConfig.value).toBe('x');
  });
});
