import { Injectable } from '@angular/core';
import { RuleNode, RuleNodeConfig } from '../models/rule-builder.model';
import { RuleNodeRegistryService } from './rule-node-registry.service';

/**
 * Validation issue severity levels
 */
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Validation issue categories
 */
export enum ValidationCategory {
  STRUCTURE = 'structure',
  DEPENDENCY = 'dependency',
  BUSINESS_LOGIC = 'business_logic',
  PERFORMANCE = 'performance',
  SEMANTIC = 'semantic'
}

/**
 * Validation issue details
 */
export interface ValidationIssue {
  /** Unique identifier for this issue */
  id: string;
  /** Issue severity level */
  severity: ValidationSeverity;
  /** Issue category */
  category: ValidationCategory;
  /** Human-readable message */
  message: string;
  /** Affected node ID */
  nodeId: string;
  /** Suggested fix (optional) */
  suggestion?: string;
  /** Additional context data */
  context?: Record<string, any>;
}

/**
 * Validation result for a rule tree
 */
export interface RuleValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Total number of issues found */
  issueCount: number;
  /** Issues found during validation */
  issues: ValidationIssue[];
  /** Performance metrics */
  metrics: {
    validationTime: number;
    nodeCount: number;
    maxDepth: number;
    complexity: number;
  };
}

/**
 * Validation configuration options
 */
export interface ValidationConfig {
  /** Enable strict validation mode */
  strict?: boolean;
  /** Maximum allowed tree depth */
  maxDepth?: number;
  /** Maximum allowed complexity score */
  maxComplexity?: number;
  /** Enable performance warnings */
  enablePerformanceWarnings?: boolean;
  /** Custom validation rules */
  customRules?: ValidationRule[];
}

/**
 * Custom validation rule interface
 */
export interface ValidationRule {
  /** Rule identifier */
  id: string;
  /** Rule description */
  description: string;
  /** Validation function */
  validate: (node: RuleNode, context: ValidationContext) => ValidationIssue[];
}

/**
 * Validation context passed to validators
 */
export interface ValidationContext {
  /** Registry service for node resolution */
  registry: RuleNodeRegistryService;
  /** Current validation config */
  config: ValidationConfig;
  /** Visited nodes (for cycle detection) */
  visitedNodes: Set<string>;
  /** Current depth level */
  currentDepth: number;
  /** All nodes in the tree */
  allNodes: Map<string, RuleNode>;
}

/**
 * Centralized service for validating rule business logic and integrity
 */
@Injectable({
  providedIn: 'root'
})
export class RuleValidationService {
  private defaultConfig: ValidationConfig = {
    strict: false,
    maxDepth: 10,
    maxComplexity: 100,
    enablePerformanceWarnings: true,
    customRules: []
  };

  constructor(private nodeRegistry: RuleNodeRegistryService) {}

  /**
   * Validate a complete rule tree
   */
  validateRuleTree(rootNode: RuleNode, config?: Partial<ValidationConfig>): RuleValidationResult {
    const startTime = performance.now();
    const validationConfig = { ...this.defaultConfig, ...config };
    
    // Collect all nodes in the tree
    const allNodes = this.collectAllNodes(rootNode);
    
    const context: ValidationContext = {
      registry: this.nodeRegistry,
      config: validationConfig,
      visitedNodes: new Set(),
      currentDepth: 0,
      allNodes
    };

    const issues: ValidationIssue[] = [];

    // Run core validations
    issues.push(...this.validateStructure(rootNode, context));
    issues.push(...this.validateDependencies(rootNode, context));
    issues.push(...this.validateBusinessLogic(rootNode, context));
    issues.push(...this.validatePerformance(rootNode, context));

    // Run custom validation rules
    if (validationConfig.customRules) {
      for (const rule of validationConfig.customRules) {
        issues.push(...rule.validate(rootNode, context));
      }
    }

    const endTime = performance.now();
    const metrics = this.calculateMetrics(rootNode, allNodes, endTime - startTime);

    return {
      isValid: !issues.some(issue => issue.severity === ValidationSeverity.ERROR),
      issueCount: issues.length,
      issues,
      metrics
    };
  }

  /**
   * Validate a single node
   */
  validateNode(node: RuleNode, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Basic structure validation
    if (!node.id) {
      issues.push({
        id: `missing-id-${Date.now()}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.STRUCTURE,
        message: 'Node is missing required ID',
        nodeId: node.id || 'unknown'
      });
    }

    if (!node.config) {
      issues.push({
        id: `missing-config-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.STRUCTURE,
        message: 'Node is missing configuration',
        nodeId: node.id
      });
      return issues; // Cannot continue without config
    }

    if (!node.config.type) {
      issues.push({
        id: `missing-type-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.STRUCTURE,
        message: 'Node configuration is missing type',
        nodeId: node.id
      });
    }

    // Type-specific validation
    issues.push(...this.validateNodeByType(node, context));

    return issues;
  }

  private validateStructure(node: RuleNode, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for cycles
    if (context.visitedNodes.has(node.id)) {
      issues.push({
        id: `cycle-detected-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.STRUCTURE,
        message: `Circular dependency detected at node ${node.id}`,
        nodeId: node.id,
        suggestion: 'Remove circular references in the rule tree'
      });
      return issues;
    }

    context.visitedNodes.add(node.id);
    context.currentDepth++;

    // Check max depth
    if (context.currentDepth > context.config.maxDepth!) {
      issues.push({
        id: `max-depth-exceeded-${node.id}`,
        severity: ValidationSeverity.WARNING,
        category: ValidationCategory.PERFORMANCE,
        message: `Maximum tree depth (${context.config.maxDepth}) exceeded`,
        nodeId: node.id,
        suggestion: 'Consider flattening the rule structure'
      });
    }

    // Validate current node
    issues.push(...this.validateNode(node, context));

    // Recursively validate children
    if (node.children) {
      for (const childId of node.children) {
        const childNode = context.registry.getNode(childId);
        if (childNode) {
          issues.push(...this.validateStructure(childNode, { ...context }));
        } else {
          issues.push({
            id: `missing-child-${childId}`,
            severity: ValidationSeverity.ERROR,
            category: ValidationCategory.DEPENDENCY,
            message: `Child node ${childId} not found in registry`,
            nodeId: node.id,
            suggestion: 'Remove reference to missing child or add the missing node'
          });
        }
      }
    }

    context.visitedNodes.delete(node.id);
    context.currentDepth--;

    return issues;
  }

  private validateDependencies(node: RuleNode, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Validate parent-child relationships
    if (node.children) {
      for (const childId of node.children) {
        const childNode = context.registry.getNode(childId);
        if (childNode && childNode.parentId !== node.id) {
          issues.push({
            id: `parent-mismatch-${childId}`,
            severity: ValidationSeverity.WARNING,
            category: ValidationCategory.DEPENDENCY,
            message: `Child node ${childId} does not reference correct parent`,
            nodeId: node.id,
            suggestion: 'Update parent reference in child node'
          });
        }
      }
    }

    // Validate orphaned nodes
    if (node.parentId) {
      const parentNode = context.registry.getNode(node.parentId);
      if (!parentNode) {
        issues.push({
          id: `orphaned-node-${node.id}`,
          severity: ValidationSeverity.WARNING,
          category: ValidationCategory.DEPENDENCY,
          message: `Node references non-existent parent ${node.parentId}`,
          nodeId: node.id,
          suggestion: 'Remove parent reference or add the missing parent node'
        });
      } else if (!parentNode.children?.includes(node.id)) {
        issues.push({
          id: `missing-child-ref-${node.id}`,
          severity: ValidationSeverity.WARNING,
          category: ValidationCategory.DEPENDENCY,
          message: `Parent node ${node.parentId} does not reference this child`,
          nodeId: node.id,
          suggestion: 'Add child reference in parent node'
        });
      }
    }

    return issues;
  }

  private validateBusinessLogic(node: RuleNode, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!node.config) return issues;

    // Type-specific business logic validation
    switch (node.config.type) {
      case 'fieldCondition':
        issues.push(...this.validateFieldCondition(node, context));
        break;
      case 'booleanGroup':
      case 'andGroup':
      case 'orGroup':
      case 'notGroup':
      case 'xorGroup':
      case 'impliesGroup':
        issues.push(...this.validateBooleanGroup(node, context));
        break;
      case 'cardinality':
        issues.push(...this.validateCardinality(node, context));
        break;
    }

    return issues;
  }

  private validatePerformance(node: RuleNode, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!context.config.enablePerformanceWarnings) return issues;

    // Check for excessive children
    if (node.children && node.children.length > 20) {
      issues.push({
        id: `too-many-children-${node.id}`,
        severity: ValidationSeverity.WARNING,
        category: ValidationCategory.PERFORMANCE,
        message: `Node has ${node.children.length} children, which may impact performance`,
        nodeId: node.id,
        suggestion: 'Consider grouping children or simplifying the rule structure'
      });
    }

    return issues;
  }

  private validateNodeByType(node: RuleNode, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!node.config?.type) return issues;

    // Validate based on expected structure for each type
    const requiredChildren = this.getRequiredChildrenCount(node.config.type);
    const actualChildren = node.children?.length || 0;

    if (requiredChildren.min !== undefined && actualChildren < requiredChildren.min) {
      issues.push({
        id: `insufficient-children-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS_LOGIC,
        message: `${node.config.type} requires at least ${requiredChildren.min} children, but has ${actualChildren}`,
        nodeId: node.id,
        suggestion: `Add ${requiredChildren.min - actualChildren} more child nodes`
      });
    }

    if (requiredChildren.max !== undefined && actualChildren > requiredChildren.max) {
      issues.push({
        id: `too-many-children-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS_LOGIC,
        message: `${node.config.type} allows at most ${requiredChildren.max} children, but has ${actualChildren}`,
        nodeId: node.id,
        suggestion: `Remove ${actualChildren - requiredChildren.max} child nodes`
      });
    }

    return issues;
  }

  private validateFieldCondition(node: RuleNode, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const config = node.config as any;

    if (!config.fieldName) {
      issues.push({
        id: `missing-field-name-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS_LOGIC,
        message: 'Field condition is missing fieldName',
        nodeId: node.id,
        suggestion: 'Specify a field name for the condition'
      });
    }

    if (!config.operator) {
      issues.push({
        id: `missing-operator-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS_LOGIC,
        message: 'Field condition is missing operator',
        nodeId: node.id,
        suggestion: 'Specify a comparison operator'
      });
    }

    if (config.value === undefined) {
      issues.push({
        id: `missing-value-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS_LOGIC,
        message: 'Field condition is missing value',
        nodeId: node.id,
        suggestion: 'Specify a value for comparison'
      });
    }

    return issues;
  }

  private validateBooleanGroup(node: RuleNode, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const config = node.config as any;

    if (!config.operator) {
      issues.push({
        id: `missing-boolean-operator-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS_LOGIC,
        message: 'Boolean group is missing operator',
        nodeId: node.id,
        suggestion: 'Specify a boolean operator (and, or, not, etc.)'
      });
    }

    return issues;
  }

  private validateCardinality(node: RuleNode, context: ValidationContext): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const config = node.config as any;

    if (!config.cardinalityType) {
      issues.push({
        id: `missing-cardinality-type-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS_LOGIC,
        message: 'Cardinality rule is missing cardinalityType',
        nodeId: node.id,
        suggestion: 'Specify cardinality type (atLeast, exactly, etc.)'
      });
    }

    if (typeof config.count !== 'number' || config.count < 0) {
      issues.push({
        id: `invalid-cardinality-count-${node.id}`,
        severity: ValidationSeverity.ERROR,
        category: ValidationCategory.BUSINESS_LOGIC,
        message: 'Cardinality rule has invalid count value',
        nodeId: node.id,
        suggestion: 'Specify a non-negative number for count'
      });
    }

    return issues;
  }

  private getRequiredChildrenCount(nodeType: string): { min?: number; max?: number } {
    switch (nodeType) {
      case 'notGroup':
        return { min: 1, max: 1 };
      case 'impliesGroup':
        return { min: 2, max: 2 };
      case 'andGroup':
      case 'orGroup':
      case 'xorGroup':
        return { min: 1 };
      case 'cardinality':
      case 'atLeast':
      case 'exactly':
        return { min: 1 };
      case 'fieldCondition':
        return { min: 0, max: 0 };
      default:
        return {};
    }
  }

  private collectAllNodes(rootNode: RuleNode): Map<string, RuleNode> {
    const nodes = new Map<string, RuleNode>();
    const visited = new Set<string>();

    const traverse = (node: RuleNode) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);
      nodes.set(node.id, node);

      if (node.children) {
        for (const childId of node.children) {
          const childNode = this.nodeRegistry.getNode(childId);
          if (childNode) {
            traverse(childNode);
          }
        }
      }
    };

    traverse(rootNode);
    return nodes;
  }

  private calculateMetrics(rootNode: RuleNode, allNodes: Map<string, RuleNode>, validationTime: number) {
    let maxDepth = 0;
    let complexity = 0;

    const calculateDepth = (node: RuleNode, currentDepth: number): number => {
      maxDepth = Math.max(maxDepth, currentDepth);
      
      // Add to complexity based on node type
      complexity += this.getNodeComplexity(node);

      if (node.children) {
        for (const childId of node.children) {
          const childNode = this.nodeRegistry.getNode(childId);
          if (childNode) {
            calculateDepth(childNode, currentDepth + 1);
          }
        }
      }
      
      return maxDepth;
    };

    calculateDepth(rootNode, 1);

    return {
      validationTime,
      nodeCount: allNodes.size,
      maxDepth,
      complexity
    };
  }

  private getNodeComplexity(node: RuleNode): number {
    switch (node.config?.type) {
      case 'fieldCondition':
        return 1;
      case 'booleanGroup':
        // Check the operator for complexity
        const booleanConfig = node.config as any;
        switch (booleanConfig.operator) {
          case 'and':
          case 'or':
            return 2;
          case 'not':
            return 1;
          case 'xor':
          case 'implies':
            return 3;
          default:
            return 2;
        }
      case 'cardinality':
        return 4;
      default:
        return 1;
    }
  }
}