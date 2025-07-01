/**
 * Types of validation issues that can be found in DSL
 */
export enum ValidationIssueType {
  SYNTAX_ERROR = 'SyntaxError',
  UNKNOWN_FUNCTION = 'UnknownFunction',
  UNKNOWN_OPERATOR = 'UnknownOperator',
  UNBALANCED_PARENTHESES = 'UnbalancedParentheses',
  UNBALANCED_BRACKETS = 'UnbalancedBrackets',
  INVALID_TOKEN = 'InvalidToken',
  UNEXPECTED_TOKEN = 'UnexpectedToken',
  MISSING_ARGUMENT = 'MissingArgument',
  TOO_MANY_ARGUMENTS = 'TooManyArguments',
  INVALID_FIELD_REFERENCE = 'InvalidFieldReference',
  EMPTY_EXPRESSION = 'EmptyExpression',
  UNTERMINATED_STRING = 'UnterminatedString',
  INVALID_NUMBER = 'InvalidNumber',
  DEPRECATED_SYNTAX = 'DeprecatedSyntax',
  PERFORMANCE_WARNING = 'PerformanceWarning'
}

/**
 * Severity levels for validation issues
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  HINT = 'hint'
}

/**
 * Represents a validation issue found in DSL code
 */
export interface ValidationIssue {
  /**
   * Type of the issue
   */
  type: ValidationIssueType;

  /**
   * Severity level
   */
  severity: ValidationSeverity;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Position information
   */
  position: {
    /**
     * Starting index in the input string
     */
    start: number;

    /**
     * Ending index in the input string
     */
    end: number;

    /**
     * Line number (1-based)
     */
    line: number;

    /**
     * Column number (1-based)
     */
    column: number;
  };

  /**
   * Suggested fix or correction
   */
  suggestion?: string;

  /**
   * Additional context or help text
   */
  help?: string;

  /**
   * Related documentation or examples
   */
  documentation?: string;
}