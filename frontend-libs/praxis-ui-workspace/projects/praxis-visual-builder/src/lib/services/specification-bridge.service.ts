import { Injectable } from '@angular/core';
import { Specification } from 'praxis-specification/lib/specification/specification';
import { SpecificationFactory } from 'praxis-specification/lib/utils/specification-factory';
import { DslExporter, ExportOptions } from 'praxis-specification/lib/dsl/exporter';
import { ComparisonOperator } from 'praxis-specification/lib/specification/comparison-operator';
import { RuleNode, RuleNodeType, ValueType, CardinalityConfig, FunctionParameterConfig } from '../models/rule-builder.model';

@Injectable({
  providedIn: 'root'
})
export class SpecificationBridgeService {
  private dslExporter: DslExporter;

  constructor() {
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
   * Converts a RuleNode tree to a Specification instance
   */
  ruleNodeToSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    try {
      switch (node.type) {
        case 'field':
          return this.createFieldSpecification<T>(node);
        
        case 'boolean-group':
          return this.createBooleanGroupSpecification<T>(node);
        
        case 'function':
          return this.createFunctionSpecification<T>(node);
        
        case 'field-to-field':
          return this.createFieldToFieldSpecification<T>(node);
        
        case 'cardinality':
          return this.createCardinalitySpecification<T>(node);
        
        default:
          throw new Error(`Unsupported rule node type: ${node.type}`);
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
      if (original.metadata.severity !== reconstructed.metadata.severity) {
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

  /**
   * Gets expected DSL keywords for a given node type
   */
  private getExpectedDslKeywords(node: RuleNode): string[] {
    const keywords: string[] = [];

    switch (node.type) {
      case 'field':
        if (node.config?.field) {
          keywords.push(node.config.field as string);
        }
        if (node.config?.operator) {
          keywords.push(node.config.operator as string);
        }
        break;
      
      case 'boolean-group':
        if (node.config?.operator) {
          keywords.push((node.config.operator as string).toUpperCase());
        }
        break;
      
      case 'function':
        if (node.config?.functionName) {
          keywords.push(node.config.functionName as string);
        }
        break;
    }

    return keywords;
  }

  private createFieldSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node.config?.field || !node.config?.operator || node.config?.value === undefined) {
      throw new Error('Field specification requires field, operator, and value');
    }

    const field = node.config.field as keyof T;
    const operator = this.convertToComparisonOperator(node.config.operator);
    const value = this.convertValue(node.config.value, node.config.valueType);

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

    const childSpecs = node.children.map(child => this.ruleNodeToSpecification<T>(child));
    const operator = node.config?.operator || 'and';

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
    if (!node.config?.functionName) {
      throw new Error('Function specification requires functionName');
    }

    const functionName = node.config.functionName;
    const parameters = node.config.parameters || [];
    
    // Convert parameters to function arguments
    const args = parameters.map((param: FunctionParameterConfig) => {
      return this.convertValue(param.value, param.valueType);
    });

    return SpecificationFactory.func<T>(functionName, args);
  }

  private createFieldToFieldSpecification<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node.config?.fieldA || !node.config?.fieldB || !node.config?.operator) {
      throw new Error('Field-to-field specification requires fieldA, fieldB, and operator');
    }

    const fieldA = node.config.fieldA as keyof T;
    const fieldB = node.config.fieldB as keyof T;
    const operator = this.convertToComparisonOperator(node.config.operator);
    const transformA = node.config.transformA;
    const transformB = node.config.transformB;

    return SpecificationFactory.fieldToField<T>(
      fieldA,
      operator,
      fieldB,
      transformA,
      transformB
    );
  }

  private createCardinalitySpecification<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node.children || node.children.length === 0 || !node.config?.cardinality) {
      throw new Error('Cardinality specification requires children and cardinality config');
    }

    const childSpecs = node.children.map(child => this.ruleNodeToSpecification<T>(child));
    const cardinality = node.config.cardinality as CardinalityConfig;

    switch (cardinality.type) {
      case 'atLeast':
        if (cardinality.min === undefined) {
          throw new Error('AtLeast cardinality requires min value');
        }
        return SpecificationFactory.atLeast<T>(cardinality.min, childSpecs);
      
      case 'exactly':
        if (cardinality.exact === undefined) {
          throw new Error('Exactly cardinality requires exact value');
        }
        return SpecificationFactory.exactly<T>(cardinality.exact, childSpecs);
      
      default:
        throw new Error(`Unsupported cardinality type: ${cardinality.type}`);
    }
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
        return ComparisonOperator.NOT_IN;
      
      case 'isnull':
        return ComparisonOperator.IS_NULL;
      
      case 'isnotnull':
        return ComparisonOperator.IS_NOT_NULL;
      
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
      config: {},
      metadata: json.metadata,
      children: []
    };

    switch (json.type) {
      case 'field':
        baseNode.config = {
          field: json.field,
          operator: this.mapComparisonOperator(json.operator),
          value: json.value,
          valueType: this.inferValueType(json.value)
        };
        break;

      case 'and':
      case 'or':
      case 'xor':
        baseNode.config = {
          operator: json.type
        };
        baseNode.children = json.specs.map((spec: any) => this.jsonToRuleNode(spec));
        break;

      case 'not':
        baseNode.config = {
          operator: 'not'
        };
        baseNode.children = [this.jsonToRuleNode(json.spec)];
        break;

      case 'implies':
        baseNode.config = {
          operator: 'implies'
        };
        baseNode.children = [
          this.jsonToRuleNode(json.antecedent),
          this.jsonToRuleNode(json.consequent)
        ];
        break;

      case 'function':
        baseNode.config = {
          functionName: json.name,
          parameters: json.args.map((arg: any, index: number) => ({
            name: `param${index}`,
            value: arg,
            valueType: this.inferValueType(arg),
            required: true
          }))
        };
        break;

      case 'fieldToField':
        baseNode.config = {
          fieldA: json.fieldA,
          fieldB: json.fieldB,
          operator: this.mapComparisonOperator(json.operator),
          transformA: json.transformA,
          transformB: json.transformB
        };
        break;

      case 'atLeast':
        baseNode.config = {
          cardinality: {
            type: 'atLeast',
            min: json.minimum
          }
        };
        baseNode.children = json.specs.map((spec: any) => this.jsonToRuleNode(spec));
        break;

      case 'exactly':
        baseNode.config = {
          cardinality: {
            type: 'exactly',
            exact: json.exact
          }
        };
        baseNode.children = json.specs.map((spec: any) => this.jsonToRuleNode(spec));
        break;
    }

    return baseNode;
  }

  private mapSpecificationTypeToNodeType(specType: string): RuleNodeType {
    switch (specType) {
      case 'field':
        return 'field';
      case 'and':
      case 'or':
      case 'not':
      case 'xor':
      case 'implies':
        return 'boolean-group';
      case 'function':
        return 'function';
      case 'fieldToField':
        return 'field-to-field';
      case 'atLeast':
      case 'exactly':
        return 'cardinality';
      default:
        return 'field'; // fallback
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
      case ComparisonOperator.NOT_IN:
        return 'notIn';
      case ComparisonOperator.IS_NULL:
        return 'isNull';
      case ComparisonOperator.IS_NOT_NULL:
        return 'isNotNull';
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
      default:
        return 'Rule';
    }
  }
}