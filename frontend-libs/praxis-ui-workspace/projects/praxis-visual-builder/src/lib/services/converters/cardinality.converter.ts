import { Injectable } from '@angular/core';
import { Specification, SpecificationFactory } from '@praxis/specification';
import { BaseRuleConverter } from './rule-converter.interface';
import { RuleNode, CardinalityConfig } from '../../models/rule-builder.model';
import { RuleNodeRegistryService } from '../rule-node-registry.service';
import { ConversionContext } from './conversion-context.interface';

/**
 * Converter for cardinality rules (atLeast, exactly)
 */
@Injectable({
  providedIn: 'root'
})
export class CardinalityConverter extends BaseRuleConverter {
  protected supportedTypes = ['cardinality', 'atLeast', 'exactly'];
  
  constructor(
    private nodeRegistry: RuleNodeRegistryService
  ) {
    super();
  }
  
  convert<T extends object>(node: RuleNode, context?: ConversionContext): Specification<T> {
    this.validateNode(node);
    
    const config = node.config as CardinalityConfig;
    
    if (!config.cardinalityType) {
      throw new Error(`Cardinality node ${node.id} is missing cardinalityType`);
    }
    
    if (typeof config.count !== 'number' || config.count < 0) {
      throw new Error(`Cardinality node ${node.id} has invalid count: ${config.count}`);
    }
    
    // Resolve child nodes
    const childNodes = this.nodeRegistry.resolveChildren(node);
    
    if (childNodes.length === 0) {
      throw new Error(`Cardinality node ${node.id} requires at least one child`);
    }
    
    if (config.count > childNodes.length) {
      throw new Error(`Cardinality count (${config.count}) cannot be greater than number of children (${childNodes.length})`);
    }
    
    // Convert children to specifications using context
    const conversionContext = context || this.context;
    if (!conversionContext) {
      throw new Error('Conversion context is required for cardinality conversion');
    }
    
    const childSpecs = conversionContext.convertChildren<T>(childNodes);
    
    // Apply cardinality operator
    switch (config.cardinalityType) {
      case 'atLeast':
        return SpecificationFactory.atLeast(config.count, childSpecs);
        
      case 'exactly':
        return SpecificationFactory.exactly(config.count, childSpecs);
        
      default:
        throw new Error(`Unsupported cardinality type: ${config.cardinalityType}`);
    }
  }
  
}