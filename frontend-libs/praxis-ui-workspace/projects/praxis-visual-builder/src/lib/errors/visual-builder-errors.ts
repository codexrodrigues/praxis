/**
 * Typed error system for Visual Builder operations
 * Provides structured error handling with codes, categories, and context
 */

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  CONVERSION = 'conversion',
  REGISTRY = 'registry',
  DSL = 'dsl',
  CONTEXT = 'context',
  CONFIGURATION = 'configuration',
  NETWORK = 'network',
  INTERNAL = 'internal'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Base error class for all Visual Builder errors
 */
export abstract class VisualBuilderError extends Error {
  abstract readonly code: string;
  abstract readonly category: ErrorCategory;
  abstract readonly severity: ErrorSeverity;
  
  public readonly timestamp: Date;
  public readonly context: Record<string, any>;

  constructor(
    message: string,
    context: Record<string, any> = {},
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get structured error information
   */
  toJSON(): ErrorInfo {
    return {
      code: this.code,
      category: this.category,
      severity: this.severity,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack
      } : undefined
    };
  }
}

/**
 * Validation-related errors
 */
export class ValidationError extends VisualBuilderError {
  readonly code = 'VALIDATION_ERROR';
  readonly category = ErrorCategory.VALIDATION;
  readonly severity = ErrorSeverity.HIGH;

  constructor(
    message: string,
    public readonly nodeId?: string,
    public readonly validationRules?: string[],
    context: Record<string, any> = {}
  ) {
    super(message, { nodeId, validationRules, ...context });
  }
}

/**
 * Conversion-related errors
 */
export class ConversionError extends VisualBuilderError {
  readonly code: string;
  readonly category = ErrorCategory.CONVERSION;
  readonly severity = ErrorSeverity.HIGH;

  constructor(
    code: string,
    message: string,
    public readonly nodeId?: string,
    context: Record<string, any> = {},
    cause?: Error
  ) {
    super(message, { nodeId, ...context }, cause);
    this.code = `CONVERSION_${code}`;
  }
}

/**
 * Registry-related errors
 */
export class RegistryError extends VisualBuilderError {
  readonly code: string;
  readonly category = ErrorCategory.REGISTRY;
  readonly severity = ErrorSeverity.MEDIUM;

  constructor(
    operation: string,
    message: string,
    public readonly nodeId?: string,
    context: Record<string, any> = {}
  ) {
    super(message, { operation, nodeId, ...context });
    this.code = `REGISTRY_${operation.toUpperCase()}`;
  }
}

/**
 * DSL parsing and processing errors
 */
export class DslError extends VisualBuilderError {
  readonly code: string;
  readonly category = ErrorCategory.DSL;
  readonly severity = ErrorSeverity.HIGH;

  constructor(
    type: 'PARSING' | 'VALIDATION' | 'EXPORT' | 'IMPORT',
    message: string,
    public readonly expression?: string,
    public readonly position?: { start: number; end: number },
    context: Record<string, any> = {}
  ) {
    super(message, { expression, position, ...context });
    this.code = `DSL_${type}`;
  }
}

/**
 * Context management errors
 */
export class ContextError extends VisualBuilderError {
  readonly code: string;
  readonly category = ErrorCategory.CONTEXT;
  readonly severity = ErrorSeverity.MEDIUM;

  constructor(
    operation: string,
    message: string,
    public readonly scopeId?: string,
    public readonly variablePath?: string,
    context: Record<string, any> = {}
  ) {
    super(message, { operation, scopeId, variablePath, ...context });
    this.code = `CONTEXT_${operation.toUpperCase()}`;
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends VisualBuilderError {
  readonly code = 'CONFIGURATION_ERROR';
  readonly category = ErrorCategory.CONFIGURATION;
  readonly severity = ErrorSeverity.HIGH;

  constructor(
    message: string,
    public readonly configPath?: string,
    public readonly expectedType?: string,
    context: Record<string, any> = {}
  ) {
    super(message, { configPath, expectedType, ...context });
  }
}

/**
 * Internal system errors
 */
export class InternalError extends VisualBuilderError {
  readonly code = 'INTERNAL_ERROR';
  readonly category = ErrorCategory.INTERNAL;
  readonly severity = ErrorSeverity.CRITICAL;

  constructor(
    message: string,
    context: Record<string, any> = {},
    cause?: Error
  ) {
    super(message, context, cause);
  }
}

/**
 * Structured error information
 */
export interface ErrorInfo {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  timestamp: string;
  context: Record<string, any>;
  stack?: string;
  cause?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Error handler for collecting and processing errors
 */
export class ErrorHandler {
  private errors: VisualBuilderError[] = [];
  private maxErrors = 100;

  /**
   * Handle an error
   */
  handle(error: Error | VisualBuilderError): void {
    let visualBuilderError: VisualBuilderError;

    if (error instanceof VisualBuilderError) {
      visualBuilderError = error;
    } else {
      // Wrap generic errors
      visualBuilderError = new InternalError(
        error.message,
        { originalName: error.name },
        error
      );
    }

    this.errors.push(visualBuilderError);

    // Maintain max errors limit
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log based on severity
    this.logError(visualBuilderError);
  }

  /**
   * Get all errors
   */
  getErrors(): VisualBuilderError[] {
    return [...this.errors];
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): VisualBuilderError[] {
    return this.errors.filter(error => error.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): VisualBuilderError[] {
    return this.errors.filter(error => error.severity === severity);
  }

  /**
   * Clear all errors
   */
  clear(): void {
    this.errors = [];
  }

  /**
   * Get error statistics
   */
  getStatistics(): ErrorStatistics {
    const stats: ErrorStatistics = {
      total: this.errors.length,
      byCategory: {},
      bySeverity: {},
      recent: this.errors.slice(-10)
    };

    // Count by category
    for (const category of Object.values(ErrorCategory)) {
      stats.byCategory[category] = this.errors.filter(e => e.category === category).length;
    }

    // Count by severity
    for (const severity of Object.values(ErrorSeverity)) {
      stats.bySeverity[severity] = this.errors.filter(e => e.severity === severity).length;
    }

    return stats;
  }

  private logError(error: VisualBuilderError): void {
    const errorInfo = error.toJSON();
    
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🔴 CRITICAL ERROR:', errorInfo);
        break;
      case ErrorSeverity.HIGH:
        console.error('🟠 HIGH SEVERITY:', errorInfo);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('🟡 MEDIUM SEVERITY:', errorInfo);
        break;
      case ErrorSeverity.LOW:
        console.log('🟢 LOW SEVERITY:', errorInfo);
        break;
    }
  }
}

/**
 * Error statistics interface
 */
export interface ErrorStatistics {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<ErrorSeverity, number>;
  recent: VisualBuilderError[];
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = new ErrorHandler();

/**
 * Utility function to create typed errors
 */
export const createError = {
  validation: (message: string, nodeId?: string, rules?: string[]) => 
    new ValidationError(message, nodeId, rules),
    
  conversion: (code: string, message: string, nodeId?: string) => 
    new ConversionError(code, message, nodeId),
    
  registry: (operation: string, message: string, nodeId?: string) => 
    new RegistryError(operation, message, nodeId),
    
  dsl: (type: 'PARSING' | 'VALIDATION' | 'EXPORT' | 'IMPORT', message: string, expression?: string) => 
    new DslError(type, message, expression),
    
  context: (operation: string, message: string, scopeId?: string, variablePath?: string) => 
    new ContextError(operation, message, scopeId, variablePath),
    
  configuration: (message: string, configPath?: string, expectedType?: string) => 
    new ConfigurationError(message, configPath, expectedType),
    
  internal: (message: string, cause?: Error) => 
    new InternalError(message, {}, cause)
};