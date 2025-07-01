import { DslTokenizer } from './tokenizer';
import { Token, TokenType, OPERATOR_KEYWORDS, COMPARISON_OPERATORS } from './token';
import { ValidationIssue, ValidationIssueType, ValidationSeverity } from './validation-issue';
import { FunctionRegistry } from '../registry/function-registry';

/**
 * Configuration for DSL validation
 */
export interface DslValidatorConfig {
  /**
   * Available function names for validation
   */
  knownFunctions?: string[];

  /**
   * Function registry to check against
   */
  functionRegistry?: FunctionRegistry<any>;

  /**
   * Known field names for the target type
   */
  knownFields?: string[];

  /**
   * Maximum expression complexity (number of operators)
   */
  maxComplexity?: number;

  /**
   * Enable performance warnings
   */
  enablePerformanceWarnings?: boolean;

  /**
   * Enable deprecated syntax warnings
   */
  enableDeprecationWarnings?: boolean;
}

/**
 * Validates DSL expressions and provides detailed error reporting
 */
export class DslValidator {
  private config: Required<DslValidatorConfig>;

  private readonly BUILT_IN_FUNCTIONS = [
    'contains', 'startsWith', 'endsWith', 'atLeast', 'exactly',
    'forEach', 'uniqueBy', 'minLength', 'maxLength',
    'requiredIf', 'visibleIf', 'disabledIf', 'readonlyIf',
    'ifDefined', 'ifNotNull', 'ifExists', 'withDefault'
  ];

  constructor(config: DslValidatorConfig = {}) {
    this.config = {
      knownFunctions: config.knownFunctions || [],
      functionRegistry: config.functionRegistry,
      knownFields: config.knownFields || [],
      maxComplexity: config.maxComplexity || 50,
      enablePerformanceWarnings: config.enablePerformanceWarnings ?? true,
      enableDeprecationWarnings: config.enableDeprecationWarnings ?? true
    } as Required<DslValidatorConfig>;
  }

  /**
   * Validates a DSL expression and returns all issues found
   */
  validate(input: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    try {
      // Basic validation
      this.validateBasicStructure(input, issues);

      // Tokenize and validate tokens
      const tokenizer = new DslTokenizer(input);
      const tokens = tokenizer.tokenize();
      
      this.validateTokens(tokens, input, issues);
      this.validateSyntax(tokens, input, issues);
      this.validateSemantics(tokens, input, issues);
      this.validateComplexity(tokens, issues);

    } catch (error) {
      issues.push({
        type: ValidationIssueType.SYNTAX_ERROR,
        severity: ValidationSeverity.ERROR,
        message: `Unexpected error during validation: ${error}`,
        position: { start: 0, end: input.length, line: 1, column: 1 }
      });
    }

    return issues;
  }

  private validateBasicStructure(input: string, issues: ValidationIssue[]): void {
    // Check for empty expression
    if (input.trim().length === 0) {
      issues.push({
        type: ValidationIssueType.EMPTY_EXPRESSION,
        severity: ValidationSeverity.ERROR,
        message: 'Expression cannot be empty',
        position: { start: 0, end: 0, line: 1, column: 1 },
        suggestion: 'Add a valid expression'
      });
      return;
    }

    // Check for unbalanced parentheses
    this.validateBalancedDelimiters(input, '(', ')', ValidationIssueType.UNBALANCED_PARENTHESES, issues);
    
    // Check for unbalanced brackets
    this.validateBalancedDelimiters(input, '[', ']', ValidationIssueType.UNBALANCED_BRACKETS, issues);

    // Check for unterminated strings
    this.validateStringLiterals(input, issues);
  }

  private validateBalancedDelimiters(
    input: string, 
    open: string, 
    close: string, 
    issueType: ValidationIssueType, 
    issues: ValidationIssue[]
  ): void {
    let count = 0;
    let openPositions: number[] = [];

    for (let i = 0; i < input.length; i++) {
      if (input[i] === open) {
        count++;
        openPositions.push(i);
      } else if (input[i] === close) {
        count--;
        if (count < 0) {
          const { line, column } = this.getLineColumn(input, i);
          issues.push({
            type: issueType,
            severity: ValidationSeverity.ERROR,
            message: `Unexpected closing ${close}`,
            position: { start: i, end: i + 1, line, column },
            suggestion: `Remove the extra ${close} or add a matching ${open}`
          });
        } else {
          openPositions.pop();
        }
      }
    }

    // Report unclosed delimiters
    for (const pos of openPositions) {
      const { line, column } = this.getLineColumn(input, pos);
      issues.push({
        type: issueType,
        severity: ValidationSeverity.ERROR,
        message: `Unclosed ${open}`,
        position: { start: pos, end: pos + 1, line, column },
        suggestion: `Add a closing ${close}`
      });
    }
  }

  private validateStringLiterals(input: string, issues: ValidationIssue[]): void {
    const quotes = ['"', "'"];
    
    for (const quote of quotes) {
      let inString = false;
      let startPos = -1;

      for (let i = 0; i < input.length; i++) {
        if (input[i] === quote) {
          if (!inString) {
            inString = true;
            startPos = i;
          } else {
            // Check if it's escaped
            let escaped = false;
            let backslashCount = 0;
            for (let j = i - 1; j >= 0 && input[j] === '\\'; j--) {
              backslashCount++;
            }
            escaped = backslashCount % 2 === 1;

            if (!escaped) {
              inString = false;
              startPos = -1;
            }
          }
        }
      }

      if (inString) {
        const { line, column } = this.getLineColumn(input, startPos);
        issues.push({
          type: ValidationIssueType.UNTERMINATED_STRING,
          severity: ValidationSeverity.ERROR,
          message: `Unterminated string literal starting with ${quote}`,
          position: { start: startPos, end: input.length, line, column },
          suggestion: `Add a closing ${quote}`
        });
      }
    }
  }

  private validateTokens(tokens: Token[], input: string, issues: ValidationIssue[]): void {
    for (const token of tokens) {
      if (token.type === TokenType.EOF) continue;

      // Validate numbers
      if (token.type === TokenType.NUMBER) {
        if (isNaN(Number(token.value))) {
          issues.push({
            type: ValidationIssueType.INVALID_NUMBER,
            severity: ValidationSeverity.ERROR,
            message: `Invalid number format: ${token.value}`,
            position: {
              start: token.position,
              end: token.position + token.value.length,
              line: token.line,
              column: token.column
            },
            suggestion: 'Use a valid number format (e.g., 42, 3.14, -5)'
          });
        }
      }

      // Validate field references
      if (token.type === TokenType.FIELD_REFERENCE || token.type === TokenType.IDENTIFIER) {
        if (this.config.knownFields.length > 0) {
          if (!this.config.knownFields.includes(token.value)) {
            issues.push({
              type: ValidationIssueType.INVALID_FIELD_REFERENCE,
              severity: ValidationSeverity.WARNING,
              message: `Unknown field: ${token.value}`,
              position: {
                start: token.position,
                end: token.position + token.value.length,
                line: token.line,
                column: token.column
              },
              suggestion: this.suggestSimilarField(token.value),
              help: `Available fields: ${this.config.knownFields.join(', ')}`
            });
          }
        }
      }
    }
  }

  private validateSyntax(tokens: Token[], input: string, issues: ValidationIssue[]): void {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];
      const prevToken = tokens[i - 1];

      // Check for consecutive operators
      if (this.isOperatorToken(token) && this.isOperatorToken(nextToken)) {
        issues.push({
          type: ValidationIssueType.UNEXPECTED_TOKEN,
          severity: ValidationSeverity.ERROR,
          message: `Unexpected ${nextToken.type} after ${token.type}`,
          position: {
            start: nextToken.position,
            end: nextToken.position + nextToken.value.length,
            line: nextToken.line,
            column: nextToken.column
          },
          suggestion: 'Add an operand between operators'
        });
      }

      // Check for operators at the beginning/end
      if (i === 0 && this.isBinaryOperatorToken(token)) {
        issues.push({
          type: ValidationIssueType.UNEXPECTED_TOKEN,
          severity: ValidationSeverity.ERROR,
          message: `Expression cannot start with ${token.type}`,
          position: {
            start: token.position,
            end: token.position + token.value.length,
            line: token.line,
            column: token.column
          },
          suggestion: 'Add an operand before the operator'
        });
      }

      if (i === tokens.length - 2 && this.isBinaryOperatorToken(token) && nextToken.type === TokenType.EOF) {
        issues.push({
          type: ValidationIssueType.UNEXPECTED_TOKEN,
          severity: ValidationSeverity.ERROR,
          message: `Expression cannot end with ${token.type}`,
          position: {
            start: token.position,
            end: token.position + token.value.length,
            line: token.line,
            column: token.column
          },
          suggestion: 'Add an operand after the operator'
        });
      }
    }
  }

  private validateSemantics(tokens: Token[], input: string, issues: ValidationIssue[]): void {
    // Check function calls
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];

      if (token.type === TokenType.IDENTIFIER && nextToken?.type === TokenType.LEFT_PAREN) {
        const functionName = token.value;
        
        // Check if function is known
        const allKnownFunctions = [
          ...this.BUILT_IN_FUNCTIONS,
          ...this.config.knownFunctions
        ];

        if (this.config.functionRegistry) {
          allKnownFunctions.push(...Array.from(this.config.functionRegistry.getAll().keys()));
        }

        if (!allKnownFunctions.includes(functionName)) {
          issues.push({
            type: ValidationIssueType.UNKNOWN_FUNCTION,
            severity: ValidationSeverity.ERROR,
            message: `Unknown function: ${functionName}`,
            position: {
              start: token.position,
              end: token.position + token.value.length,
              line: token.line,
              column: token.column
            },
            suggestion: this.suggestSimilarFunction(functionName, allKnownFunctions),
            help: `Available functions: ${allKnownFunctions.join(', ')}`
          });
        }

        // Validate function arguments (basic check)
        this.validateFunctionArguments(functionName, i, tokens, issues);
      }
    }
  }

  private validateFunctionArguments(
    functionName: string, 
    startIndex: number, 
    tokens: Token[], 
    issues: ValidationIssue[]
  ): void {
    // Find the argument list
    let parenCount = 0;
    let argCount = 0;
    let inArgs = false;

    for (let i = startIndex + 1; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === TokenType.LEFT_PAREN) {
        parenCount++;
        if (parenCount === 1) {
          inArgs = true;
        }
      } else if (token.type === TokenType.RIGHT_PAREN) {
        parenCount--;
        if (parenCount === 0) {
          break;
        }
      } else if (token.type === TokenType.COMMA && parenCount === 1) {
        argCount++;
      } else if (inArgs && parenCount === 1 && token.type !== TokenType.COMMA) {
        // We have at least one argument
        if (argCount === 0) {
          argCount = 1;
        }
      }
    }

    // Check argument count for known functions
    const expectedArgs = this.getExpectedArgumentCount(functionName);
    if (expectedArgs !== null && argCount !== expectedArgs) {
      const functionToken = tokens[startIndex];
      const severity = argCount < expectedArgs ? ValidationSeverity.ERROR : ValidationSeverity.WARNING;
      const message = argCount < expectedArgs 
        ? `Function ${functionName} expects ${expectedArgs} arguments, got ${argCount}`
        : `Function ${functionName} expects ${expectedArgs} arguments, got ${argCount}`;

      issues.push({
        type: argCount < expectedArgs ? ValidationIssueType.MISSING_ARGUMENT : ValidationIssueType.TOO_MANY_ARGUMENTS,
        severity,
        message,
        position: {
          start: functionToken.position,
          end: functionToken.position + functionToken.value.length,
          line: functionToken.line,
          column: functionToken.column
        },
        suggestion: `Use exactly ${expectedArgs} arguments`
      });
    }
  }

  private validateComplexity(tokens: Token[], issues: ValidationIssue[]): void {
    if (!this.config.enablePerformanceWarnings) return;

    const operatorCount = tokens.filter(token => this.isOperatorToken(token)).length;
    
    if (operatorCount > this.config.maxComplexity) {
      issues.push({
        type: ValidationIssueType.PERFORMANCE_WARNING,
        severity: ValidationSeverity.WARNING,
        message: `Expression complexity is high (${operatorCount} operators). Consider breaking into smaller expressions.`,
        position: { start: 0, end: 0, line: 1, column: 1 },
        help: 'Complex expressions can impact performance and readability'
      });
    }
  }

  private getExpectedArgumentCount(functionName: string): number | null {
    const argCounts: Record<string, number> = {
      'contains': 2,
      'startsWith': 2,
      'endsWith': 2,
      'atLeast': 2,
      'exactly': 2,
      'forEach': 2,
      'uniqueBy': 2,
      'minLength': 2,
      'maxLength': 2,
      'requiredIf': 2,
      'visibleIf': 2,
      'disabledIf': 2,
      'readonlyIf': 2,
      'ifDefined': 2,
      'ifNotNull': 2,
      'ifExists': 2,
      'withDefault': 3
    };

    return argCounts[functionName] ?? null;
  }

  private isOperatorToken(token: Token): boolean {
    return [
      TokenType.AND, TokenType.OR, TokenType.NOT, TokenType.XOR, TokenType.IMPLIES,
      TokenType.EQUALS, TokenType.NOT_EQUALS, TokenType.LESS_THAN,
      TokenType.LESS_THAN_OR_EQUAL, TokenType.GREATER_THAN, TokenType.GREATER_THAN_OR_EQUAL,
      TokenType.IN
    ].includes(token.type);
  }

  private isBinaryOperatorToken(token: Token): boolean {
    return [
      TokenType.AND, TokenType.OR, TokenType.XOR, TokenType.IMPLIES,
      TokenType.EQUALS, TokenType.NOT_EQUALS, TokenType.LESS_THAN,
      TokenType.LESS_THAN_OR_EQUAL, TokenType.GREATER_THAN, TokenType.GREATER_THAN_OR_EQUAL,
      TokenType.IN
    ].includes(token.type);
  }

  private suggestSimilarField(fieldName: string): string | undefined {
    return this.findSimilar(fieldName, this.config.knownFields);
  }

  private suggestSimilarFunction(functionName: string, knownFunctions: string[]): string | undefined {
    return this.findSimilar(functionName, knownFunctions);
  }

  private findSimilar(target: string, candidates: string[]): string | undefined {
    if (candidates.length === 0) return undefined;

    const similarities = candidates.map(candidate => ({
      candidate,
      distance: this.levenshteinDistance(target.toLowerCase(), candidate.toLowerCase())
    }));

    similarities.sort((a, b) => a.distance - b.distance);
    
    // Only suggest if the distance is reasonable
    if (similarities[0].distance <= Math.max(2, target.length * 0.4)) {
      return `Did you mean "${similarities[0].candidate}"?`;
    }

    return undefined;
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  private getLineColumn(input: string, position: number): { line: number; column: number } {
    let line = 1;
    let column = 1;

    for (let i = 0; i < position && i < input.length; i++) {
      if (input[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    return { line, column };
  }
}