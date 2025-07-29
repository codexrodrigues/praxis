import { Injectable } from '@angular/core';
import { DslParser, DslValidator, ValidationIssue, FunctionRegistry } from 'praxis-specification';
import { ContextProvider } from 'praxis-specification';

/**
 * Configuration for parsing DSL expressions
 */
export interface DslParsingConfig {
  /** Available function registry */
  functionRegistry?: FunctionRegistry<any>;
  /** Context provider for variable resolution */
  contextProvider?: ContextProvider;
  /** Known field names for validation */
  knownFields?: string[];
  /** Enable performance warnings */
  enablePerformanceWarnings?: boolean;
  /** Maximum expression complexity */
  maxComplexity?: number;
}

/**
 * Result of parsing a DSL expression
 */
export interface DslParsingResult<T extends object = any> {
  /** Whether parsing was successful */
  success: boolean;
  /** Parsed specification (if successful) */
  specification?: any; // Would be Specification<T> but avoiding circular import
  /** Validation issues found */
  issues: ValidationIssue[];
  /** Performance metrics */
  metrics?: {
    parseTime: number;
    complexity: number;
  };
}

/**
 * Dedicated service for DSL parsing and validation
 * Extracted from SpecificationBridgeService to follow SRP
 */
@Injectable({
  providedIn: 'root'
})
export class DslParsingService {
  private dslParser: DslParser<any>;
  private dslValidator: DslValidator;

  constructor() {
    this.dslParser = new DslParser();
    this.dslValidator = new DslValidator();
  }

  /**
   * Parse a DSL expression into a specification
   */
  parseDsl<T extends object = any>(
    dslExpression: string, 
    config?: DslParsingConfig
  ): DslParsingResult<T> {
    const startTime = performance.now();
    const issues: ValidationIssue[] = [];

    try {
      // First validate the DSL syntax
      const validationResult = this.dslValidator.validate(dslExpression, {
        knownFields: config?.knownFields || [],
        functionRegistry: config?.functionRegistry,
        enablePerformanceWarnings: config?.enablePerformanceWarnings || false
      });

      issues.push(...validationResult.issues);

      // If there are critical errors, don't attempt parsing
      const criticalErrors = issues.filter(issue => issue.severity === 'error');
      if (criticalErrors.length > 0) {
        return {
          success: false,
          issues,
          metrics: {
            parseTime: performance.now() - startTime,
            complexity: this.calculateComplexity(dslExpression)
          }
        };
      }

      // Parse the DSL
      const specification = this.dslParser.parse<T>(dslExpression, {
        functionRegistry: config?.functionRegistry,
        contextProvider: config?.contextProvider
      });

      const endTime = performance.now();
      
      return {
        success: true,
        specification,
        issues,
        metrics: {
          parseTime: endTime - startTime,
          complexity: this.calculateComplexity(dslExpression)
        }
      };

    } catch (error) {
      issues.push({
        id: 'parsing-error',
        severity: 'error',
        category: 'syntax',
        message: `Failed to parse DSL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        position: { start: 0, end: dslExpression.length }
      });

      return {
        success: false,
        issues,
        metrics: {
          parseTime: performance.now() - startTime,
          complexity: this.calculateComplexity(dslExpression)
        }
      };
    }
  }

  /**
   * Validate DSL syntax without parsing
   */
  validateDsl(dslExpression: string, config?: DslParsingConfig): ValidationIssue[] {
    try {
      const result = this.dslValidator.validate(dslExpression, {
        knownFields: config?.knownFields || [],
        functionRegistry: config?.functionRegistry,
        enablePerformanceWarnings: config?.enablePerformanceWarnings || false
      });

      return result.issues;
    } catch (error) {
      return [{
        id: 'validation-error',
        severity: 'error',
        category: 'syntax',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        position: { start: 0, end: dslExpression.length }
      }];
    }
  }

  /**
   * Get suggestions for DSL completion
   */
  getDslSuggestions(
    partialExpression: string, 
    cursorPosition: number,
    config?: DslParsingConfig
  ): string[] {
    try {
      // This would typically use a language service or parser
      const suggestions: string[] = [];

      // Add field suggestions
      if (config?.knownFields) {
        const currentToken = this.getCurrentToken(partialExpression, cursorPosition);
        const matchingFields = config.knownFields.filter(field => 
          field.toLowerCase().startsWith(currentToken.toLowerCase())
        );
        suggestions.push(...matchingFields);
      }

      // Add operator suggestions
      const operators = ['==', '!=', '>', '<', '>=', '<=', 'contains', 'startsWith', 'endsWith'];
      suggestions.push(...operators);

      // Add function suggestions
      if (config?.functionRegistry) {
        // Would get function names from registry
        suggestions.push('sum()', 'count()', 'avg()', 'max()', 'min()');
      }

      return suggestions;
    } catch (error) {
      console.warn('Failed to get DSL suggestions:', error);
      return [];
    }
  }

  /**
   * Format DSL expression for readability
   */
  formatDsl(dslExpression: string): string {
    try {
      // Simple formatting rules
      return dslExpression
        .replace(/\s*&&\s*/g, ' && ')
        .replace(/\s*\|\|\s*/g, ' || ')
        .replace(/\s*==\s*/g, ' == ')
        .replace(/\s*!=\s*/g, ' != ')
        .replace(/\s*>=\s*/g, ' >= ')
        .replace(/\s*<=\s*/g, ' <= ')
        .replace(/\s*>\s*/g, ' > ')
        .replace(/\s*<\s*/g, ' < ')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .trim();
    } catch (error) {
      console.warn('Failed to format DSL:', error);
      return dslExpression;
    }
  }

  /**
   * Check if DSL expression is syntactically valid
   */
  isValidDsl(dslExpression: string, config?: DslParsingConfig): boolean {
    const issues = this.validateDsl(dslExpression, config);
    return !issues.some(issue => issue.severity === 'error');
  }

  private calculateComplexity(dslExpression: string): number {
    // Simple complexity calculation based on operators and nesting
    let complexity = 1;
    
    // Count operators
    complexity += (dslExpression.match(/&&|\|\|/g) || []).length * 2;
    complexity += (dslExpression.match(/==|!=|>=|<=|>|</g) || []).length;
    
    // Count parentheses (nesting)
    complexity += (dslExpression.match(/\(/g) || []).length;
    
    // Count function calls
    complexity += (dslExpression.match(/\w+\(/g) || []).length * 3;
    
    return complexity;
  }

  private getCurrentToken(expression: string, cursorPosition: number): string {
    // Extract the current word/token at cursor position
    const beforeCursor = expression.substring(0, cursorPosition);
    const afterCursor = expression.substring(cursorPosition);
    
    const beforeMatch = beforeCursor.match(/(\w+)$/);
    const afterMatch = afterCursor.match(/^(\w*)/);
    
    const before = beforeMatch ? beforeMatch[1] : '';
    const after = afterMatch ? afterMatch[1] : '';
    
    return before + after;
  }
}