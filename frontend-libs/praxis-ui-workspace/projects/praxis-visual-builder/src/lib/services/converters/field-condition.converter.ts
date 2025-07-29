import { Injectable } from '@angular/core';
import { Specification, SpecificationFactory, ComparisonOperator } from 'praxis-specification';
import { BaseRuleConverter } from './rule-converter.interface';
import { RuleNode, FieldConditionConfig } from '../../models/rule-builder.model';
import { ConversionContext } from './conversion-context.interface';

/**
 * Converter for field condition rules to field specifications
 */
@Injectable({
  providedIn: 'root'
})
export class FieldConditionConverter extends BaseRuleConverter {
  protected supportedTypes = ['fieldCondition'];
  
  convert<T extends object>(node: RuleNode, context?: ConversionContext): Specification<T> {
    this.validateNode(node, 'fieldCondition');
    
    const config = node.config as FieldConditionConfig;
    
    // Validate required properties
    if (!config.fieldName) {
      throw new Error(`Field condition node ${node.id} is missing fieldName`);
    }
    
    if (!config.operator) {
      throw new Error(`Field condition node ${node.id} is missing operator`);
    }
    
    if (config.value === undefined) {
      throw new Error(`Field condition node ${node.id} is missing value`);
    }
    
    // Convert operator string to ComparisonOperator enum
    const operator = this.mapOperator(config.operator);
    
    // Convert value based on valueType
    const value = this.convertValue(config.value, config.valueType);
    
    // Create field specification
    const fieldKey = config.fieldName as keyof T;
    
    if (config.metadata) {
      return SpecificationFactory.fieldWithMetadata(fieldKey, operator, value, config.metadata);
    } else {
      return SpecificationFactory.field(fieldKey, operator, value);
    }
  }
  
  private mapOperator(operatorString: string): ComparisonOperator {
    const operatorMap: Record<string, ComparisonOperator> = {
      'eq': ComparisonOperator.EQUALS,
      'equals': ComparisonOperator.EQUALS,
      'neq': ComparisonOperator.NOT_EQUALS,
      'not_equals': ComparisonOperator.NOT_EQUALS,
      'lt': ComparisonOperator.LESS_THAN,
      'less_than': ComparisonOperator.LESS_THAN,
      'lte': ComparisonOperator.LESS_THAN_OR_EQUAL,
      'less_than_or_equal': ComparisonOperator.LESS_THAN_OR_EQUAL,
      'gt': ComparisonOperator.GREATER_THAN,
      'greater_than': ComparisonOperator.GREATER_THAN,
      'gte': ComparisonOperator.GREATER_THAN_OR_EQUAL,
      'greater_than_or_equal': ComparisonOperator.GREATER_THAN_OR_EQUAL,
      'contains': ComparisonOperator.CONTAINS,
      'startsWith': ComparisonOperator.STARTS_WITH,
      'starts_with': ComparisonOperator.STARTS_WITH,
      'endsWith': ComparisonOperator.ENDS_WITH,
      'ends_with': ComparisonOperator.ENDS_WITH,
      'in': ComparisonOperator.IN
    };
    
    const operator = operatorMap[operatorString.toLowerCase()];
    if (!operator) {
      throw new Error(`Unsupported operator: ${operatorString}`);
    }
    
    return operator;
  }
  
  private convertValue(value: any, valueType?: string): any {
    if (value === null || value === undefined) {
      return value;
    }
    
    switch (valueType) {
      case 'literal':
        return value;
        
      case 'field':
        // Field references should be handled differently in context
        return value;
        
      case 'context':
        // Context variables should be resolved by context provider
        return value;
        
      case 'function':
        // Function calls should be handled by function registry
        return value;
        
      default:
        // Try to infer type and convert if needed
        return this.inferAndConvertValue(value);
    }
  }
  
  private inferAndConvertValue(value: any): any {
    if (typeof value === 'string') {
      // Try to parse as number
      const numValue = Number(value);
      if (!isNaN(numValue) && isFinite(numValue)) {
        return numValue;
      }
      
      // Try to parse as boolean
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      
      // Try to parse as date
      const dateValue = new Date(value);
      if (!isNaN(dateValue.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}/)) {
        return dateValue;
      }
    }
    
    return value;
  }
}