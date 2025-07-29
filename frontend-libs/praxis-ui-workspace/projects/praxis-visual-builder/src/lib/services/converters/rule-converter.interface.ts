import { Specification } from 'praxis-specification';
import { RuleNode } from '../../models/rule-builder.model';
import { ConversionContext } from './conversion-context.interface';

/**
 * Interface for rule converters that transform RuleNodes to Specifications
 */
export interface RuleConverter {
  /**
   * Convert a RuleNode to a Specification
   * @param node The node to convert
   * @param context Context providing access to child conversion capabilities
   */
  convert<T extends object = any>(node: RuleNode, context?: ConversionContext): Specification<T>;
  
  /**
   * Check if this converter can handle the given node type
   */
  canConvert(nodeType: string): boolean;
  
  /**
   * Get the supported node types
   */
  getSupportedTypes(): string[];
  
  /**
   * Set the conversion context (called by factory during initialization)
   */
  setContext?(context: ConversionContext): void;
}

/**
 * Base abstract class for rule converters
 */
export abstract class BaseRuleConverter implements RuleConverter {
  protected abstract supportedTypes: string[];
  protected context?: ConversionContext;
  
  abstract convert<T extends object = any>(node: RuleNode, context?: ConversionContext): Specification<T>;
  
  /**
   * Set the conversion context
   */
  setContext(context: ConversionContext): void {
    this.context = context;
  }
  
  canConvert(nodeType: string): boolean {
    return this.supportedTypes.includes(nodeType);
  }
  
  getSupportedTypes(): string[] {
    return [...this.supportedTypes];
  }
  
  protected validateNode(node: RuleNode, expectedType?: string): void {
    if (!node) {
      throw new Error('Node cannot be null or undefined');
    }
    
    if (!node.config) {
      throw new Error(`Node ${node.id} is missing configuration`);
    }
    
    if (expectedType && node.config.type !== expectedType) {
      throw new Error(`Expected node type ${expectedType}, but got ${node.config.type}`);
    }
    
    if (!this.canConvert(node.config.type)) {
      throw new Error(`Converter cannot handle node type: ${node.config.type}`);
    }
  }
}