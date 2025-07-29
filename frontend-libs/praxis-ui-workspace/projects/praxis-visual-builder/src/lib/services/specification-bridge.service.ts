import { Injectable } from '@angular/core';
import { Specification, SpecificationMetadata, ComparisonOperator } from 'praxis-specification';
import { SpecificationFactory } from 'praxis-specification';
import { DslExporter, ExportOptions } from 'praxis-specification';
import { DslParser, DslValidator, ValidationIssue } from 'praxis-specification';
import { ContextualSpecification } from 'praxis-specification';
import { ContextProvider } from 'praxis-specification';
import { FunctionRegistry } from 'praxis-specification';
import { 
  RuleNode, 
  RuleNodeType, 
  ValueType, 
  CardinalityConfig, 
  FunctionParameter,
  ConditionalValidatorConfig,
  CollectionValidatorConfig,
  FieldConditionConfig,
  BooleanGroupConfig,
  FunctionCallConfig,
  FieldToFieldConfig,
  ContextualConfig
} from '../models/rule-builder.model';
import { ContextVariable } from '../components/expression-editor.component';
import { RuleNodeRegistryService } from './rule-node-registry.service';
import { ConverterFactoryService } from './converters/converter-factory.service';

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
  specification?: Specification<T>;
  /** Validation issues found */
  issues: ValidationIssue[];
  /** Performance metrics */
  metrics?: {
    parseTime: number;
    complexity: number;
  };
}

/**
 * Configuration for contextual specification support
 */
export interface SpecificationContextualConfig {
  /** Context variables available for token resolution */
  contextVariables?: ContextVariable[];
  /** Context provider instance */
  contextProvider?: ContextProvider;
  /** Enable strict validation of context tokens */
  strictContextValidation?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SpecificationBridgeService {
  private dslExporter: DslExporter;
  private dslParser: DslParser<any>;
  private dslValidator: DslValidator;
  private contextProvider?: ContextProvider;

  constructor(
    private nodeRegistry: RuleNodeRegistryService,
    private converterFactory: ConverterFactoryService
  ) {
    this.dslExporter = new DslExporter({
      prettyPrint: true,
      indentSize: 2,
      maxLineLength: 80,
      useParentheses: 'auto',
      includeMetadata: true,
      metadataPosition: 'before'
    });
    
    this.dslParser = new DslParser();
    this.dslValidator = new DslValidator();
  }

  /**
   * Converts a RuleNode tree to a Specification instance
   */
  ruleNodeToSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    try {
      // Use the config type for converter lookup (more reliable than node.type)
      const nodeType = node.config?.type || node.type;
      
      // Check if we have a converter for this node type
      if (this.converterFactory.isSupported(nodeType)) {
        return this.converterFactory.convert<T>(node);
      }
      
      // Fall back to legacy methods for unsupported types
      switch (nodeType) {
        case 'functionCall':
          return this.createFunctionSpecification<T>(node);
        
        case 'fieldToField':
          return this.createFieldToFieldSpecification<T>(node);
        
        // Phase 1: Conditional Validators
        case 'requiredIf':
        case 'visibleIf':
        case 'disabledIf':
        case 'readonlyIf':
          return this.createConditionalValidatorSpecification<T>(node);
        
        // Phase 2: Collection Validators
        case 'forEach':
        case 'uniqueBy':
        case 'minLength':
        case 'maxLength':
          return this.createCollectionValidatorSpecification<T>(node);
        
        // Phase 4: Expression and Contextual Support
        case 'expression':
          return this.createExpressionSpecification<T>(node);
        
        case 'contextual':
          return this.createContextualSpecificationFromNode<T>(node);
        
        default:
          throw new Error(`Unsupported rule node type: ${nodeType}`);
      }
    } catch (error) {
      throw new Error(`Failed to convert rule node to specification: ${error}`);
    }
  }

  /**
   * Converts a Specification instance to a RuleNode tree
   */
  specificationToRuleNode<T extends object = any>(spec: Specification<T>): RuleNode {
    const specJson = spec.toJSON();
    return this.jsonToRuleNode(specJson);
  }

  /**
   * Exports a RuleNode tree to DSL format
   */
  exportToDsl<T extends object = any>(node: RuleNode, options?: Partial<ExportOptions>): string {
    if (options) {
      this.dslExporter = new DslExporter(options);
    }
    
    const specification = this.ruleNodeToSpecification<T>(node);
    return this.dslExporter.export(specification);
  }

  /**
   * Exports a RuleNode tree to DSL format with metadata
   */
  exportToDslWithMetadata<T extends object = any>(node: RuleNode): string {
    const specification = this.ruleNodeToSpecification<T>(node);
    return this.dslExporter.exportWithMetadata(specification);
  }

  /**
   * Validates that a RuleNode can be successfully round-tripped
   */
  validateRoundTrip<T extends object = any>(node: RuleNode): {
    success: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Convert to specification
      const specification = this.ruleNodeToSpecification<T>(node);
      
      // Export to DSL and re-parse
      const dsl = this.exportToDsl<T>(node);
      
      // Convert back to rule node via specification
      const reconstructedNode = this.specificationToRuleNode(specification);
      
      // Deep validation
      const deepValidation = this.deepValidateRoundTrip(node, reconstructedNode);
      errors.push(...deepValidation.errors);
      warnings.push(...deepValidation.warnings);
      
      // DSL round-trip validation
      try {
        const dslValidation = this.validateDslRoundTrip(dsl, node);
        warnings.push(...dslValidation.warnings);
      } catch (dslError) {
        warnings.push(`DSL round-trip validation failed: ${dslError}`);
      }

      return {
        success: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Round-trip validation failed: ${error}`);
      return {
        success: false,
        errors,
        warnings
      };
    }
  }

  /**
   * Performs deep validation between original and reconstructed nodes
   */
  private deepValidateRoundTrip(original: RuleNode, reconstructed: RuleNode): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Type validation
    if (original.type !== reconstructed.type) {
      errors.push(`Node type mismatch: ${original.type} vs ${reconstructed.type}`);
    }

    // Label validation
    if (original.label !== reconstructed.label) {
      warnings.push(`Label changed: "${original.label}" vs "${reconstructed.label}"`);
    }

    // Config validation
    if (original.config && reconstructed.config) {
      const configComparison = this.compareConfigs(original.config, reconstructed.config);
      errors.push(...configComparison.errors);
      warnings.push(...configComparison.warnings);
    } else if (original.config !== reconstructed.config) {
      warnings.push('Configuration presence mismatch');
    }

    // Metadata validation
    if (original.metadata && reconstructed.metadata) {
      if (original.metadata.code !== reconstructed.metadata.code) {
        warnings.push('Metadata code changed during round-trip');
      }
      if (original.metadata.message !== reconstructed.metadata.message) {
        warnings.push('Metadata message changed during round-trip');
      }
      if (original.metadata['severity'] !== reconstructed.metadata['severity']) {
        warnings.push('Metadata severity changed during round-trip');
      }
    } else if (!!original.metadata !== !!reconstructed.metadata) {
      warnings.push('Metadata presence changed during round-trip');
    }

    // Children validation
    const originalChildCount = original.children?.length || 0;
    const reconstructedChildCount = reconstructed.children?.length || 0;
    
    if (originalChildCount !== reconstructedChildCount) {
      errors.push(`Child count mismatch: ${originalChildCount} vs ${reconstructedChildCount}`);
    } else if (original.children && reconstructed.children) {
      // Recursively validate children
      for (let i = 0; i < original.children.length; i++) {
        const originalChild = original.children[i];
        const reconstructedChild = reconstructed.children[i];
        
        if (typeof originalChild === 'object' && typeof reconstructedChild === 'object') {
          const childValidation = this.deepValidateRoundTrip(
            originalChild as RuleNode, 
            reconstructedChild as RuleNode
          );
          errors.push(...childValidation.errors.map(e => `Child ${i}: ${e}`));
          warnings.push(...childValidation.warnings.map(w => `Child ${i}: ${w}`));
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Compares two configuration objects
   */
  private compareConfigs(config1: any, config2: any): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const config1Json = JSON.stringify(config1, Object.keys(config1).sort());
      const config2Json = JSON.stringify(config2, Object.keys(config2).sort());
      
      if (config1Json !== config2Json) {
        warnings.push('Configuration values changed during round-trip');
      }
    } catch (error) {
      warnings.push(`Failed to compare configurations: ${error}`);
    }

    return { errors, warnings };
  }

  /**
   * Validates DSL round-trip conversion
   */
  private validateDslRoundTrip(dsl: string, originalNode: RuleNode): {
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Basic DSL validation
    if (!dsl || dsl.trim().length === 0) {
      warnings.push('DSL export resulted in empty string');
      return { warnings };
    }

    // Check for expected keywords based on node type
    const expectedKeywords = this.getExpectedDslKeywords(originalNode);
    for (const keyword of expectedKeywords) {
      if (!dsl.includes(keyword)) {
        warnings.push(`Expected DSL keyword '${keyword}' not found in output`);
      }
    }

    return { warnings };
  }

  // ===== Phase 4: Expression and Contextual Specification Support =====

  /**
   * Parses a DSL expression string into a Specification
   */
  parseDslExpression<T extends object = any>(
    expression: string, 
    config?: DslParsingConfig
  ): DslParsingResult<T> {
    const startTime = performance.now();
    const issues: ValidationIssue[] = [];
    
    try {
      // Configure parser and validator
      if (config?.functionRegistry) {
        this.dslParser = new DslParser<T>(config.functionRegistry);
      }
      
      if (config?.knownFields || config?.enablePerformanceWarnings !== undefined || config?.maxComplexity) {
        this.dslValidator = new DslValidator({
          knownFields: config?.knownFields || [],
          enablePerformanceWarnings: config?.enablePerformanceWarnings ?? true,
          maxComplexity: config?.maxComplexity || 50,
          functionRegistry: config?.functionRegistry
        });
      }

      // Validate the expression first
      const validationIssues = this.dslValidator.validate(expression);
      issues.push(...validationIssues);

      // Check for errors that would prevent parsing
      const hasErrors = validationIssues.some(issue => issue.severity === 'error');
      if (hasErrors) {
        return {
          success: false,
          issues,
          metrics: {
            parseTime: performance.now() - startTime,
            complexity: this.calculateComplexity(expression)
          }
        };
      }

      // Parse the expression
      const specification = this.dslParser.parse(expression);
      const parseTime = performance.now() - startTime;

      return {
        success: true,
        specification,
        issues,
        metrics: {
          parseTime,
          complexity: this.calculateComplexity(expression)
        }
      };

    } catch (error) {
      issues.push({
        type: 'SyntaxError' as any,
        severity: 'error' as any,
        message: `Parse error: ${error}`,
        position: { start: 0, end: expression.length, line: 1, column: 1 }
      });

      return {
        success: false,
        issues,
        metrics: {
          parseTime: performance.now() - startTime,
          complexity: this.calculateComplexity(expression)
        }
      };
    }
  }

  /**
   * Creates a ContextualSpecification with token resolution
   */
  createContextualSpecification<T extends object = any>(
    template: string,
    config?: SpecificationContextualConfig
  ): ContextualSpecification<T> {
    const contextProvider = config?.contextProvider || this.createContextProviderFromVariables(config?.contextVariables || []);
    
    if (config?.strictContextValidation) {
      this.validateContextTokens(template, config.contextVariables || []);
    }

    return SpecificationFactory.contextual<T>(template, contextProvider);
  }

  /**
   * Resolves context tokens in a template using provided variables
   */
  resolveContextTokens(template: string, contextVariables: ContextVariable[]): string {
    const contextProvider = this.createContextProviderFromVariables(contextVariables);
    const contextualSpec = new ContextualSpecification(template, contextProvider);
    
    // Create a dummy object to resolve tokens against
    const dummyObj = {};
    return contextualSpec.resolveTokens(template, dummyObj);
  }

  /**
   * Extracts all context tokens from a template
   */
  extractContextTokens(template: string): string[] {
    const contextualSpec = new ContextualSpecification(template);
    return contextualSpec.getTokens();
  }

  /**
   * Validates that all context tokens in a template have corresponding variables
   */
  validateContextTokens(template: string, contextVariables: ContextVariable[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const tokens = this.extractContextTokens(template);
    const variableNames = contextVariables.map(v => v.name);
    
    for (const token of tokens) {
      if (!variableNames.includes(token)) {
        issues.push({
          type: 'InvalidFieldReference' as any,
          severity: 'warning' as any,
          message: `Unknown context variable: ${token}`,
          position: this.findTokenPosition(template, token),
          suggestion: this.suggestSimilarVariable(token, variableNames),
          help: `Available variables: ${variableNames.join(', ')}`
        });
      }
    }
    
    return issues;
  }

  /**
   * Converts a DSL expression to a ContextualSpecification
   */
  dslToContextualSpecification<T extends object = any>(
    dslExpression: string,
    config?: SpecificationContextualConfig
  ): ContextualSpecification<T> {
    // Validate that the DSL contains context tokens
    const tokens = this.extractContextTokens(dslExpression);
    if (tokens.length === 0) {
      throw new Error('DSL expression does not contain context tokens (${...})');
    }

    return this.createContextualSpecification<T>(dslExpression, config);
  }

  /**
   * Converts a ContextualSpecification back to DSL template
   */
  contextualSpecificationToDsl<T extends object = any>(spec: ContextualSpecification<T>): string {
    return spec.toDSL();
  }

  /**
   * Performs round-trip validation for expression specifications
   */
  validateExpressionRoundTrip<T extends object = any>(
    originalExpression: string,
    config?: DslParsingConfig
  ): {
    success: boolean;
    errors: string[];
    warnings: string[];
    reconstructedExpression?: string;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Parse the original expression
      const parseResult = this.parseDslExpression<T>(originalExpression, config);
      
      if (!parseResult.success || !parseResult.specification) {
        errors.push('Failed to parse original expression');
        parseResult.issues.forEach(issue => {
          if (issue.severity === 'error') {
            errors.push(issue.message);
          } else {
            warnings.push(issue.message);
          }
        });
        
        return { success: false, errors, warnings };
      }

      // Export back to DSL
      const reconstructedExpression = parseResult.specification.toDSL();
      
      // Parse the reconstructed expression
      const reconstructedParseResult = this.parseDslExpression<T>(reconstructedExpression, config);
      
      if (!reconstructedParseResult.success) {
        errors.push('Failed to parse reconstructed expression');
        return { success: false, errors, warnings, reconstructedExpression };
      }

      // Compare the specifications
      const originalJson = JSON.stringify(parseResult.specification.toJSON());
      const reconstructedJson = JSON.stringify(reconstructedParseResult.specification!.toJSON());
      
      if (originalJson !== reconstructedJson) {
        warnings.push('Specification structure changed during round-trip');
      }

      return {
        success: errors.length === 0,
        errors,
        warnings,
        reconstructedExpression
      };

    } catch (error) {
      errors.push(`Round-trip validation failed: ${error}`);
      return { success: false, errors, warnings };
    }
  }

  /**
   * Updates the context provider for contextual specifications
   */
  updateContextProvider(contextProvider: ContextProvider): void {
    this.contextProvider = contextProvider;
  }

  /**
   * Gets the current context provider
   */
  getContextProvider(): ContextProvider | undefined {
    return this.contextProvider;
  }

  /**
   * Gets expected DSL keywords for a given node type
   */
  private getExpectedDslKeywords(node: RuleNode): string[] {
    const keywords: string[] = [];

    switch (node.type) {
      case 'fieldCondition':
        const config = node.config as any;
        const fieldName = config?.field || config?.fieldName;
        if (fieldName) {
          keywords.push(fieldName as string);
        }
        if (config?.operator) {
          keywords.push(config.operator as string);
        }
        break;
      
      case 'andGroup':
      case 'orGroup':
      case 'notGroup':
        const boolConfig = node.config as any;
        if (boolConfig?.operator) {
          keywords.push((boolConfig.operator as string).toUpperCase());
        }
        break;
      
      case 'functionCall':
        const funcConfig = node.config as any;
        if (funcConfig?.functionName) {
          keywords.push(funcConfig.functionName as string);
        }
        break;
    }

    return keywords;
  }

  private createFieldSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    const config = node.config as any;
    const fieldName = config?.field || config?.fieldName;
    
    if (!fieldName || !config?.operator || config?.value === undefined) {
      throw new Error('Field specification requires field, operator, and value');
    }

    const field = fieldName as keyof T;
    const operator = this.convertToComparisonOperator(config.operator);
    const value = this.convertValue(config.value, config.valueType);

    let spec: Specification<T>;
    if (node.metadata) {
      spec = SpecificationFactory.fieldWithMetadata<T>(field, operator, value, node.metadata);
    } else {
      spec = SpecificationFactory.field<T>(field, operator, value);
    }

    return spec;
  }

  private createBooleanGroupSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node.children || node.children.length === 0) {
      throw new Error('Boolean group requires children');
    }

    // Resolve children nodes using the registry
    const childNodes = this.nodeRegistry.resolveChildren(node);
    const childSpecs = childNodes.map(child => this.ruleNodeToSpecification<T>(child));
    const booleanConfig = node.config as any;
    const operator = booleanConfig?.operator || 'and';

    switch (operator.toLowerCase()) {
      case 'and':
        return SpecificationFactory.and<T>(...childSpecs);
      
      case 'or':
        return SpecificationFactory.or<T>(...childSpecs);
      
      case 'not':
        if (childSpecs.length !== 1) {
          throw new Error('NOT operator requires exactly one child');
        }
        return SpecificationFactory.not<T>(childSpecs[0]);
      
      case 'xor':
        return SpecificationFactory.xor<T>(...childSpecs);
      
      case 'implies':
        if (childSpecs.length !== 2) {
          throw new Error('IMPLIES operator requires exactly two children');
        }
        return SpecificationFactory.implies<T>(childSpecs[0], childSpecs[1]);
      
      default:
        throw new Error(`Unsupported boolean operator: ${operator}`);
    }
  }

  private createFunctionSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    const functionConfig = node.config as any;
    if (!functionConfig?.functionName) {
      throw new Error('Function specification requires functionName');
    }

    const functionName = functionConfig.functionName;
    const parameters = functionConfig.parameters || [];
    
    // Convert parameters to function arguments
    const args = parameters.map((param: FunctionParameter) => {
      return this.convertValue(param.value, param.valueType);
    });

    return SpecificationFactory.func<T>(functionName, args);
  }

  private createFieldToFieldSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    const fieldConfig = node.config as any;
    if (!fieldConfig?.fieldA || !fieldConfig?.fieldB || !fieldConfig?.operator) {
      throw new Error('Field-to-field specification requires fieldA, fieldB, and operator');
    }

    const fieldA = fieldConfig.fieldA as keyof T;
    const fieldB = fieldConfig.fieldB as keyof T;
    const operator = this.convertToComparisonOperator(fieldConfig.operator);
    const transformA = fieldConfig.transformA;
    const transformB = fieldConfig.transformB;

    return SpecificationFactory.fieldToField<T>(
      fieldA,
      operator,
      fieldB,
      transformA,
      transformB
    );
  }

  private createCardinalitySpecification<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node.children || node.children.length === 0 || !node.config) {
      throw new Error('Cardinality specification requires children and config');
    }

    // Resolve children nodes using the registry
    const childNodes = this.nodeRegistry.resolveChildren(node);
    const childSpecs = childNodes.map(child => this.ruleNodeToSpecification<T>(child));
    const config = node.config as CardinalityConfig;

    switch (config.cardinalityType) {
      case 'atLeast':
        return SpecificationFactory.atLeast<T>(config.count, childSpecs);
      
      case 'exactly':
        return SpecificationFactory.exactly<T>(config.count, childSpecs);
      
      default:
        throw new Error(`Unsupported cardinality type: ${config.cardinalityType}`);
    }
  }

  /**
   * Creates conditional validator specifications (Phase 1 implementation)
   */
  private createConditionalValidatorSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node.config || node.config.type !== 'conditionalValidator') {
      throw new Error('Conditional validator specification requires conditionalValidator config');
    }

    const config = node.config as ConditionalValidatorConfig;
    
    if (!config.targetField || !config.condition) {
      throw new Error('Conditional validator requires targetField and condition');
    }

    // Convert the condition node to a specification
    const conditionSpec = this.ruleNodeToSpecification<T>(config.condition);
    
    // Apply inverse if specified
    const finalConditionSpec = config.inverse ? 
      SpecificationFactory.not<T>(conditionSpec) : 
      conditionSpec;

    const targetField = config.targetField as keyof T;
    const metadata = config.metadata;

    // Create the appropriate conditional validator specification
    // Note: Using generic factory methods - specific conditional validator factory methods 
    // should be implemented in praxis-specification when available
    let spec: Specification<T>;
    
    switch (config.validatorType) {
      case 'requiredIf':
        // Create a generic specification for requiredIf
        // This is a placeholder implementation - will be replaced when 
        // praxis-specification adds native support for conditional validators
        spec = SpecificationFactory.field<T>(targetField, ComparisonOperator.EQUALS, true);
        break;
      
      case 'visibleIf':
        // Placeholder implementation for visibleIf
        spec = SpecificationFactory.field<T>(targetField, ComparisonOperator.EQUALS, true);
        break;
      
      case 'disabledIf':
        // Placeholder implementation for disabledIf
        spec = SpecificationFactory.field<T>(targetField, ComparisonOperator.EQUALS, true);
        break;
      
      case 'readonlyIf':
        // Placeholder implementation for readonlyIf
        spec = SpecificationFactory.field<T>(targetField, ComparisonOperator.EQUALS, true);
        break;
      
      default:
        throw new Error(`Unsupported conditional validator type: ${config.validatorType}`);
    }
    
    return spec;
  }

  /**
   * Creates collection validator specifications (Phase 2 implementation)
   */
  private createCollectionValidatorSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node.config || !('type' in node.config)) {
      throw new Error('Collection validator specification requires config');
    }

    const config = node.config as CollectionValidatorConfig;
    
    if (!config.targetCollection) {
      throw new Error('Collection validator requires targetCollection');
    }

    const targetField = config.targetCollection as keyof T;

    // Create the appropriate collection validator specification
    // Note: Using placeholder implementations until praxis-specification adds native support
    let spec: Specification<T>;
    
    switch (node.type) {
      case 'forEach':
        // ForEach implementation placeholder
        // Would iterate through array items and apply validation rules
        if (!config.itemValidationRules || config.itemValidationRules.length === 0) {
          throw new Error('ForEach validator requires at least one validation rule');
        }
        
        // Create a placeholder that checks array exists
        spec = SpecificationFactory.field<T>(targetField, ComparisonOperator.NOT_EQUALS, null);
        break;
      
      case 'uniqueBy':
        // UniqueBy implementation placeholder
        // Would check uniqueness based on specified fields
        if (!config.uniqueByFields || config.uniqueByFields.length === 0) {
          throw new Error('UniqueBy validator requires at least one field');
        }
        
        // Create a placeholder that checks array exists
        spec = SpecificationFactory.field<T>(targetField, ComparisonOperator.NOT_EQUALS, null);
        break;
      
      case 'minLength':
        // MinLength implementation placeholder
        // Would check array has minimum number of items
        if (config.minItems === undefined) {
          throw new Error('MinLength validator requires minItems value');
        }
        
        // Create a placeholder that checks array exists
        spec = SpecificationFactory.field<T>(targetField, ComparisonOperator.NOT_EQUALS, null);
        break;
      
      case 'maxLength':
        // MaxLength implementation placeholder
        // Would check array doesn't exceed maximum items
        if (config.maxItems === undefined) {
          throw new Error('MaxLength validator requires maxItems value');
        }
        
        // Create a placeholder that checks array exists
        spec = SpecificationFactory.field<T>(targetField, ComparisonOperator.NOT_EQUALS, null);
        break;
      
      default:
        throw new Error(`Unsupported collection validator type: ${node.type}`);
    }
    
    return spec;
  }

  /**
   * Creates expression specification from DSL (Phase 4 implementation)
   */
  private createExpressionSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node.config || !('expression' in node.config)) {
      throw new Error('Expression specification requires expression in config');
    }

    const config = node.config as any;
    const expression = config.expression as string;
    
    if (!expression || expression.trim().length === 0) {
      throw new Error('Expression specification requires non-empty expression');
    }

    // Parse the DSL expression using the bridge service
    const parseConfig: DslParsingConfig = {
      functionRegistry: config.functionRegistry,
      contextProvider: config.contextProvider,
      knownFields: config.knownFields || [],
      enablePerformanceWarnings: config.enablePerformanceWarnings ?? true,
      maxComplexity: config.maxComplexity || 50
    };

    const parseResult = this.parseDslExpression<T>(expression, parseConfig);
    
    if (!parseResult.success || !parseResult.specification) {
      const errorMessages = parseResult.issues
        .filter(issue => issue.severity === 'error')
        .map(issue => issue.message)
        .join('; ');
      
      throw new Error(`Failed to parse DSL expression: ${errorMessages || 'Unknown parsing error'}`);
    }

    return parseResult.specification;
  }

  /**
   * Creates contextual specification (Phase 4 implementation)
   */
  private createContextualSpecificationFromNode<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node.config || !('template' in node.config)) {
      throw new Error('Contextual specification requires template in config');
    }

    const config = node.config as any;
    const template = config.template as string;
    
    if (!template || template.trim().length === 0) {
      throw new Error('Contextual specification requires non-empty template');
    }

    // Validate that the template contains context tokens
    const tokens = this.extractContextTokens(template);
    if (tokens.length === 0) {
      throw new Error('Contextual specification template must contain at least one context token (${...})');
    }

    const contextualConfig: SpecificationContextualConfig = {
      contextVariables: config.contextVariables || [],
      contextProvider: config.contextProvider,
      strictContextValidation: config.strictContextValidation ?? false
    };

    return this.createContextualSpecification<T>(template, contextualConfig);
  }

  private convertToComparisonOperator(operator: string): ComparisonOperator {
    switch (operator.toLowerCase()) {
      case 'equals':
      case '==':
      case '=':
        return ComparisonOperator.EQUALS;
      
      case 'notequals':
      case '!=':
      case '<>':
        return ComparisonOperator.NOT_EQUALS;
      
      case 'greaterthan':
      case '>':
        return ComparisonOperator.GREATER_THAN;
      
      case 'greaterthanorequal':
      case '>=':
        return ComparisonOperator.GREATER_THAN_OR_EQUAL;
      
      case 'lessthan':
      case '<':
        return ComparisonOperator.LESS_THAN;
      
      case 'lessthanorequal':
      case '<=':
        return ComparisonOperator.LESS_THAN_OR_EQUAL;
      
      case 'contains':
        return ComparisonOperator.CONTAINS;
      
      case 'startswith':
        return ComparisonOperator.STARTS_WITH;
      
      case 'endswith':
        return ComparisonOperator.ENDS_WITH;
      
      case 'in':
        return ComparisonOperator.IN;
      
      case 'notin':
        return ComparisonOperator.NOT_EQUALS; // Using NOT_EQUALS as fallback for NOT_IN
      
      case 'isnull':
        return ComparisonOperator.EQUALS; // Using EQUALS for IS_NULL check
      
      case 'isnotnull':
        return ComparisonOperator.NOT_EQUALS; // Using NOT_EQUALS for IS_NOT_NULL check
      
      default:
        throw new Error(`Unsupported comparison operator: ${operator}`);
    }
  }

  private convertValue(value: any, valueType?: ValueType): any {
    if (!valueType) {
      return value;
    }

    switch (valueType) {
      case 'literal':
        return value;
      
      case 'field':
        return `@${value}`; // Field reference prefix
      
      case 'context':
        return `$${value}`; // Context reference prefix
      
      case 'function':
        return value; // Function calls are handled separately
      
      default:
        return value;
    }
  }

  private jsonToRuleNode(json: any): RuleNode {
    const baseNode: RuleNode = {
      id: this.generateNodeId(),
      type: this.mapSpecificationTypeToNodeType(json.type),
      label: this.generateNodeLabel(json),
      config: undefined,
      metadata: json.metadata,
      children: []
    };

    switch (json.type) {
      case 'field':
        baseNode.config = {
          type: 'fieldCondition',
          field: json.field,
          fieldName: json.field,
          operator: this.mapComparisonOperator(json.operator),
          value: json.value,
          valueType: this.inferValueType(json.value)
        } as FieldConditionConfig;
        break;

      case 'and':
      case 'or':
      case 'xor':
        baseNode.config = {
          type: 'booleanGroup',
          operator: json.type
        } as BooleanGroupConfig;
        const childNodes = json.specs.map((spec: any) => this.jsonToRuleNode(spec));
        baseNode.children = childNodes.map((child: RuleNode) => child.id);
        break;

      case 'not':
        baseNode.config = {
          type: 'booleanGroup',
          operator: 'not'
        } as BooleanGroupConfig;
        const childNode = this.jsonToRuleNode(json.spec);
        baseNode.children = [childNode.id];
        break;

      case 'implies':
        baseNode.config = {
          type: 'booleanGroup',
          operator: 'implies'
        } as BooleanGroupConfig;
        const antecedent = this.jsonToRuleNode(json.antecedent);
        const consequent = this.jsonToRuleNode(json.consequent);
        baseNode.children = [antecedent.id, consequent.id];
        break;

      case 'function':
        baseNode.config = {
          type: 'functionCall',
          functionName: json.name,
          parameters: json.args.map((arg: any, index: number) => ({
            name: `param${index}`,
            value: arg,
            valueType: this.inferValueType(arg)
          }))
        } as FunctionCallConfig;
        break;

      case 'fieldToField':
        baseNode.config = {
          type: 'fieldToField',
          leftField: json.fieldA,
          rightField: json.fieldB,
          operator: this.mapComparisonOperator(json.operator),
          leftTransforms: json.transformA ? [json.transformA] : [],
          rightTransforms: json.transformB ? [json.transformB] : []
        } as FieldToFieldConfig;
        break;

      case 'atLeast':
        baseNode.config = {
          type: 'cardinality',
          cardinalityType: 'atLeast',
          count: json.minimum || json.count,
          conditions: []
        };
        baseNode.children = json.specs.map((spec: any) => this.jsonToRuleNode(spec));
        break;

      case 'exactly':
        baseNode.config = {
          type: 'cardinality',
          cardinalityType: 'exactly',
          count: json.exact || json.count,
          conditions: []
        };
        baseNode.children = json.specs.map((spec: any) => this.jsonToRuleNode(spec));
        break;

      // Phase 1: Conditional Validators
      case 'requiredIf':
      case 'visibleIf':
      case 'disabledIf':
      case 'readonlyIf':
        baseNode.config = {
          type: 'conditionalValidator',
          validatorType: json.type,
          targetField: json.targetField,
          condition: this.jsonToRuleNode(json.condition),
          inverse: json.inverse || false,
        };
        break;

      // Phase 2: Collection Validators
      case 'forEach':
        baseNode.config = {
          type: 'forEach',
          targetCollection: json.targetCollection,
          itemVariable: json.itemVariable || 'item',
          indexVariable: json.indexVariable || 'index',
          itemValidationRules: json.itemValidationRules || [],
        };
        break;

      case 'uniqueBy':
        baseNode.config = {
          type: 'uniqueBy',
          targetCollection: json.targetCollection,
          uniqueByFields: json.uniqueByFields || [],
          caseSensitive: json.caseSensitive !== false,
          ignoreEmpty: json.ignoreEmpty !== false,
          duplicateErrorMessage: json.duplicateErrorMessage,
        };
        break;

      case 'minLength':
        baseNode.config = {
          type: 'minLength',
          targetCollection: json.targetCollection,
          minItems: json.minItems,
          lengthErrorMessage: json.lengthErrorMessage,
          showItemCount: json.showItemCount !== false,
        };
        break;

      case 'maxLength':
        baseNode.config = {
          type: 'maxLength',
          targetCollection: json.targetCollection,
          maxItems: json.maxItems,
          lengthErrorMessage: json.lengthErrorMessage,
          preventExcess: json.preventExcess !== false,
        };
        break;

      // Phase 4: Expression and Contextual Specifications
      case 'expression':
        baseNode.config = {
          type: 'expression',
          expression: json.expression || json.dsl || '',
          functionRegistry: json.functionRegistry,
          contextProvider: json.contextProvider,
          knownFields: json.knownFields || [],
          enablePerformanceWarnings: json.enablePerformanceWarnings ?? true,
          maxComplexity: json.maxComplexity || 50,
        };
        break;

      case 'contextual':
        baseNode.config = {
          type: 'contextual',
          template: json.template,
          contextVariables: json.contextVariables || [],
          contextProvider: json.contextProvider,
          strictContextValidation: json.strictContextValidation ?? false,
        };
        break;
    }

    return baseNode;
  }

  private mapSpecificationTypeToNodeType(specType: string): RuleNodeType {
    switch (specType) {
      case 'field':
        return RuleNodeType.FIELD_CONDITION;
      case 'and':
        return RuleNodeType.AND_GROUP;
      case 'or':
        return RuleNodeType.OR_GROUP;
      case 'not':
        return RuleNodeType.NOT_GROUP;
      case 'xor':
        return RuleNodeType.XOR_GROUP;
      case 'implies':
        return RuleNodeType.IMPLIES_GROUP;
      case 'function':
        return RuleNodeType.FUNCTION_CALL;
      case 'fieldToField':
        return RuleNodeType.FIELD_TO_FIELD;
      case 'atLeast':
        return RuleNodeType.AT_LEAST;
      case 'exactly':
        return RuleNodeType.EXACTLY;
      // Phase 1: Conditional Validators
      case 'requiredIf':
        return RuleNodeType.REQUIRED_IF;
      case 'visibleIf':
        return RuleNodeType.VISIBLE_IF;
      case 'disabledIf':
        return RuleNodeType.DISABLED_IF;
      case 'readonlyIf':
        return RuleNodeType.READONLY_IF;
      // Phase 2: Collection Validators
      case 'forEach':
        return RuleNodeType.FOR_EACH;
      case 'uniqueBy':
        return RuleNodeType.UNIQUE_BY;
      case 'minLength':
        return RuleNodeType.MIN_LENGTH;
      case 'maxLength':
        return RuleNodeType.MAX_LENGTH;
      // Phase 4: Expression and Contextual Specifications
      case 'expression':
        return RuleNodeType.EXPRESSION;
      case 'contextual':
        return RuleNodeType.CONTEXTUAL;
      default:
        return RuleNodeType.FIELD_CONDITION; // fallback
    }
  }

  private mapComparisonOperator(operator: ComparisonOperator): string {
    switch (operator) {
      case ComparisonOperator.EQUALS:
        return 'equals';
      case ComparisonOperator.NOT_EQUALS:
        return 'notEquals';
      case ComparisonOperator.GREATER_THAN:
        return 'greaterThan';
      case ComparisonOperator.GREATER_THAN_OR_EQUAL:
        return 'greaterThanOrEqual';
      case ComparisonOperator.LESS_THAN:
        return 'lessThan';
      case ComparisonOperator.LESS_THAN_OR_EQUAL:
        return 'lessThanOrEqual';
      case ComparisonOperator.CONTAINS:
        return 'contains';
      case ComparisonOperator.STARTS_WITH:
        return 'startsWith';
      case ComparisonOperator.ENDS_WITH:
        return 'endsWith';
      case ComparisonOperator.IN:
        return 'in';
      // Note: NOT_IN, IS_NULL, IS_NOT_NULL are not available in praxis-specification ComparisonOperator enum
      // These would need to be handled as custom functions or additional operators
      default:
        return 'equals';
    }
  }

  private inferValueType(value: any): ValueType {
    if (typeof value === 'string') {
      if (value.startsWith('@')) {
        return 'field';
      }
      if (value.startsWith('$')) {
        return 'context';
      }
    }
    return 'literal';
  }

  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNodeLabel(json: any): string {
    switch (json.type) {
      case 'field':
        return `${json.field} ${this.mapComparisonOperator(json.operator)} ${json.value}`;
      case 'and':
        return 'AND Group';
      case 'or':
        return 'OR Group';
      case 'not':
        return 'NOT';
      case 'xor':
        return 'XOR Group';
      case 'implies':
        return 'IMPLIES';
      case 'function':
        return `${json.name}()`;
      case 'fieldToField':
        return `${json.fieldA} ${this.mapComparisonOperator(json.operator)} ${json.fieldB}`;
      case 'atLeast':
        return `At Least ${json.minimum}`;
      case 'exactly':
        return `Exactly ${json.exact}`;
      // Phase 1: Conditional Validators
      case 'requiredIf':
        return `Required If: ${json.targetField}`;
      case 'visibleIf':
        return `Visible If: ${json.targetField}`;
      case 'disabledIf':
        return `Disabled If: ${json.targetField}`;
      case 'readonlyIf':
        return `Readonly If: ${json.targetField}`;
      // Phase 2: Collection Validators
      case 'forEach':
        return `For Each: ${json.targetCollection}`;
      case 'uniqueBy':
        const uniqueFields = json.uniqueByFields ? json.uniqueByFields.join(', ') : '';
        return `Unique By: ${uniqueFields}`;
      case 'minLength':
        return `Min Length: ${json.minItems} items`;
      case 'maxLength':
        return `Max Length: ${json.maxItems} items`;
      // Phase 4: Expression and Contextual
      case 'expression':
        return `Expression: ${json.expression || 'DSL'}`;
      case 'contextual':
        return `Contextual: ${json.template || 'Template'}`;
      default:
        return 'Rule';
    }
  }

  // ===== Phase 4: Helper Methods =====

  /**
   * Creates a context provider from context variables
   */
  private createContextProviderFromVariables(variables: ContextVariable[]): ContextProvider {
    const variableMap = new Map<string, any>();
    
    for (const variable of variables) {
      let value: any = variable.example;
      
      // Convert example to appropriate type
      if (value !== undefined && value !== null) {
        switch (variable.type) {
          case 'number':
            value = typeof value === 'string' ? parseFloat(value) : value;
            break;
          case 'boolean':
            value = typeof value === 'string' ? value.toLowerCase() === 'true' : Boolean(value);
            break;
          case 'date':
            value = typeof value === 'string' ? new Date(value) : value;
            break;
          case 'object':
          case 'array':
            value = typeof value === 'string' ? JSON.parse(value) : value;
            break;
          case 'string':
          default:
            value = String(value);
            break;
        }
      }
      
      variableMap.set(variable.name, value);
    }

    // Create a context provider implementation aligned with praxis-specification ContextProvider interface
    return {
      hasValue: (path: string) => variableMap.has(path),
      getValue: (path: string) => variableMap.get(path)
    };
  }

  /**
   * Calculates complexity of a DSL expression
   */
  private calculateComplexity(expression: string): number {
    // Simple complexity calculation based on operators and function calls
    const operators = ['&&', '||', '!', '==', '!=', '>', '<', '>=', '<=', 'in'];
    const functions = ['contains', 'startsWith', 'endsWith', 'atLeast', 'exactly'];
    
    let complexity = 1; // Base complexity
    
    // Count operators
    for (const operator of operators) {
      const matches = expression.split(operator).length - 1;
      complexity += matches;
    }
    
    // Count function calls
    for (const func of functions) {
      const regex = new RegExp(`\\b${func}\\s*\\(`, 'g');
      const matches = expression.match(regex);
      if (matches) {
        complexity += matches.length * 2; // Functions are more complex
      }
    }
    
    // Count parentheses nesting
    let depth = 0;
    let maxDepth = 0;
    for (const char of expression) {
      if (char === '(') {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      } else if (char === ')') {
        depth--;
      }
    }
    complexity += maxDepth;
    
    return complexity;
  }

  /**
   * Finds the position of a token in a template
   */
  private findTokenPosition(template: string, token: string): { start: number; end: number; line: number; column: number } {
    const tokenPattern = `\${${token}}`;
    const index = template.indexOf(tokenPattern);
    
    if (index === -1) {
      return { start: 0, end: 0, line: 1, column: 1 };
    }
    
    // Calculate line and column
    let line = 1;
    let column = 1;
    
    for (let i = 0; i < index; i++) {
      if (template[i] === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
    
    return {
      start: index,
      end: index + tokenPattern.length,
      line,
      column
    };
  }

  /**
   * Suggests similar variable names using Levenshtein distance
   */
  private suggestSimilarVariable(target: string, availableVariables: string[]): string | undefined {
    if (availableVariables.length === 0) return undefined;

    const similarities = availableVariables.map(variable => ({
      variable,
      distance: this.levenshteinDistance(target.toLowerCase(), variable.toLowerCase())
    }));

    similarities.sort((a, b) => a.distance - b.distance);
    
    // Only suggest if the distance is reasonable
    if (similarities[0].distance <= Math.max(2, target.length * 0.4)) {
      return `Did you mean "${similarities[0].variable}"?`;
    }

    return undefined;
  }

  /**
   * Calculates Levenshtein distance between two strings
   */
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
}