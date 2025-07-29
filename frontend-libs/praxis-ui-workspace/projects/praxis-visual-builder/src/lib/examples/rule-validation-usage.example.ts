/**
 * Example demonstrating comprehensive rule validation usage
 */

import { Injectable } from '@angular/core';
import { 
  RuleValidationService, 
  ValidationSeverity, 
  ValidationCategory,
  ValidationConfig,
  ValidationRule,
  RuleValidationResult
} from '../services/rule-validation.service';
import { RuleNodeRegistryService } from '../services/rule-node-registry.service';
import { RuleNode } from '../models/rule-builder.model';

@Injectable({
  providedIn: 'root'
})
export class RuleValidationUsageExample {

  constructor(
    private validationService: RuleValidationService,
    private nodeRegistry: RuleNodeRegistryService
  ) {}

  /**
   * Example 1: Basic validation with default settings
   */
  basicValidationExample(): void {
    // Create a sample rule tree
    const rootNode = this.createSampleRuleTree();
    
    // Validate with default settings
    const result = this.validationService.validateRuleTree(rootNode);
    
    console.log('Validation Result:', {
      isValid: result.isValid,
      issueCount: result.issueCount,
      metrics: result.metrics
    });

    // Display issues by severity
    const errors = result.issues.filter(issue => issue.severity === ValidationSeverity.ERROR);
    const warnings = result.issues.filter(issue => issue.severity === ValidationSeverity.WARNING);
    
    console.log(`Found ${errors.length} errors and ${warnings.length} warnings`);
    
    errors.forEach(error => {
      console.error(`ERROR [${error.nodeId}]: ${error.message}`);
      if (error.suggestion) {
        console.log(`  Suggestion: ${error.suggestion}`);
      }
    });
  }

  /**
   * Example 2: Strict validation with custom configuration
   */
  strictValidationExample(): void {
    const rootNode = this.createSampleRuleTree();
    
    const strictConfig: ValidationConfig = {
      strict: true,
      maxDepth: 5,
      maxComplexity: 50,
      enablePerformanceWarnings: true
    };
    
    const result = this.validationService.validateRuleTree(rootNode, strictConfig);
    
    // Group issues by category
    const issuesByCategory = result.issues.reduce((acc, issue) => {
      if (!acc[issue.category]) {
        acc[issue.category] = [];
      }
      acc[issue.category].push(issue);
      return acc;
    }, {} as Record<ValidationCategory, typeof result.issues>);

    console.log('Issues by Category:', issuesByCategory);
  }

  /**
   * Example 3: Custom validation rules
   */
  customValidationExample(): void {
    const rootNode = this.createSampleRuleTree();
    
    // Define custom validation rules
    const customRules: ValidationRule[] = [
      {
        id: 'business-rule-1',
        description: 'Ensure field conditions use valid field names',
        validate: (node, context) => {
          const issues = [];
          
          if (node.config?.type === 'fieldCondition') {
            const config = node.config as any;
            const validFields = ['name', 'age', 'email', 'status'];
            
            if (config.fieldName && !validFields.includes(config.fieldName)) {
              issues.push({
                id: `invalid-field-${node.id}`,
                severity: ValidationSeverity.WARNING,
                category: ValidationCategory.BUSINESS_LOGIC,
                message: `Field '${config.fieldName}' is not in approved field list`,
                nodeId: node.id,
                suggestion: `Use one of: ${validFields.join(', ')}`
              });
            }
          }
          
          return issues;
        }
      },
      {
        id: 'performance-rule-1',
        description: 'Warn about excessive OR conditions',
        validate: (node, context) => {
          const issues = [];
          
          if (node.config?.type === 'orGroup' && node.children && node.children.length > 10) {
            issues.push({
              id: `excessive-or-${node.id}`,
              severity: ValidationSeverity.WARNING,
              category: ValidationCategory.PERFORMANCE,
              message: `OR group with ${node.children.length} conditions may impact performance`,
              nodeId: node.id,
              suggestion: 'Consider using indexed fields or simplifying conditions'
            });
          }
          
          return issues;
        }
      }
    ];
    
    const config: ValidationConfig = {
      customRules,
      enablePerformanceWarnings: true
    };
    
    const result = this.validationService.validateRuleTree(rootNode, config);
    
    // Show custom rule violations
    const customIssues = result.issues.filter(issue => 
      customRules.some(rule => issue.id.includes(rule.id.split('-')[0]))
    );
    
    console.log('Custom Rule Violations:', customIssues);
  }

  /**
   * Example 4: Real-time validation during editing
   */
  realTimeValidationExample(): void {
    const rootNode = this.createSampleRuleTree();
    
    // Simulate editing a node
    const editedNode = { ...rootNode };
    editedNode.config = { 
      ...editedNode.config, 
      type: 'fieldCondition',
      fieldName: '', // Invalid - empty field name
      operator: 'eq',
      value: 'test'
    };
    
    // Validate just the edited node for quick feedback
    const quickResult = this.validationService.validateRuleTree(editedNode);
    
    // Show immediate feedback
    const criticalIssues = quickResult.issues.filter(
      issue => issue.severity === ValidationSeverity.ERROR
    );
    
    if (criticalIssues.length > 0) {
      console.log('Blocking Issues (must fix before saving):');
      criticalIssues.forEach(issue => {
        console.log(`❌ ${issue.message}`);
      });
    } else {
      console.log('✅ No blocking issues - can save');
    }
  }

  /**
   * Example 5: Validation metrics analysis
   */
  metricsAnalysisExample(): void {
    const rootNode = this.createComplexRuleTree();
    
    const result = this.validationService.validateRuleTree(rootNode, {
      enablePerformanceWarnings: true,
      maxComplexity: 100
    });
    
    console.log('Rule Tree Metrics:', {
      nodeCount: result.metrics.nodeCount,
      maxDepth: result.metrics.maxDepth,
      complexity: result.metrics.complexity,
      validationTime: `${result.metrics.validationTime.toFixed(2)}ms`
    });
    
    // Analyze complexity
    if (result.metrics.complexity > 80) {
      console.warn('⚠️ High complexity rule tree - consider simplification');
    }
    
    if (result.metrics.maxDepth > 8) {
      console.warn('⚠️ Deep nesting detected - may impact readability');
    }
    
    if (result.metrics.validationTime > 100) {
      console.warn('⚠️ Slow validation detected - large rule tree');
    }
  }

  /**
   * Helper: Create a sample rule tree for testing
   */
  private createSampleRuleTree(): RuleNode {
    // Create nodes and register them
    const fieldCondition: RuleNode = {
      id: 'field-1',
      type: 'fieldCondition',
      config: {
        type: 'fieldCondition',
        fieldName: 'age',
        operator: 'gte',
        value: 18
      }
    };

    const andGroup: RuleNode = {
      id: 'and-1',
      type: 'andGroup',
      children: ['field-1'],
      config: {
        type: 'andGroup',
        operator: 'and'
      }
    };

    // Register nodes
    this.nodeRegistry.registerNode(fieldCondition);
    this.nodeRegistry.registerNode(andGroup);

    return andGroup;
  }

  /**
   * Helper: Create a complex rule tree for performance testing
   */
  private createComplexRuleTree(): RuleNode {
    const nodes: RuleNode[] = [];
    
    // Create multiple field conditions
    for (let i = 0; i < 20; i++) {
      const node: RuleNode = {
        id: `field-${i}`,
        type: 'fieldCondition',
        config: {
          type: 'fieldCondition',
          fieldName: `field${i}`,
          operator: 'eq',
          value: `value${i}`
        }
      };
      nodes.push(node);
      this.nodeRegistry.registerNode(node);
    }
    
    // Create nested groups
    const orGroup: RuleNode = {
      id: 'or-group',
      type: 'orGroup',
      children: nodes.slice(0, 10).map(n => n.id),
      config: {
        type: 'orGroup',
        operator: 'or'
      }
    };
    
    const andGroup: RuleNode = {
      id: 'and-group',
      type: 'andGroup',
      children: ['or-group', ...nodes.slice(10).map(n => n.id)],
      config: {
        type: 'andGroup',
        operator: 'and'
      }
    };
    
    this.nodeRegistry.registerNode(orGroup);
    this.nodeRegistry.registerNode(andGroup);
    
    return andGroup;
  }
}

/**
 * Usage in a component:
 * 
 * @Component({...})
 * export class RuleEditorComponent {
 *   constructor(private validationExample: RuleValidationUsageExample) {}
 * 
 *   onValidateRules() {
 *     this.validationExample.basicValidationExample();
 *     this.validationExample.strictValidationExample();
 *     this.validationExample.customValidationExample();
 *   }
 * 
 *   onNodeEdit() {
 *     this.validationExample.realTimeValidationExample();
 *   }
 * 
 *   onAnalyzePerformance() {
 *     this.validationExample.metricsAnalysisExample();
 *   }
 * }
 */