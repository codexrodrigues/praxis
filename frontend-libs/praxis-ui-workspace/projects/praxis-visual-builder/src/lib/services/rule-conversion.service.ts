import { Injectable } from '@angular/core';
import { Specification, DslExporter, ExportOptions } from 'praxis-specification';
import { RuleNode } from '../models/rule-builder.model';
import { ConverterFactoryService } from './converters/converter-factory.service';
import { DslParsingService, DslParsingConfig, DslParsingResult } from './dsl/dsl-parsing.service';
import { ContextManagementService, ContextualConfig } from './context/context-management.service';
import { ConversionError, createError, globalErrorHandler } from '../errors/visual-builder-errors';

/**
 * Simplified service for core rule conversion operations
 * Replaces the God Service anti-pattern from SpecificationBridgeService
 * Focuses only on conversion between RuleNodes and Specifications
 */
@Injectable({
  providedIn: 'root'
})
export class RuleConversionService {
  private dslExporter: DslExporter;

  constructor(
    private converterFactory: ConverterFactoryService,
    private dslParsingService: DslParsingService,
    private contextManagementService: ContextManagementService
  ) {
    this.dslExporter = new DslExporter({
      prettyPrint: true,
      indentSize: 2,
      maxLineLength: 80,
      useParentheses: 'auto',
      includeMetadata: true,
      metadataPosition: 'before'
    });
  }

  /**
   * Convert a RuleNode tree to a Specification instance
   * Core conversion functionality with clean error handling
   */
  convertRuleToSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node) {
      const error = createError.conversion('INVALID_INPUT', 'Node cannot be null or undefined');
      globalErrorHandler.handle(error);
      throw error;
    }

    if (!node.config?.type) {
      const error = createError.conversion(
        'MISSING_CONFIGURATION', 
        `Node ${node.id} is missing configuration or type`,
        node.id
      );
      globalErrorHandler.handle(error);
      throw error;
    }

    try {
      return this.converterFactory.convert<T>(node);
    } catch (error) {
      const conversionError = createError.conversion(
        'CONVERSION_FAILED',
        `Failed to convert node ${node.id}`,
        node.id
      );
      globalErrorHandler.handle(conversionError);
      throw conversionError;
    }
  }

  /**
   * Convert a Specification back to a RuleNode tree
   * Simplified reverse conversion
   */
  convertSpecificationToRule<T extends object = any>(spec: Specification<T>): RuleNode {
    if (!spec) {
      throw new ConversionError('INVALID_INPUT', 'Specification cannot be null or undefined');
    }

    try {
      const specJson = spec.toJSON();
      return this.jsonToRuleNode(specJson);
    } catch (error) {
      throw new ConversionError(
        'REVERSE_CONVERSION_FAILED',
        'Failed to convert specification to rule node',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Export a RuleNode tree to DSL format
   */
  exportRuleToDsl<T extends object = any>(
    node: RuleNode, 
    options?: Partial<ExportOptions>
  ): string {
    try {
      const specification = this.convertRuleToSpecification<T>(node);
      return this.dslExporter.export(specification, options);
    } catch (error) {
      throw new ConversionError(
        'DSL_EXPORT_FAILED',
        `Failed to export rule to DSL`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Import a RuleNode tree from DSL format
   */
  importRuleFromDsl<T extends object = any>(
    dslExpression: string,
    config?: DslParsingConfig
  ): DslParsingResult<T> {
    if (!dslExpression || dslExpression.trim().length === 0) {
      throw new ConversionError('INVALID_INPUT', 'DSL expression cannot be empty');
    }

    try {
      return this.dslParsingService.parseDsl<T>(dslExpression, config);
    } catch (error) {
      throw new ConversionError(
        'DSL_IMPORT_FAILED',
        'Failed to import rule from DSL',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Create a contextual specification from a RuleNode
   */
  createContextualSpecification<T extends object = any>(
    node: RuleNode,
    contextConfig: ContextualConfig
  ): Specification<T> {
    try {
      const contextProvider = contextConfig.contextProvider || 
        (contextConfig.contextVariables ? 
          this.contextManagementService.createContextProvider(contextConfig.contextVariables) : 
          undefined
        );

      if (!contextProvider) {
        throw new ConversionError(
          'MISSING_CONTEXT',
          'Context provider or context variables are required for contextual specification'
        );
      }

      // Convert the rule normally first
      const baseSpecification = this.convertRuleToSpecification<T>(node);

      // TODO: Wrap in contextual specification
      // This would require ContextualSpecification from praxis-specification
      return baseSpecification;
      
    } catch (error) {
      throw new ConversionError(
        'CONTEXTUAL_CONVERSION_FAILED',
        'Failed to create contextual specification',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validate that a rule can be converted
   */
  validateConversion(node: RuleNode): ConversionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!node) {
      errors.push('Node cannot be null or undefined');
      return { isValid: false, errors, warnings };
    }

    if (!node.id) {
      errors.push('Node is missing required ID');
    }

    if (!node.config) {
      errors.push(`Node ${node.id} is missing configuration`);
      return { isValid: false, errors, warnings };
    }

    if (!node.config.type) {
      errors.push(`Node ${node.id} is missing type in configuration`);
    }

    // Check if converter exists
    const factoryValidation = this.converterFactory.validateNode(node);
    if (!factoryValidation.isValid) {
      errors.push(...factoryValidation.errors);
    }

    // Warnings for potential issues
    if (node.children && node.children.length > 20) {
      warnings.push(`Node ${node.id} has many children (${node.children.length}) which may impact performance`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get conversion statistics
   */
  getConversionStatistics(): ConversionStatistics {
    const factoryStats = this.converterFactory.getStatistics();
    
    return {
      supportedNodeTypes: factoryStats.supportedTypes.length,
      registeredConverters: factoryStats.converterCount,
      availableNodeTypes: factoryStats.supportedTypes,
      converterNames: factoryStats.converterNames
    };
  }

  private jsonToRuleNode(json: any): RuleNode {
    // Simplified JSON to RuleNode conversion
    // This would need to be implemented based on the actual JSON structure
    // from praxis-specification
    
    return {
      id: json.id || `node-${Date.now()}`,
      type: json.type || 'fieldCondition',
      config: {
        type: json.type || 'fieldCondition',
        ...json.config
      }
    };
  }
}


/**
 * Result of conversion validation
 */
export interface ConversionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Statistics about conversion capabilities
 */
export interface ConversionStatistics {
  supportedNodeTypes: number;
  registeredConverters: number;
  availableNodeTypes: string[];
  converterNames: string[];
}