import { Injectable } from '@angular/core';
import { ContextProvider } from '@praxis/specification';
/**
 * Context variable definition used by the context management service
 * Renamed to avoid conflicts with other ContextVariable interfaces
 */
export interface ContextEntry {
  /** Full path identifier for the variable */
  path: string;
  /** Actual value of the variable */
  value: unknown;
  /** Optional type hint for validation */
  type?: string;
}

/**
 * Configuration for contextual specification support
 */
export interface ContextualConfig {
  /** Context variables available for token resolution */
  contextVariables?: ContextEntry[];
  /** Context provider instance */
  contextProvider?: ContextProvider;
  /** Enable strict validation of context tokens */
  strictContextValidation?: boolean;
}

/**
 * Context variable value with metadata
 */
export interface ContextValue {
  /** The actual value */
  value: any;
  /** Variable type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** Whether the value is computed */
  computed?: boolean;
  /** Last updated timestamp */
  lastUpdated?: Date;
}

/**
 * Context scope for variable resolution
 */
export interface ContextScope {
  /** Scope identifier */
  id: string;
  /** Scope name */
  name: string;
  /** Parent scope (for hierarchical contexts) */
  parentId?: string;
  /** Variables in this scope */
  variables: Map<string, ContextValue>;
}

/**
 * Dedicated service for context management and variable resolution
 * Extracted from SpecificationBridgeService to follow SRP
 */
@Injectable({
  providedIn: 'root',
})
export class ContextManagementService {
  private scopes = new Map<string, ContextScope>();
  private globalScope: ContextScope;

  constructor() {
    // Initialize global scope
    this.globalScope = {
      id: 'global',
      name: 'Global Context',
      variables: new Map(),
    };
    this.scopes.set('global', this.globalScope);
  }

  /**
   * Create a context provider from context variables
   */
  createContextProvider(contextVariables: ContextEntry[]): ContextProvider {
    const variableMap = new Map<string, any>();

    for (const variable of contextVariables) {
      variableMap.set(variable.path, variable.value);

      // Also add with dot notation if path contains dots
      if (variable.path.includes('.')) {
        const segments = variable.path.split('.');
        let current = variableMap;

        // Create nested structure
        for (let i = 0; i < segments.length - 1; i++) {
          const segment = segments[i];
          if (!current.has(segment)) {
            current.set(segment, new Map());
          }
          current = current.get(segment);
        }

        current.set(segments[segments.length - 1], variable.value);
      }
    }

    return {
      hasValue: (path: string) => this.hasContextValue(path, variableMap),
      getValue: (path: string) => this.getContextValue(path, variableMap),
    };
  }

  /**
   * Create a new context scope
   */
  createScope(id: string, name: string, parentId?: string): ContextScope {
    if (this.scopes.has(id)) {
      throw new Error(`Context scope '${id}' already exists`);
    }

    if (parentId && !this.scopes.has(parentId)) {
      throw new Error(`Parent scope '${parentId}' does not exist`);
    }

    const scope: ContextScope = {
      id,
      name,
      parentId,
      variables: new Map(),
    };

    this.scopes.set(id, scope);
    return scope;
  }

  /**
   * Set a variable in a specific scope
   */
  setVariable(
    scopeId: string,
    name: string,
    value: any,
    type?: ContextValue['type'],
  ): void {
    const scope = this.scopes.get(scopeId);
    if (!scope) {
      throw new Error(`Context scope '${scopeId}' does not exist`);
    }

    const contextValue: ContextValue = {
      value,
      type: type || this.inferType(value),
      lastUpdated: new Date(),
    };

    scope.variables.set(name, contextValue);
  }

  /**
   * Get a variable value from a scope (with inheritance)
   */
  getVariable(scopeId: string, name: string): ContextValue | undefined {
    const scope = this.scopes.get(scopeId);
    if (!scope) {
      return undefined;
    }

    // Check current scope
    if (scope.variables.has(name)) {
      return scope.variables.get(name);
    }

    // Check parent scopes recursively
    if (scope.parentId) {
      return this.getVariable(scope.parentId, name);
    }

    return undefined;
  }

  /**
   * Get all variables in a scope (including inherited)
   */
  getAllVariables(scopeId: string): Map<string, ContextValue> {
    const allVariables = new Map<string, ContextValue>();

    // Collect variables from parent scopes first (so they can be overridden)
    this.collectVariablesRecursive(scopeId, allVariables);

    return allVariables;
  }

  /**
   * Validate context variables
   */
  validateContext(contextVariables: ContextEntry[]): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const paths = new Set<string>();

    for (const variable of contextVariables) {
      // Check for duplicate paths
      if (paths.has(variable.path)) {
        issues.push(`Duplicate context variable path: ${variable.path}`);
      }
      paths.add(variable.path);

      // Validate path format
      if (!this.isValidPath(variable.path)) {
        issues.push(`Invalid context variable path: ${variable.path}`);
      }

      // Validate value type consistency
      if (variable.type && typeof variable.value !== variable.type) {
        issues.push(
          `Type mismatch for ${variable.path}: expected ${variable.type}, got ${typeof variable.value}`,
        );
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Create a scoped context provider
   */
  createScopedProvider(scopeId: string): ContextProvider {
    const variables = this.getAllVariables(scopeId);

    return {
      hasValue: (path: string) => variables.has(path),
      getValue: (path: string) => {
        const contextValue = variables.get(path);
        return contextValue ? contextValue.value : undefined;
      },
    };
  }

  /**
   * Merge multiple context providers
   */
  mergeProviders(...providers: ContextProvider[]): ContextProvider {
    return {
      hasValue: (path: string) =>
        providers.some((provider) => provider.hasValue(path)),
      getValue: (path: string) => {
        // Return from the first provider that has the value
        for (const provider of providers) {
          if (provider.hasValue(path)) {
            return provider.getValue(path);
          }
        }
        return undefined;
      },
    };
  }

  /**
   * Get context statistics
   */
  getContextStatistics(scopeId?: string): {
    scopeCount: number;
    variableCount: number;
    totalSize: number;
    scopes: { id: string; name: string; variableCount: number }[];
  } {
    const scopesToCheck = scopeId ? [scopeId] : Array.from(this.scopes.keys());
    let totalVariables = 0;
    let totalSize = 0;
    const scopeStats: { id: string; name: string; variableCount: number }[] =
      [];

    for (const id of scopesToCheck) {
      const scope = this.scopes.get(id);
      if (scope) {
        const variableCount = scope.variables.size;
        totalVariables += variableCount;

        // Estimate size
        for (const [, value] of scope.variables) {
          totalSize += this.estimateSize(value.value);
        }

        scopeStats.push({
          id: scope.id,
          name: scope.name,
          variableCount,
        });
      }
    }

    return {
      scopeCount: scopesToCheck.length,
      variableCount: totalVariables,
      totalSize,
      scopes: scopeStats,
    };
  }

  private hasContextValue(
    path: string,
    variableMap: Map<string, any>,
  ): boolean {
    // Check direct path
    if (variableMap.has(path)) {
      return true;
    }

    // Check dot notation path
    if (path.includes('.')) {
      const segments = path.split('.');
      let current: any = variableMap;

      for (const segment of segments) {
        if (current instanceof Map && current.has(segment)) {
          current = current.get(segment);
        } else {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  private getContextValue(path: string, variableMap: Map<string, any>): any {
    // Check direct path
    if (variableMap.has(path)) {
      return variableMap.get(path);
    }

    // Check dot notation path
    if (path.includes('.')) {
      const segments = path.split('.');
      let current: any = variableMap;

      for (const segment of segments) {
        if (current instanceof Map && current.has(segment)) {
          current = current.get(segment);
        } else {
          return undefined;
        }
      }

      return current;
    }

    return undefined;
  }

  private collectVariablesRecursive(
    scopeId: string,
    variables: Map<string, ContextValue>,
  ): void {
    const scope = this.scopes.get(scopeId);
    if (!scope) return;

    // First collect from parent (so child can override)
    if (scope.parentId) {
      this.collectVariablesRecursive(scope.parentId, variables);
    }

    // Then add/override with current scope variables
    for (const [name, value] of scope.variables) {
      variables.set(name, value);
    }
  }

  private isValidPath(path: string): boolean {
    // Basic path validation
    return /^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(path);
  }

  private inferType(value: any): ContextValue['type'] {
    if (Array.isArray(value)) return 'array';
    if (value === null || value === undefined) return 'object';

    const type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return type;
    }

    return 'object';
  }

  private estimateSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }
}
