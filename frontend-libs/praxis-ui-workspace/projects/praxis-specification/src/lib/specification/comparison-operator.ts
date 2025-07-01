export enum ComparisonOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  IN = 'in'
}

export const OPERATOR_SYMBOLS: Record<ComparisonOperator, string> = {
  [ComparisonOperator.EQUALS]: '==',
  [ComparisonOperator.NOT_EQUALS]: '!=',
  [ComparisonOperator.LESS_THAN]: '<',
  [ComparisonOperator.LESS_THAN_OR_EQUAL]: '<=',
  [ComparisonOperator.GREATER_THAN]: '>',
  [ComparisonOperator.GREATER_THAN_OR_EQUAL]: '>=',
  [ComparisonOperator.CONTAINS]: 'contains',
  [ComparisonOperator.STARTS_WITH]: 'startsWith',
  [ComparisonOperator.ENDS_WITH]: 'endsWith',
  [ComparisonOperator.IN]: 'in'
};