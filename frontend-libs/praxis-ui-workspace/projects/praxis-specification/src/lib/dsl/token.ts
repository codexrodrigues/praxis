export enum TokenType {
  // Literals
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  NULL = 'NULL',
  
  // Operators
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  XOR = 'XOR',
  IMPLIES = 'IMPLIES',
  
  // Comparison operators
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  IN = 'IN',
  
  // Function tokens
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  AT_LEAST = 'AT_LEAST',
  EXACTLY = 'EXACTLY',
  
  // Punctuation
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  LEFT_BRACKET = 'LEFT_BRACKET',
  RIGHT_BRACKET = 'RIGHT_BRACKET',
  COMMA = 'COMMA',
  DOT = 'DOT',
  
  // Special
  FIELD_REFERENCE = 'FIELD_REFERENCE', // ${field}
  EOF = 'EOF',
  WHITESPACE = 'WHITESPACE'
}

export interface Token {
  type: TokenType;
  value: string;
  position: number;
  line: number;
  column: number;
}

export const OPERATOR_KEYWORDS: Record<string, TokenType> = {
  'and': TokenType.AND,
  '&&': TokenType.AND,
  'or': TokenType.OR,
  '||': TokenType.OR,
  'not': TokenType.NOT,
  '!': TokenType.NOT,
  'xor': TokenType.XOR,
  'implies': TokenType.IMPLIES,
  'in': TokenType.IN,
  'contains': TokenType.CONTAINS,
  'startsWith': TokenType.STARTS_WITH,
  'endsWith': TokenType.ENDS_WITH,
  'atLeast': TokenType.AT_LEAST,
  'exactly': TokenType.EXACTLY,
  'true': TokenType.BOOLEAN,
  'false': TokenType.BOOLEAN,
  'null': TokenType.NULL
};

export const COMPARISON_OPERATORS: Record<string, TokenType> = {
  '==': TokenType.EQUALS,
  '!=': TokenType.NOT_EQUALS,
  '<': TokenType.LESS_THAN,
  '<=': TokenType.LESS_THAN_OR_EQUAL,
  '>': TokenType.GREATER_THAN,
  '>=': TokenType.GREATER_THAN_OR_EQUAL
};