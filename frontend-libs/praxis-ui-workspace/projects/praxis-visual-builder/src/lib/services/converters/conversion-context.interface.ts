import { Specification } from '@praxis/specification';
import { RuleNode } from '../../models/rule-builder.model';

/**
 * Context interface for rule conversion operations
 * Eliminates circular dependencies between converters and factory
 */
export interface ConversionContext {
  /**
   * Convert a child node to a specification
   * This method is provided by the factory to avoid circular dependencies
   */
  convertChild<T extends object = any>(node: RuleNode): Specification<T>;
  
  /**
   * Convert multiple child nodes to specifications
   */
  convertChildren<T extends object = any>(nodes: RuleNode[]): Specification<T>[];
  
  /**
   * Check if a node type is supported
   */
  isSupported(nodeType: string): boolean;
  
  /**
   * Validate that a node can be converted
   */
  validateNode(node: RuleNode): { isValid: boolean; errors: string[] };
}

/**
 * Context provider that implements the conversion context
 * Used by the factory to provide conversion capabilities to converters
 */
export class ConverterContextProvider implements ConversionContext {
  constructor(
    private convertFn: <T extends object = any>(node: RuleNode) => Specification<T>,
    private isSupportedFn: (nodeType: string) => boolean,
    private validateFn: (node: RuleNode) => { isValid: boolean; errors: string[] }
  ) {}
  
  convertChild<T extends object = any>(node: RuleNode): Specification<T> {
    return this.convertFn<T>(node);
  }
  
  convertChildren<T extends object = any>(nodes: RuleNode[]): Specification<T>[] {
    return nodes.map(node => this.convertChild<T>(node));
  }
  
  isSupported(nodeType: string): boolean {
    return this.isSupportedFn(nodeType);
  }
  
  validateNode(node: RuleNode): { isValid: boolean; errors: string[] } {
    return this.validateFn(node);
  }
}