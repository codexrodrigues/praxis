import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import {
  RuleBuilderState,
  RuleNode,
  RuleNodeType,
  ValidationError,
  RuleBuilderSnapshot,
  ExportOptions,
  ImportOptions,
  RuleBuilderConfig,
} from '../models/rule-builder.model';

import {
  SpecificationFactory,
  Specification,
  DslExporter,
  DslValidator,
  DslParser,
  ValidationIssue,
} from '@praxis/specification';
import { SpecificationBridgeService } from './specification-bridge.service';
import { RoundTripValidatorService } from './round-trip-validator.service';

@Injectable({
  providedIn: 'root',
})
export class RuleBuilderService {
  private readonly _state = new BehaviorSubject<RuleBuilderState>(
    this.getInitialState(),
  );
  private readonly _validationErrors = new BehaviorSubject<ValidationError[]>(
    [],
  );
  private readonly _nodeSelected = new Subject<string>();
  private readonly _stateChanged = new Subject<void>();

  private config: RuleBuilderConfig | null = null;
  private dslExporter = new DslExporter();
  private dslValidator = new DslValidator();
  private dslParser = new DslParser();

  public readonly state$ = this._state.asObservable();
  public readonly validationErrors$ = this._validationErrors.asObservable();
  public readonly nodeSelected$ = this._nodeSelected.asObservable();
  public readonly stateChanged$ = this._stateChanged.asObservable();

  constructor(
    private specificationBridge: SpecificationBridgeService,
    private roundTripValidator: RoundTripValidatorService,
  ) {
    // Auto-save functionality
    this.state$.subscribe((state) => {
      if (state.isDirty && this.config?.ui?.autoSaveInterval) {
        // Implement auto-save logic here
      }
    });
  }

  /**
   * Initialize the rule builder with configuration
   */
  initialize(config: RuleBuilderConfig): void {
    this.config = config;
    this.dslValidator = new DslValidator({
      knownFields: Object.keys(config.fieldSchemas || {}),
      knownFunctions:
        config.customFunctions?.map((f) => (f as any)?.name).filter(Boolean) ||
        [],
      enablePerformanceWarnings: true,
    });

    // Reset state
    this.updateState({
      ...this.getInitialState(),
      isDirty: false,
    });
  }

  /**
   * Get current state
   */
  getCurrentState(): RuleBuilderState {
    return this._state.value;
  }

  /**
   * Add a new rule node
   */
  addNode(node: Partial<RuleNode>, parentId?: string): string {
    const nodeId = node.id || uuidv4();
    const currentState = this.getCurrentState();

    const newNode: RuleNode = {
      id: nodeId,
      type: node.type || RuleNodeType.FIELD_CONDITION,
      label:
        node.label ||
        this.generateNodeLabel(
          (node.type as RuleNodeType) || RuleNodeType.FIELD_CONDITION,
        ),
      metadata: node.metadata,
      selected: false,
      expanded: true,
      parentId,
      children: [],
      config: node.config,
    };

    const updatedNodes = {
      ...currentState.nodes,
      [nodeId]: newNode,
    };

    let updatedRootNodes = [...currentState.rootNodes];

    if (parentId) {
      // Add to parent's children
      const parent = updatedNodes[parentId];
      if (parent) {
        updatedNodes[parentId] = {
          ...parent,
          children: [...(parent.children || []), nodeId],
        };
      }
    } else {
      // Add as root node
      updatedRootNodes.push(nodeId);
    }

    this.updateState({
      ...currentState,
      nodes: updatedNodes,
      rootNodes: updatedRootNodes,
      isDirty: true,
    });

    this.saveSnapshot(`Added ${newNode.label || newNode.type} node`);
    this.validateRules();

    return nodeId;
  }

  /**
   * Update an existing rule node
   */
  updateNode(nodeId: string, updates: Partial<RuleNode>): void {
    const currentState = this.getCurrentState();
    const existingNode = currentState.nodes[nodeId];

    if (!existingNode) {
      return;
    }

    const updatedNode = {
      ...existingNode,
      ...updates,
      id: nodeId, // Ensure ID doesn't change
    };

    this.updateState({
      ...currentState,
      nodes: {
        ...currentState.nodes,
        [nodeId]: updatedNode,
      },
      isDirty: true,
    });

    this.saveSnapshot(`Updated ${updatedNode.label || updatedNode.type} node`);
    this.validateRules();
  }

  /**
   * Remove a rule node
   */
  removeNode(nodeId: string): void {
    const currentState = this.getCurrentState();
    const node = currentState.nodes[nodeId];

    if (!node) {
      return;
    }

    const updatedNodes = { ...currentState.nodes };
    const updatedRootNodes = [...currentState.rootNodes];

    // Remove from parent's children or root nodes
    if (node.parentId) {
      const parent = updatedNodes[node.parentId];
      if (parent) {
        updatedNodes[node.parentId] = {
          ...parent,
          children: (parent.children || []).filter((id) => id !== nodeId),
        };
      }
    } else {
      const rootIndex = updatedRootNodes.indexOf(nodeId);
      if (rootIndex >= 0) {
        updatedRootNodes.splice(rootIndex, 1);
      }
    }

    // Recursively remove children
    const removeNodeRecursive = (id: string) => {
      const nodeToRemove = updatedNodes[id];
      if (nodeToRemove?.children) {
        nodeToRemove.children.forEach(removeNodeRecursive);
      }
      delete updatedNodes[id];
    };

    removeNodeRecursive(nodeId);

    this.updateState({
      ...currentState,
      nodes: updatedNodes,
      rootNodes: updatedRootNodes,
      selectedNodeId:
        currentState.selectedNodeId === nodeId
          ? undefined
          : currentState.selectedNodeId,
      isDirty: true,
    });

    this.saveSnapshot(`Removed ${node.label || node.type} node`);
    this.validateRules();
  }

  /**
   * Select a rule node
   */
  selectNode(nodeId?: string): void {
    const currentState = this.getCurrentState();

    // Update selection
    const updatedNodes = Object.keys(currentState.nodes).reduce(
      (acc, id) => {
        acc[id] = {
          ...currentState.nodes[id],
          selected: id === nodeId,
        };
        return acc;
      },
      {} as Record<string, RuleNode>,
    );

    this.updateState({
      ...currentState,
      nodes: updatedNodes,
      selectedNodeId: nodeId,
    });

    if (nodeId) {
      this._nodeSelected.next(nodeId);
    }
  }

  /**
   * Move a node to a new parent
   */
  moveNode(nodeId: string, newParentId?: string, index?: number): void {
    const currentState = this.getCurrentState();
    const node = currentState.nodes[nodeId];

    if (!node || node.parentId === newParentId) {
      return;
    }

    const updatedNodes = { ...currentState.nodes };
    let updatedRootNodes = [...currentState.rootNodes];

    // Remove from current parent
    if (node.parentId) {
      const currentParent = updatedNodes[node.parentId];
      if (currentParent) {
        updatedNodes[node.parentId] = {
          ...currentParent,
          children: (currentParent.children || []).filter(
            (id) => id !== nodeId,
          ),
        };
      }
    } else {
      updatedRootNodes = updatedRootNodes.filter((id) => id !== nodeId);
    }

    // Add to new parent
    updatedNodes[nodeId] = {
      ...node,
      parentId: newParentId,
    };

    if (newParentId) {
      const newParent = updatedNodes[newParentId];
      if (newParent) {
        const children = [...(newParent.children || [])];
        if (typeof index === 'number') {
          children.splice(index, 0, nodeId);
        } else {
          children.push(nodeId);
        }

        updatedNodes[newParentId] = {
          ...newParent,
          children,
        };
      }
    } else {
      if (typeof index === 'number') {
        updatedRootNodes.splice(index, 0, nodeId);
      } else {
        updatedRootNodes.push(nodeId);
      }
    }

    this.updateState({
      ...currentState,
      nodes: updatedNodes,
      rootNodes: updatedRootNodes,
      isDirty: true,
    });

    this.saveSnapshot(`Moved ${node.label || node.type} node`);
  }

  /**
   * Convert current rules to Specification
   */
  toSpecification(): Specification<any> | null {
    const currentState = this.getCurrentState();

    if (currentState.rootNodes.length === 0) {
      return null;
    }

    // If single root node, convert directly
    if (currentState.rootNodes.length === 1) {
      const rootNode = this.buildRuleNodeTree(currentState.rootNodes[0]);
      return rootNode
        ? this.specificationBridge.ruleNodeToSpecification(rootNode)
        : null;
    }

    // Multiple root nodes - combine with AND
    const specifications = currentState.rootNodes
      .map((nodeId) => {
        const rootNode = this.buildRuleNodeTree(nodeId);
        return rootNode
          ? this.specificationBridge.ruleNodeToSpecification(rootNode)
          : null;
      })
      .filter((spec) => spec !== null) as Specification<any>[];

    if (specifications.length === 0) {
      return null;
    }

    if (specifications.length === 1) {
      return specifications[0];
    }

    return SpecificationFactory.and(...specifications);
  }

  /**
   * Export current rules
   */
  export(options: ExportOptions): string {
    const currentState = this.getCurrentState();

    if (currentState.rootNodes.length === 0) {
      return '';
    }

    switch (options.format) {
      case 'json':
        const specification = this.toSpecification();
        if (!specification) return '';
        const json = specification.toJSON();
        return options.prettyPrint
          ? JSON.stringify(json, null, 2)
          : JSON.stringify(json);

      case 'dsl':
        if (currentState.rootNodes.length === 1) {
          const rootNode = this.buildRuleNodeTree(currentState.rootNodes[0]);
          if (!rootNode) return '';
          return this.specificationBridge.exportToDsl(rootNode, {
            includeMetadata: options.includeMetadata,
            metadataPosition: options.metadataPosition || 'before',
            prettyPrint: options.prettyPrint || false,
          });
        } else {
          // Multiple root nodes - export each and combine
          const dslParts = currentState.rootNodes
            .map((nodeId) => {
              const rootNode = this.buildRuleNodeTree(nodeId);
              return rootNode
                ? this.specificationBridge.exportToDsl(rootNode)
                : '';
            })
            .filter((dsl) => dsl.length > 0);

          return dslParts.length > 1
            ? dslParts.join(' AND ')
            : dslParts[0] || '';
        }

      case 'typescript':
        const spec = this.toSpecification();
        return spec ? this.exportToTypeScript(spec, options) : '';

      case 'form-config':
        const formSpec = this.toSpecification();
        return formSpec ? this.exportToFormConfig(formSpec, options) : '';

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Import rules from external source.
   *
   * Empty strings or structures with no data are ignored to preserve the
   * current state. When parsing JSON, the specification type must be
   * present otherwise an error is thrown, ensuring business rules are
   * explicit and valid.
   *
   * @throws Error when the specification type is missing or the format is
   * unsupported.
   */
  import(content: string, options: ImportOptions): void {
    try {
      let specification: Specification<any>;

      switch (options.format) {
        case 'json':
          if (!content || content.trim().length === 0) {
            return;
          }
          const json = JSON.parse(content);
          if (
            json == null ||
            (Array.isArray(json) && json.length === 0) ||
            (typeof json === 'object' &&
              !Array.isArray(json) &&
              Object.keys(json).length === 0)
          ) {
            return;
          }
          if (typeof json === 'object' && (json as any).type == null) {
            throw new Error('Missing specification type');
          }
          specification = SpecificationFactory.fromJSON(json);
          break;

        case 'dsl':
          if (!content || content.trim().length === 0) {
            return;
          }
          specification = this.dslParser.parse(content);
          break;

        default:
          throw new Error(`Unsupported import format: ${options.format}`);
      }

      if (specification) {
        const ruleNode =
          this.specificationBridge.specificationToRuleNode(specification);
        const ruleNodes = this.flattenRuleNodeTree(ruleNode);

        if (options.merge) {
          // Merge with existing rules
          const currentState = this.getCurrentState();
          const mergedNodes = { ...currentState.nodes, ...ruleNodes.nodes };
          const mergedRootNodes = [
            ...currentState.rootNodes,
            ...ruleNodes.rootNodes,
          ];

          this.updateState({
            ...currentState,
            nodes: mergedNodes,
            rootNodes: mergedRootNodes,
            isDirty: true,
          });
        } else {
          // Replace all rules
          this.updateState({
            ...this.getInitialState(),
            nodes: ruleNodes.nodes,
            rootNodes: ruleNodes.rootNodes,
            isDirty: true,
          });
        }

        this.saveSnapshot('Imported rules');
        this.validateRules();
      }
    } catch (error) {
      console.error('Failed to import rules:', error);
      throw error;
    }
  }

  /**
   * Undo last action
   */
  undo(): void {
    const currentState = this.getCurrentState();

    if (currentState.historyPosition > 0) {
      const snapshot = currentState.history[currentState.historyPosition - 1];

      this.updateState({
        ...currentState,
        ...snapshot.state,
        historyPosition: currentState.historyPosition - 1,
        isDirty: true,
      });
    }
  }

  /**
   * Redo last undone action
   */
  redo(): void {
    const currentState = this.getCurrentState();

    if (currentState.historyPosition < currentState.history.length - 1) {
      const snapshot = currentState.history[currentState.historyPosition + 1];

      this.updateState({
        ...currentState,
        ...snapshot.state,
        historyPosition: currentState.historyPosition + 1,
        isDirty: true,
      });
    }
  }

  /**
   * Clear all rules
   */
  clear(): void {
    this.updateState({
      ...this.getInitialState(),
      isDirty: false,
    });

    this.saveSnapshot('Cleared all rules');
  }

  /**
   * Validate current rules
   */
  validateRules(): void {
    const currentState = this.getCurrentState();
    const errors: ValidationError[] = [];

    // Validate each node
    Object.values(currentState.nodes).forEach((node) => {
      const nodeErrors = this.validateNode(node);
      errors.push(...nodeErrors);
    });

    // Validate overall structure
    const structureErrors = this.validateStructure(currentState);
    errors.push(...structureErrors);

    // Update DSL and validate
    try {
      const specification = this.toSpecification();
      if (specification) {
        const dsl = specification.toDSL();
        const dslErrors = this.dslValidator.validate(dsl);

        errors.push(
          ...dslErrors.map((issue: ValidationIssue) => ({
            id: uuidv4(),
            message: issue.message,
            severity: issue.severity as 'error' | 'warning' | 'info',
            code: issue.type,
          })),
        );

        this.updateState({
          ...currentState,
          currentDSL: dsl,
          currentJSON: specification.toJSON(),
        });
      }
    } catch (error) {
      errors.push({
        id: uuidv4(),
        message: `Failed to generate specification: ${error}`,
        severity: 'error',
        code: 'SPECIFICATION_GENERATION_ERROR',
      });
    }

    // Perform round-trip validation for root nodes (if enabled)
    if (this.config?.validation?.realTime) {
      const roundTripErrors = this.validateRoundTrip(currentState);
      errors.push(...roundTripErrors);
    }

    this._validationErrors.next(errors);
  }

  /**
   * Validates round-trip conversion for all root nodes
   */
  private validateRoundTrip(state: RuleBuilderState): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const rootNodeId of state.rootNodes) {
      try {
        const rootNode = this.buildRuleNodeTree(rootNodeId);
        if (rootNode) {
          const result = this.roundTripValidator.validateRoundTrip(rootNode);

          if (!result.success) {
            // Add round-trip specific errors
            errors.push(
              ...result.errors.map((error) => ({
                ...error,
                nodeId: rootNodeId,
                code: `ROUND_TRIP_${error.code}`,
              })),
            );
          }

          // Add round-trip warnings as info-level validation errors
          errors.push(
            ...result.warnings.map((warning) => ({
              ...warning,
              severity: 'info' as const,
              nodeId: rootNodeId,
              code: `ROUND_TRIP_${warning.code}`,
            })),
          );
        }
      } catch (error) {
        errors.push({
          id: uuidv4(),
          message: `Round-trip validation failed for node ${rootNodeId}: ${error}`,
          severity: 'warning',
          code: 'ROUND_TRIP_VALIDATION_ERROR',
          nodeId: rootNodeId,
        });
      }
    }

    return errors;
  }

  /**
   * Runs comprehensive round-trip validation for current state
   */
  runRoundTripValidation(): {
    success: boolean;
    results: Array<{
      nodeId: string;
      result: any; // RoundTripValidationResult
    }>;
    summary: {
      totalNodes: number;
      successfulNodes: number;
      failedNodes: number;
      totalErrors: number;
      totalWarnings: number;
    };
  } {
    const currentState = this.getCurrentState();
    const results: Array<{ nodeId: string; result: any }> = [];
    let totalErrors = 0;
    let totalWarnings = 0;
    let successfulNodes = 0;
    let failedNodes = 0;

    for (const rootNodeId of currentState.rootNodes) {
      try {
        const rootNode = this.buildRuleNodeTree(rootNodeId);
        if (rootNode) {
          const result = this.roundTripValidator.validateRoundTrip(rootNode);
          results.push({ nodeId: rootNodeId, result });

          if (result.success) {
            successfulNodes++;
          } else {
            failedNodes++;
          }

          totalErrors += result.errors.length;
          totalWarnings += result.warnings.length;
        }
      } catch (error) {
        failedNodes++;
        totalErrors++;
        results.push({
          nodeId: rootNodeId,
          result: {
            success: false,
            errors: [{ message: `Validation failed: ${error}` }],
            warnings: [],
          },
        });
      }
    }

    return {
      success: failedNodes === 0,
      results,
      summary: {
        totalNodes: currentState.rootNodes.length,
        successfulNodes,
        failedNodes,
        totalErrors,
        totalWarnings,
      },
    };
  }

  // Private methods

  private getInitialState(): RuleBuilderState {
    return {
      nodes: {},
      rootNodes: [],
      selectedNodeId: undefined,
      currentDSL: undefined,
      currentJSON: undefined,
      validationErrors: [],
      mode: 'visual',
      isDirty: false,
      history: [],
      historyPosition: -1,
    };
  }

  private updateState(newState: RuleBuilderState): void {
    this._state.next(newState);
    this._stateChanged.next();
  }

  private saveSnapshot(description: string): void {
    const currentState = this.getCurrentState();

    const snapshot: RuleBuilderSnapshot = {
      timestamp: Date.now(),
      description,
      state: {
        nodes: { ...currentState.nodes },
        rootNodes: [...currentState.rootNodes],
        selectedNodeId: currentState.selectedNodeId,
      },
    };

    const newHistory = currentState.history.slice(
      0,
      currentState.historyPosition + 1,
    );
    newHistory.push(snapshot);

    // Limit history size
    const maxHistorySize = 50;
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }

    this.updateState({
      ...currentState,
      history: newHistory,
      historyPosition: newHistory.length - 1,
    });
  }

  private generateNodeLabel(type: RuleNodeType): string {
    const labels: Record<RuleNodeType, string> = {
      [RuleNodeType.FIELD_CONDITION]: 'Field Condition',
      [RuleNodeType.AND_GROUP]: 'AND Group',
      [RuleNodeType.OR_GROUP]: 'OR Group',
      [RuleNodeType.NOT_GROUP]: 'NOT Group',
      [RuleNodeType.XOR_GROUP]: 'XOR Group',
      [RuleNodeType.IMPLIES_GROUP]: 'IMPLIES Group',
      [RuleNodeType.REQUIRED_IF]: 'Required If',
      [RuleNodeType.VISIBLE_IF]: 'Visible If',
      [RuleNodeType.DISABLED_IF]: 'Disabled If',
      [RuleNodeType.READONLY_IF]: 'Readonly If',
      [RuleNodeType.FOR_EACH]: 'For Each',
      [RuleNodeType.UNIQUE_BY]: 'Unique By',
      [RuleNodeType.MIN_LENGTH]: 'Min Length',
      [RuleNodeType.MAX_LENGTH]: 'Max Length',
      [RuleNodeType.IF_DEFINED]: 'If Defined',
      [RuleNodeType.IF_NOT_NULL]: 'If Not Null',
      [RuleNodeType.IF_EXISTS]: 'If Exists',
      [RuleNodeType.WITH_DEFAULT]: 'With Default',
      [RuleNodeType.FUNCTION_CALL]: 'Function Call',
      [RuleNodeType.FIELD_TO_FIELD]: 'Field to Field',
      [RuleNodeType.CONTEXTUAL]: 'Contextual',
      [RuleNodeType.AT_LEAST]: 'At Least',
      [RuleNodeType.EXACTLY]: 'Exactly',
      [RuleNodeType.EXPRESSION]: 'Expression',
      [RuleNodeType.CONTEXTUAL_TEMPLATE]: 'Contextual Template',
      [RuleNodeType.CUSTOM]: 'Custom',
    };

    return labels[type] || type;
  }

  private buildRuleNodeTree(nodeId: string): RuleNode | null {
    const currentState = this.getCurrentState();
    const node = currentState.nodes[nodeId];

    if (!node) {
      return null;
    }

    return {
      ...node,
      children: node.children || [],
    };
  }

  private flattenRuleNodeTree(rootNode: RuleNode): {
    nodes: Record<string, RuleNode>;
    rootNodes: string[];
  } {
    const nodes: Record<string, RuleNode> = {};
    const rootNodes: string[] = [rootNode.id];

    const flattenNode = (node: RuleNode): void => {
      // Store the node in the flat structure
      nodes[node.id] = {
        ...node,
        children: node.children || [],
      };

      // Recursively flatten children if they exist and are RuleNode objects (not just IDs)
      if (node.children && node.children.length > 0) {
        // Check if children are RuleNode objects or string IDs
        const firstChild = node.children[0] as any;
        if (
          typeof firstChild === 'object' &&
          firstChild &&
          'id' in firstChild
        ) {
          // Children are RuleNode objects, need to flatten them
          (node.children as any[]).forEach((child: any) => {
            if (child && typeof child === 'object' && child.id) {
              child.parentId = node.id;
              flattenNode(child);
            }
          });
        }
      }
    };

    flattenNode(rootNode);
    return { nodes, rootNodes };
  }

  private validateNode(node: RuleNode): ValidationError[] {
    const errors: ValidationError[] = [];

    // Node-specific validation logic
    switch (node.type) {
      case RuleNodeType.FIELD_CONDITION:
        // Validate field condition
        break;
      // Add more cases...
    }

    return errors;
  }

  private validateStructure(state: RuleBuilderState): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for orphaned nodes
    // Check for circular references
    // Check for invalid parent-child relationships

    return errors;
  }

  private exportToTypeScript(
    specification: Specification<any>,
    options: ExportOptions,
  ): string {
    // Implementation for TypeScript export
    return `// TypeScript export not yet implemented`;
  }

  private exportToFormConfig(
    specification: Specification<any>,
    options: ExportOptions,
  ): string {
    // Implementation for form config export
    return `// Form config export not yet implemented`;
  }
}
