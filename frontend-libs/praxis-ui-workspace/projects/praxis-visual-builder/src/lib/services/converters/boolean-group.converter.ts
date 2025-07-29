import { Injectable } from '@angular/core';
import { Specification, SpecificationFactory } from 'praxis-specification';
import { BaseRuleConverter } from './rule-converter.interface';
import { RuleNode, BooleanGroupConfig } from '../../models/rule-builder.model';
import { RuleNodeRegistryService } from '../rule-node-registry.service';
import { ConversionContext } from './conversion-context.interface';

/**
 * Converter for boolean group rules (AND, OR, NOT, XOR, IMPLIES)
 */
@Injectable({
  providedIn: 'root'
})
export class BooleanGroupConverter extends BaseRuleConverter {
  protected supportedTypes = ['booleanGroup', 'andGroup', 'orGroup', 'notGroup', 'xorGroup', 'impliesGroup'];
  
  constructor(
    private nodeRegistry: RuleNodeRegistryService
  ) {
    super();
  }
  
  convert<T extends object>(node: RuleNode, context?: ConversionContext): Specification<T> {
    this.validateNode(node);
    
    const config = node.config as BooleanGroupConfig;
    
    if (!config.operator) {
      throw new Error(`Boolean group node ${node.id} is missing operator`);
    }
    
    // Resolve child nodes
    const childNodes = this.nodeRegistry.resolveChildren(node);
    
    if (config.operator !== 'not' && childNodes.length === 0) {
      throw new Error(`Boolean group node ${node.id} requires at least one child`);
    }
    
    if (config.operator === 'not' && childNodes.length !== 1) {
      throw new Error(`NOT operation requires exactly one child, but got ${childNodes.length}`);
    }
    
    // Convert children to specifications using context
    const conversionContext = context || this.context;
    if (!conversionContext) {
      throw new Error('Conversion context is required for boolean group conversion');
    }
    
    const childSpecs = conversionContext.convertChildren<T>(childNodes);
    
    // Apply boolean operator
    switch (config.operator.toLowerCase()) {
      case 'and':
        return SpecificationFactory.and(...childSpecs);
        
      case 'or':
        return SpecificationFactory.or(...childSpecs);
        
      case 'not':
        return SpecificationFactory.not(childSpecs[0]);
        
      case 'xor':
        return SpecificationFactory.xor(...childSpecs);
        
      case 'implies':
        if (childSpecs.length !== 2) {
          throw new Error(`IMPLIES operation requires exactly 2 children, but got ${childSpecs.length}`);
        }
        return SpecificationFactory.implies(childSpecs[0], childSpecs[1]);
        
      default:
        throw new Error(`Unsupported boolean operator: ${config.operator}`);
    }
  }
  
}