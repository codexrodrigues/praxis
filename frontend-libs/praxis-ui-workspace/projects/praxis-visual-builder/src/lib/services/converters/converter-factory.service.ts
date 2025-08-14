import { Injectable } from '@angular/core';
import { Specification } from '@praxis/specification';
import { RuleConverter } from './rule-converter.interface';
import { RuleNode } from '../../models/rule-builder.model';
import { FieldConditionConverter } from './field-condition.converter';
import { BooleanGroupConverter } from './boolean-group.converter';
import { CardinalityConverter } from './cardinality.converter';
import { ConversionContext, ConverterContextProvider } from './conversion-context.interface';

/**
 * Factory service for converting RuleNodes to Specifications
 * Uses Strategy pattern to delegate to appropriate converters
 */
@Injectable({
  providedIn: 'root'
})
export class ConverterFactoryService {
  private converters = new Map<string, RuleConverter>();
  private context!: ConversionContext;
  
  constructor(
    private fieldConditionConverter: FieldConditionConverter,
    private booleanGroupConverter: BooleanGroupConverter,
    private cardinalityConverter: CardinalityConverter
  ) {
    this.initializeContext();
    this.initializeConverters();
  }
  
  /**
   * Convert a RuleNode to a Specification
   */
  convert<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node) {
      throw new Error('Node cannot be null or undefined');
    }
    
    if (!node.config || !node.config.type) {
      throw new Error(`Node ${node.id} is missing configuration or type`);
    }
    
    const converter = this.getConverter(node.config.type);
    if (!converter) {
      throw new Error(`No converter found for node type: ${node.config.type}`);
    }
    
    try {
      return converter.convert<T>(node, this.context);
    } catch (error) {
      throw new Error(`Failed to convert node ${node.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get converter for a specific node type
   */
  getConverter(nodeType: string): RuleConverter | undefined {
    for (const [, converter] of this.converters) {
      if (converter.canConvert(nodeType)) {
        return converter;
      }
    }
    return undefined;
  }
  
  /**
   * Register a new converter
   */
  registerConverter(name: string, converter: RuleConverter): void {
    this.converters.set(name, converter);
  }
  
  /**
   * Unregister a converter
   */
  unregisterConverter(name: string): boolean {
    return this.converters.delete(name);
  }
  
  /**
   * Get all supported node types
   */
  getSupportedTypes(): string[] {
    const types = new Set<string>();
    for (const converter of this.converters.values()) {
      converter.getSupportedTypes().forEach(type => types.add(type));
    }
    return Array.from(types);
  }
  
  /**
   * Check if a node type is supported
   */
  isSupported(nodeType: string): boolean {
    return this.getSupportedTypes().includes(nodeType);
  }
  
  private initializeContext(): void {
    // Create conversion context that provides access to this factory's convert method
    this.context = new ConverterContextProvider(
      <T extends object = any>(node: RuleNode) => this.convertInternal<T>(node),
      (nodeType: string) => this.isSupported(nodeType),
      (node: RuleNode) => this.validateNode(node)
    );
  }
  
  /**
   * Internal convert method that bypasses context to avoid recursion
   */
  private convertInternal<T extends object = any>(node: RuleNode): Specification<T> {
    if (!node) {
      throw new Error('Node cannot be null or undefined');
    }
    
    if (!node.config || !node.config.type) {
      throw new Error(`Node ${node.id} is missing configuration or type`);
    }
    
    const converter = this.getConverter(node.config.type);
    if (!converter) {
      throw new Error(`No converter found for node type: ${node.config.type}`);
    }
    
    try {
      // Call converter without context to avoid recursion
      return converter.convert<T>(node);
    } catch (error) {
      throw new Error(`Failed to convert node ${node.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private initializeConverters(): void {
    // Register core converters
    this.registerConverter('fieldCondition', this.fieldConditionConverter);
    this.registerConverter('booleanGroup', this.booleanGroupConverter);
    this.registerConverter('cardinality', this.cardinalityConverter);
    
    // Set context in converters that need it
    this.booleanGroupConverter.setContext(this.context);
    this.cardinalityConverter.setContext(this.context);
    this.fieldConditionConverter.setContext(this.context);
  }
  
  /**
   * Convert multiple nodes to specifications
   */
  convertMultiple<T extends object = any>(nodes: RuleNode[]): Specification<T>[] {
    return nodes.map(node => this.convert<T>(node));
  }
  
  /**
   * Validate that a node can be converted
   */
  validateNode(node: RuleNode): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!node) {
      errors.push('Node cannot be null or undefined');
      return { isValid: false, errors };
    }
    
    if (!node.config) {
      errors.push(`Node ${node.id} is missing configuration`);
    } else if (!node.config.type) {
      errors.push(`Node ${node.id} is missing type in configuration`);
    } else if (!this.isSupported(node.config.type)) {
      errors.push(`Node type ${node.config.type} is not supported`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Get statistics about converter usage
   */
  getStatistics(): ConverterStatistics {
    const supportedTypes = this.getSupportedTypes();
    const converterCount = this.converters.size;
    
    return {
      converterCount,
      supportedTypeCount: supportedTypes.length,
      supportedTypes,
      converterNames: Array.from(this.converters.keys())
    };
  }
}

/**
 * Statistics about the converter factory
 */
export interface ConverterStatistics {
  converterCount: number;
  supportedTypeCount: number;
  supportedTypes: string[];
  converterNames: string[];
}