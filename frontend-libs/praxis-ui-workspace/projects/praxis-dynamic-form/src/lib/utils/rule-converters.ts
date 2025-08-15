import { FormLayoutRule } from '@praxis/core';
import {
  RuleBuilderState,
  RuleNode,
  FieldConditionConfig,
} from '@praxis/visual-builder';

/**
 * Converts a RuleBuilderState produced by the visual builder into
 * an array of FormLayoutRule objects understood by the dynamic form.
 */
export function ruleBuilderStateToFormLayoutRules(
  state: RuleBuilderState | null | undefined,
): FormLayoutRule[] {
  if (!state || !state.rootNodes?.length) {
    return [];
  }

  const rules: FormLayoutRule[] = [];

  for (const rootId of state.rootNodes) {
    const rootNode = state.nodes[rootId];
    const rule = ruleNodeToFormLayoutRule(rootNode, state.nodes);
    if (rule) {
      rules.push(rule);
    }
  }

  return rules;
}

/**
 * Converts an array of FormLayoutRule back into a RuleBuilderState
 * so that the visual builder can display the saved rules.
 *
 * The conversion handles a limited subset of rules (visibility and
 * required/validation rules with simple field conditions).
 */
export function formLayoutRulesToBuilderState(
  rules: FormLayoutRule[] | null | undefined,
): RuleBuilderState {
  const state: RuleBuilderState = {
    nodes: {},
    rootNodes: [],
    validationErrors: [],
    mode: 'visual',
    isDirty: false,
    history: [],
    historyPosition: 0,
  };

  if (!rules || rules.length === 0) {
    return state;
  }

  for (const rule of rules) {
    const { rootNode, conditionNode } = formLayoutRuleToNodes(rule);
    state.nodes[rootNode.id] = rootNode;
    state.rootNodes.push(rootNode.id);
    if (conditionNode) {
      state.nodes[conditionNode.id] = conditionNode;
    }
  }

  return state;
}

function ruleNodeToFormLayoutRule(
  node: RuleNode | undefined,
  allNodes: Record<string, RuleNode>,
): FormLayoutRule | null {
  if (!node) {
    return null;
  }

  if (node.type === 'visibleIf' || node.type === 'requiredIf') {
    const config: any = node.config || {};
    const targetField = config.targetField;
    let conditionString: string | null = null;

    if (config.conditionNodeId) {
      conditionString = buildDslFromCondition(
        allNodes[config.conditionNodeId],
        allNodes,
      );
    } else if (config.condition) {
      conditionString = buildDslFromCondition(config.condition, allNodes);
    }

    if (!targetField || !conditionString) {
      return null;
    }

    const context = node.type === 'visibleIf' ? 'visibility' : 'validation';
    return {
      id: node.id,
      name: node.label || node.id,
      context,
      targetFields: [targetField],
      description: node.metadata?.description,
      effect: { condition: conditionString },
    };
  }

  return null;
}

function buildDslFromCondition(
  node: RuleNode | undefined,
  allNodes: Record<string, RuleNode>,
): string | null {
  if (!node) {
    return null;
  }

  if (node.type === 'fieldCondition') {
    const cfg = node.config as FieldConditionConfig;
    const value = JSON.stringify(cfg.value);
    return `${cfg.fieldName} ${cfg.operator} ${value}`;
  }

  if (node.type === 'andGroup' || node.type === 'orGroup') {
    const op = node.type === 'andGroup' ? 'and' : 'or';
    const parts = (node.children || [])
      .map((id) => buildDslFromCondition(allNodes[id], allNodes))
      .filter((p): p is string => !!p);
    if (parts.length === 0) {
      return null;
    }
    return parts.length > 1 ? `(${parts.join(` ${op} `)})` : parts[0];
  }

  return null;
}

function formLayoutRuleToNodes(rule: FormLayoutRule): {
  rootNode: RuleNode;
  conditionNode?: RuleNode;
} {
  const type = rule.context === 'visibility' ? 'visibleIf' : 'requiredIf';
  const rootId = rule.id || generateId();
  let conditionNode: RuleNode | undefined;
  const condition = rule.effect?.condition;

  if (typeof condition === 'string') {
    conditionNode = parseSimpleCondition(condition);
  }

  const config: any = {
    type,
    validatorType: type,
    targetField: rule.targetFields?.[0],
  };
  if (conditionNode) {
    config.conditionNodeId = conditionNode.id;
  }

  const rootNode: RuleNode = {
    id: rootId,
    type: type as any,
    label: rule.name,
    config,
  };

  return { rootNode, conditionNode };
}

function parseSimpleCondition(condition: string): RuleNode | undefined {
  const match = condition
    .trim()
    .match(
      /^([\w.]+)\s+(eq|neq|lt|lte|gt|gte|contains|startsWith|endsWith|in)\s+(.+)$/,
    );
  if (!match) {
    return undefined;
  }
  const [, fieldName, operator, valueRaw] = match;
  let value: any = valueRaw;
  try {
    value = JSON.parse(valueRaw);
  } catch {
    // treat as string without quotes
    value = valueRaw.replace(/^['"]|['"]$/g, '');
  }
  const nodeId = generateId();
  const config: FieldConditionConfig = {
    type: 'fieldCondition',
    fieldName,
    operator: operator as any,
    value,
  };
  return {
    id: nodeId,
    type: 'fieldCondition',
    config,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
