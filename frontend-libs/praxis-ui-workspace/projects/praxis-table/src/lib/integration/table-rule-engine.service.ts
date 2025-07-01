import { Injectable } from '@angular/core';
// Temporary interfaces until @praxis/visual-builder is available
interface RuleBuilderService {
  exportDSL(): string;
}

interface SpecificationBridgeService {
  convertToExecutable(specification: any): Function;
}
import { ColumnDefinition, ColumnDataType } from '@praxis/core';

export interface ConditionalStyle {
  id: string;
  name: string;
  description?: string;
  condition: VisualRule;
  styles: CellStyles;
  priority: number;
  enabled: boolean;
  createdAt: Date;
  modifiedAt: Date;
}

export interface VisualRule {
  specification: any; // Specification from visual builder
  dsl: string;        // DSL representation
  description: string; // Human-readable description
  fieldDependencies: string[]; // Fields referenced in the rule
}

export interface CellStyles {
  backgroundColor?: string;
  textColor?: string;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  fontStyle?: 'normal' | 'italic';
  fontSize?: string;
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  border?: BorderStyle;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  opacity?: number;
  boxShadow?: string;
  icon?: IconConfig;
  tooltip?: string;
  className?: string;
  customCss?: { [property: string]: string };
}

export interface BorderStyle {
  width?: string;
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  color?: string;
  radius?: string;
}

export interface IconConfig {
  name: string;
  position: 'before' | 'after' | 'overlay';
  color?: string;
  size?: string;
  tooltip?: string;
}

export interface AdvancedValueMapping {
  id: string;
  name: string;
  rules: ValueMappingRule[];
  defaultValue?: string;
  cacheEnabled?: boolean;
  cacheDuration?: number; // minutes
  fallbackToOriginal?: boolean;
}

export interface ValueMappingRule {
  id: string;
  name: string;
  condition: VisualRule;
  outputValue: string;
  outputType: 'text' | 'html' | 'component';
  priority: number;
  enabled: boolean;
}

export interface VisibilityRule {
  id: string;
  name: string;
  condition: VisualRule;
  action: 'show' | 'hide';
  priority: number;
  enabled: boolean;
}

export interface ValidationRule {
  id: string;
  name: string;
  condition: VisualRule;
  severity: 'error' | 'warning' | 'info';
  message: string;
  blockInteraction?: boolean;
  enabled: boolean;
}

export type CellStyleFunction = (rowData: any, cellValue: any, columnIndex: number, rowIndex: number) => CellStyles | null;
export type ValueMappingFunction = (rowData: any, cellValue: any, columnIndex: number, rowIndex: number) => any;
export type VisibilityFunction = (rowData: any, cellValue: any, columnIndex: number, rowIndex: number) => boolean;

@Injectable({
  providedIn: 'root'
})
export class TableRuleEngineService {
  private compiledRules = new Map<string, any>();
  private ruleCache = new Map<string, any>();
  
  constructor() {}

  /**
   * Compiles conditional styles into executable functions
   */
  compileConditionalStyles(rules: ConditionalStyle[]): CellStyleFunction {
    const ruleId = this.generateRuleId('styles', rules);
    
    if (this.compiledRules.has(ruleId)) {
      return this.compiledRules.get(ruleId);
    }

    const compiledFunction: CellStyleFunction = (rowData, cellValue, columnIndex, rowIndex) => {
      const context = this.buildEvaluationContext(rowData, cellValue, columnIndex, rowIndex);
      
      // Sort rules by priority (higher priority first)
      const sortedRules = rules
        .filter(rule => rule.enabled)
        .sort((a, b) => b.priority - a.priority);

      for (const rule of sortedRules) {
        try {
          if (this.evaluateRule(rule.condition, context)) {
            return this.processStyles(rule.styles, context);
          }
        } catch (error) {
          console.warn(`Error evaluating style rule ${rule.id}:`, error);
        }
      }

      return null;
    };

    this.compiledRules.set(ruleId, compiledFunction);
    return compiledFunction;
  }

  /**
   * Compiles advanced value mapping into executable functions
   */
  compileValueMapping(mapping: AdvancedValueMapping): ValueMappingFunction {
    const ruleId = this.generateRuleId('mapping', mapping);
    
    if (this.compiledRules.has(ruleId)) {
      return this.compiledRules.get(ruleId);
    }

    const compiledFunction: ValueMappingFunction = (rowData, cellValue, columnIndex, rowIndex) => {
      const context = this.buildEvaluationContext(rowData, cellValue, columnIndex, rowIndex);
      
      // Check cache if enabled
      if (mapping.cacheEnabled) {
        const cacheKey = this.generateCacheKey(mapping.id, context);
        const cached = this.ruleCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < (mapping.cacheDuration || 5) * 60000) {
          return cached.value;
        }
      }

      // Sort rules by priority
      const sortedRules = mapping.rules
        .filter(rule => rule.enabled)
        .sort((a, b) => b.priority - a.priority);

      for (const rule of sortedRules) {
        try {
          if (this.evaluateRule(rule.condition, context)) {
            const result = this.processOutputValue(rule, context);
            
            // Cache result if enabled
            if (mapping.cacheEnabled) {
              const cacheKey = this.generateCacheKey(mapping.id, context);
              this.ruleCache.set(cacheKey, {
                value: result,
                timestamp: Date.now()
              });
            }
            
            return result;
          }
        } catch (error) {
          console.warn(`Error evaluating mapping rule ${rule.id}:`, error);
        }
      }

      // Return default value or original value
      return mapping.defaultValue !== undefined 
        ? mapping.defaultValue 
        : (mapping.fallbackToOriginal ? cellValue : null);
    };

    this.compiledRules.set(ruleId, compiledFunction);
    return compiledFunction;
  }

  /**
   * Compiles visibility rules into executable functions
   */
  compileVisibilityRules(rules: VisibilityRule[]): VisibilityFunction {
    const ruleId = this.generateRuleId('visibility', rules);
    
    if (this.compiledRules.has(ruleId)) {
      return this.compiledRules.get(ruleId);
    }

    const compiledFunction: VisibilityFunction = (rowData, cellValue, columnIndex, rowIndex) => {
      const context = this.buildEvaluationContext(rowData, cellValue, columnIndex, rowIndex);
      
      // Default visibility is true
      let isVisible = true;
      
      // Sort rules by priority
      const sortedRules = rules
        .filter(rule => rule.enabled)
        .sort((a, b) => b.priority - a.priority);

      for (const rule of sortedRules) {
        try {
          if (this.evaluateRule(rule.condition, context)) {
            isVisible = rule.action === 'show';
            break; // First matching rule wins
          }
        } catch (error) {
          console.warn(`Error evaluating visibility rule ${rule.id}:`, error);
        }
      }

      return isVisible;
    };

    this.compiledRules.set(ruleId, compiledFunction);
    return compiledFunction;
  }

  /**
   * Validates a rule against sample data
   */
  validateRule(rule: VisualRule, sampleData: any[]): ValidationResult {
    const results: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      coverage: 0,
      performance: 0
    };

    const startTime = performance.now();
    let matchCount = 0;

    try {
      for (const data of sampleData) {
        const context = this.buildEvaluationContext(data, data[Object.keys(data)[0]]);
        
        try {
          const matches = this.evaluateRule(rule, context);
          if (matches) matchCount++;
        } catch (error) {
          results.errors.push({
            type: 'runtime',
            message: `Runtime error: ${(error as Error).message}`,
            data: data
          });
        }
      }

      results.coverage = sampleData.length > 0 ? (matchCount / sampleData.length) * 100 : 0;
      results.performance = performance.now() - startTime;

      // Add warnings for edge cases
      if (results.coverage === 0) {
        results.warnings.push({
          type: 'coverage',
          message: 'Rule does not match any sample data'
        });
      } else if (results.coverage === 100) {
        results.warnings.push({
          type: 'coverage',
          message: 'Rule matches all sample data - consider making it more specific'
        });
      }

      if (results.performance > 100) {
        results.warnings.push({
          type: 'performance',
          message: 'Rule evaluation took longer than expected'
        });
      }

    } catch (error) {
      results.isValid = false;
      results.errors.push({
        type: 'compilation',
        message: `Compilation error: ${(error as Error).message}`
      });
    }

    return results;
  }

  /**
   * Evaluates a rule using the visual builder engine
   */
  private evaluateRule(rule: VisualRule, context: any): boolean {
    try {
      // Use the specification bridge to evaluate the rule
      // Placeholder for specification evaluation
      return true;
    } catch (error) {
      console.warn(`Error evaluating rule: ${rule.description}`, error);
      return false;
    }
  }

  /**
   * Builds evaluation context for rule execution
   */
  private buildEvaluationContext(rowData: any, cellValue: any, columnIndex?: number, rowIndex?: number): any {
    return {
      // Row data with all field values
      ...rowData,
      
      // Special context variables
      _cellValue: cellValue,
      _columnIndex: columnIndex,
      _rowIndex: rowIndex,
      _now: new Date(),
      
      // Utility functions available in rules
      _utils: {
        isNull: (value: any) => value === null || value === undefined,
        isEmpty: (value: any) => value === null || value === undefined || value === '',
        isNumeric: (value: any) => !isNaN(parseFloat(value)) && isFinite(value),
        formatDate: (date: any, format: string) => this.formatDate(date, format),
        formatNumber: (num: any, decimals: number) => this.formatNumber(num, decimals),
        inRange: (value: any, min: number, max: number) => value >= min && value <= max,
        contains: (text: any, search: string) => String(text).toLowerCase().includes(search.toLowerCase()),
        matches: (text: any, pattern: string) => new RegExp(pattern).test(String(text))
      }
    };
  }

  /**
   * Processes styles with dynamic values
   */
  private processStyles(styles: CellStyles, context: any): CellStyles {
    const processedStyles: CellStyles = {};

    for (const [key, value] of Object.entries(styles)) {
      if (typeof value === 'string' && value.includes('${')) {
        // Process template strings
        try {
          (processedStyles as any)[key] = this.processTemplate(value, context);
        } catch (error) {
          console.warn(`Error processing style template for ${key}:`, error);
          (processedStyles as any)[key] = value;
        }
      } else {
        (processedStyles as any)[key] = value;
      }
    }

    return processedStyles;
  }

  /**
   * Processes output value with dynamic content
   */
  private processOutputValue(rule: ValueMappingRule, context: any): any {
    if (rule.outputType === 'text' && typeof rule.outputValue === 'string') {
      return this.processTemplate(rule.outputValue, context);
    }
    
    return rule.outputValue;
  }

  /**
   * Processes template strings with context variables
   */
  private processTemplate(template: string, context: any): string {
    return template.replace(/\$\{([^}]+)\}/g, (match, expression) => {
      try {
        // Create a safe evaluation function
        const func = new Function(...Object.keys(context), `return ${expression}`);
        const result = func(...Object.values(context));
        return String(result);
      } catch (error) {
        console.warn(`Error evaluating template expression ${expression}:`, error);
        return match; // Return original if evaluation fails
      }
    });
  }

  /**
   * Generates unique rule ID for caching
   */
  private generateRuleId(type: string, rules: any): string {
    const ruleString = JSON.stringify(rules);
    return `${type}_${this.simpleHash(ruleString)}`;
  }

  /**
   * Generates cache key for rule results
   */
  private generateCacheKey(ruleId: string, context: any): string {
    const contextString = JSON.stringify(context);
    return `${ruleId}_${this.simpleHash(contextString)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Utility functions for template processing
   */
  private formatDate(date: any, format: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    
    // Simple date formatting - could be enhanced with a library like date-fns
    switch (format) {
      case 'short': return d.toLocaleDateString();
      case 'long': return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
      case 'iso': return d.toISOString();
      default: return d.toLocaleDateString();
    }
  }

  private formatNumber(num: any, decimals: number): string {
    if (isNaN(parseFloat(num))) return String(num);
    return parseFloat(num).toFixed(decimals);
  }

  /**
   * Clears compilation cache
   */
  clearCache(): void {
    this.compiledRules.clear();
    this.ruleCache.clear();
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): CacheStats {
    return {
      compiledRulesCount: this.compiledRules.size,
      cachedResultsCount: this.ruleCache.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimation in bytes
    return (this.compiledRules.size + this.ruleCache.size) * 1024;
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  coverage: number; // Percentage of sample data that matches the rule
  performance: number; // Evaluation time in milliseconds
}

export interface ValidationError {
  type: 'compilation' | 'runtime' | 'syntax';
  message: string;
  data?: any;
}

export interface ValidationWarning {
  type: 'coverage' | 'performance' | 'best-practice';
  message: string;
}

export interface CacheStats {
  compiledRulesCount: number;
  cachedResultsCount: number;
  memoryUsage: number; // in bytes
}