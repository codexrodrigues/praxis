/**
 * Models for the Visual Rule Builder
 */

import { SpecificationMetadata } from 'praxis-specification';

/**
 * Value types for rule configuration
 */
export type ValueType = 'literal' | 'field' | 'context' | 'function';

export interface RuleNode {
  /** Unique identifier for this rule node */
  id: string;
  
  /** Type of rule node */
  type: RuleNodeType | RuleNodeTypeString;
  
  /** Human-readable label for this rule */
  label?: string;
  
  /** Rule metadata */
  metadata?: SpecificationMetadata;
  
  /** Whether this node is currently selected */
  selected?: boolean;
  
  /** Whether this node is expanded (for groups) */
  expanded?: boolean;
  
  /** Parent node ID */
  parentId?: string;
  
  /** Child node IDs (for groups) */
  children?: string[];
  
  /** Rule-specific configuration */
  config?: RuleNodeConfig;
}

export enum RuleNodeType {
  // Basic field comparisons
  FIELD_CONDITION = 'fieldCondition',
  
  // Boolean compositions
  AND_GROUP = 'andGroup',
  OR_GROUP = 'orGroup',
  NOT_GROUP = 'notGroup',
  XOR_GROUP = 'xorGroup',
  IMPLIES_GROUP = 'impliesGroup',
  
  // Conditional validators (Phase 1 Implementation)
  REQUIRED_IF = 'requiredIf',
  VISIBLE_IF = 'visibleIf',
  DISABLED_IF = 'disabledIf',
  READONLY_IF = 'readonlyIf',
  
  // Collection validations
  FOR_EACH = 'forEach',
  UNIQUE_BY = 'uniqueBy',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  
  // Optional field handling
  IF_DEFINED = 'ifDefined',
  IF_NOT_NULL = 'ifNotNull',
  IF_EXISTS = 'ifExists',
  WITH_DEFAULT = 'withDefault',
  
  // Advanced types
  FUNCTION_CALL = 'functionCall',
  FIELD_TO_FIELD = 'fieldToField',
  CONTEXTUAL = 'contextual',
  AT_LEAST = 'atLeast',
  EXACTLY = 'exactly',
  
  // Phase 4: Expression and Contextual Support
  EXPRESSION = 'expression',
  CONTEXTUAL_TEMPLATE = 'contextualTemplate',
  
  // Custom/extensible
  CUSTOM = 'custom'
}

/**
 * String literal type for rule node types (for flexibility)
 */
export type RuleNodeTypeString = 
  | 'fieldCondition'
  | 'andGroup' | 'orGroup' | 'notGroup' | 'xorGroup' | 'impliesGroup'
  | 'requiredIf' | 'visibleIf' | 'disabledIf' | 'readonlyIf'
  | 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength'
  | 'ifDefined' | 'ifNotNull' | 'ifExists' | 'withDefault'
  | 'functionCall' | 'fieldToField' | 'contextual' | 'atLeast' | 'exactly'
  | 'expression' | 'contextualTemplate'
  | 'custom';

export type RuleNodeConfig = 
  | FieldConditionConfig
  | BooleanGroupConfig
  | ConditionalValidatorConfig
  | CollectionValidationConfig
  | CollectionValidatorConfig
  | OptionalFieldConfig
  | FunctionCallConfig
  | FieldToFieldConfig
  | ContextualConfig
  | CardinalityConfig
  | ExpressionConfig
  | ContextualTemplateConfig
  | CustomConfig;

export interface FieldConditionConfig {
  type: 'fieldCondition';
  field?: string; // For specification bridge compatibility
  fieldName: string;
  operator: string;
  value: any;
  valueType?: ValueType;
  compareToField?: string;
  contextVariable?: string;
}

export interface BooleanGroupConfig {
  type: 'booleanGroup';
  operator: 'and' | 'or' | 'not' | 'xor' | 'implies';
  minimumRequired?: number; // For atLeast scenarios
  exactRequired?: number;   // For exactly scenarios
}

export interface ConditionalValidatorConfig {
  type: 'conditionalValidator';
  validatorType: 'requiredIf' | 'visibleIf' | 'disabledIf' | 'readonlyIf';
  targetField: string;
  condition: RuleNode; // Embedded condition rule node
  conditionNodeId?: string; // Reference to condition rule node ID (for backward compatibility)
  inverse?: boolean; // Whether to invert the condition result
  metadata?: {
    description?: string;
    errorMessage?: string;
    successMessage?: string;
    uiHints?: Record<string, any>;
  };
}

export interface CollectionValidationConfig {
  type: 'collectionValidation';
  validationType: 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength';
  arrayField: string;
  itemCondition?: string; // Reference to rule node ID for forEach
  uniqueKey?: string;     // Property name for uniqueBy
  lengthValue?: number;   // For min/max length
}

/**
 * Enhanced collection validator configuration (Phase 2 Implementation)
 */
export interface CollectionValidatorConfig {
  type: 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength';
  targetCollection: string;
  
  // For Each specific
  itemVariable?: string;
  indexVariable?: string;
  itemValidationRules?: {
    ruleType: string;
    fieldPath: string;
    errorMessage?: string;
  }[];
  
  // Unique By specific
  uniqueByFields?: string[];
  caseSensitive?: boolean;
  ignoreEmpty?: boolean;
  duplicateErrorMessage?: string;
  
  // Length specific
  minItems?: number;
  maxItems?: number;
  lengthErrorMessage?: string;
  showItemCount?: boolean;
  preventExcess?: boolean;
  
  // Advanced options
  validateOnAdd?: boolean;
  validateOnRemove?: boolean;
  validateOnChange?: boolean;
  validateOnSubmit?: boolean;
  errorStrategy?: 'summary' | 'inline' | 'both';
  stopOnFirstError?: boolean;
  highlightErrorItems?: boolean;
  batchSize?: number;
  debounceValidation?: boolean;
  debounceDelay?: number;
}

export interface OptionalFieldConfig {
  type: 'optionalField';
  validationType: 'ifDefined' | 'ifNotNull' | 'ifExists' | 'withDefault';
  fieldName: string;
  defaultValue?: any;
  condition?: string; // Reference to rule node ID
}

export interface FunctionCallConfig {
  type: 'functionCall';
  functionName: string;
  parameters: FunctionParameter[];
}

export interface FunctionParameter {
  name: string;
  value: any;
  valueType: 'literal' | 'field' | 'context';
  fieldName?: string;
  contextVariable?: string;
}

export interface FieldToFieldConfig {
  type: 'fieldToField';
  leftField: string;
  operator: string;
  rightField: string;
  leftTransforms?: string[];
  rightTransforms?: string[];
}

export interface ContextualConfig {
  type: 'contextual';
  template: string;
  contextVariables: Record<string, any>;
}

export interface CardinalityConfig {
  type: 'cardinality';
  cardinalityType: 'atLeast' | 'exactly';
  count: number;
  conditions: string[]; // References to rule node IDs
}

export interface CustomConfig {
  type: 'custom';
  customType: string;
  properties: Record<string, any>;
}

/**
 * Validator types for conditional validation
 */
export enum ConditionalValidatorType {
  REQUIRED_IF = 'requiredIf',
  VISIBLE_IF = 'visibleIf',
  DISABLED_IF = 'disabledIf',
  READONLY_IF = 'readonlyIf'
}

/**
 * Preview data for conditional validator simulation
 */
export interface ConditionalValidatorPreview {
  targetField: string;
  currentValue: any;
  conditionResult: boolean;
  validatorType: ConditionalValidatorType;
  resultingState: {
    isRequired?: boolean;
    isVisible?: boolean;
    isDisabled?: boolean;
    isReadonly?: boolean;
  };
  example: string;
}

/**
 * Rule building session state
 */
export interface RuleBuilderState {
  /** All rule nodes in the current session */
  nodes: Record<string, RuleNode>;
  
  /** Root node IDs (top-level rules) */
  rootNodes: string[];
  
  /** Currently selected node ID */
  selectedNodeId?: string;
  
  /** Current DSL representation */
  currentDSL?: string;
  
  /** Current JSON representation */
  currentJSON?: any;
  
  /** Validation errors */
  validationErrors: ValidationError[];
  
  /** Build mode */
  mode: 'visual' | 'dsl' | 'json';
  
  /** Whether the rule is dirty (has unsaved changes) */
  isDirty: boolean;
  
  /** Undo/redo history */
  history: RuleBuilderSnapshot[];
  
  /** Current history position */
  historyPosition: number;
}

export interface ValidationError {
  /** Error ID */
  id: string;
  
  /** Error message */
  message: string;
  
  /** Error severity */
  severity: 'error' | 'warning' | 'info';
  
  /** Associated node ID */
  nodeId?: string;
  
  /** Error code for programmatic handling */
  code?: string;
  
  /** Suggested fix */
  suggestion?: string;
}

export interface RuleBuilderSnapshot {
  /** Timestamp of this snapshot */
  timestamp: number;
  
  /** Description of the change */
  description: string;
  
  /** Complete state at this point */
  state: {
    nodes: Record<string, RuleNode>;
    rootNodes: string[];
    selectedNodeId?: string;
  };
}

/**
 * Rule template for common scenarios
 */
export interface RuleTemplate {
  /** Template ID */
  id: string;
  
  /** Template name */
  name: string;
  
  /** Template description */
  description: string;
  
  /** Template category */
  category: string;
  
  /** Template tags for search */
  tags: string[];
  
  /** Rule nodes that make up this template */
  nodes: RuleNode[];
  
  /** Root node IDs */
  rootNodes: string[];
  
  /** Required field schemas for this template */
  requiredFields?: string[];
  
  /** Example usage */
  example?: string;
  
  /** Template preview image/icon */
  icon?: string;
  
  /** Template metadata */
  metadata?: TemplateMetadata;
}

/**
 * Template metadata for tracking and management
 */
export interface TemplateMetadata {
  /** Creation date */
  createdAt?: Date;
  
  /** Last update date */
  updatedAt?: Date;
  
  /** Last used date */
  lastUsed?: Date;
  
  /** Import date (if imported) */
  importedAt?: Date;
  
  /** Template version */
  version?: string;
  
  /** Usage count */
  usageCount?: number;
  
  /** Template complexity */
  complexity?: 'simple' | 'medium' | 'complex';
  
  /** Original template ID (for imports/copies) */
  originalId?: string;
  
  /** Author information */
  author?: {
    name?: string;
    email?: string;
    organization?: string;
  };
  
  /** Template size metrics */
  metrics?: {
    nodeCount?: number;
    maxDepth?: number;
    fieldCount?: number;
  };
}

/**
 * Export options for rules
 */
export interface ExportOptions {
  /** Export format */
  format: 'json' | 'dsl' | 'typescript' | 'form-config';
  
  /** Include metadata in export */
  includeMetadata?: boolean;
  
  /** Pretty print JSON/DSL */
  prettyPrint?: boolean;
  
  /** Include comments in DSL */
  includeComments?: boolean;
  
  /** Metadata position in DSL */
  metadataPosition?: 'before' | 'after' | 'inline';
  
  /** TypeScript interface name (for TS export) */
  interfaceName?: string;
  
  /** Additional export configuration */
  config?: Record<string, any>;
}

/**
 * Import options for rules
 */
export interface ImportOptions {
  /** Source format */
  format: 'json' | 'dsl' | 'form-config';
  
  /** Whether to merge with existing rules */
  merge?: boolean;
  
  /** Whether to preserve existing metadata */
  preserveMetadata?: boolean;
  
  /** Field schema mapping for validation */
  fieldSchemas?: Record<string, any>;
}

/**
 * Rule builder configuration
 */
export interface RuleBuilderConfig {
  /** Available field schemas */
  fieldSchemas: Record<string, any>;
  
  /** Context variables */
  contextVariables?: any[];
  
  /** Custom functions */
  customFunctions?: any[];
  
  /** Available rule templates */
  templates?: RuleTemplate[];
  
  /** UI configuration */
  ui?: {
    /** Theme */
    theme?: 'light' | 'dark' | 'auto';
    
    /** Show advanced features */
    showAdvanced?: boolean;
    
    /** Enable drag and drop */
    enableDragDrop?: boolean;
    
    /** Show DSL preview */
    showDSLPreview?: boolean;
    
    /** Show validation errors inline */
    showInlineErrors?: boolean;
    
    /** Auto-save interval (ms) */
    autoSaveInterval?: number;
  };
  
  /** Validation configuration */
  validation?: {
    /** Enable real-time validation */
    realTime?: boolean;
    
    /** Validation strictness */
    strictness?: 'strict' | 'normal' | 'loose';
    
    /** Custom validation rules */
    customRules?: any[];
  };
  
  /** Export/import configuration */
  exportImport?: {
    /** Default export format */
    defaultExportFormat?: 'json' | 'dsl' | 'typescript';
    
    /** Supported formats */
    supportedFormats?: string[];
    
    /** Include metadata by default */
    includeMetadataByDefault?: boolean;
  };
}

// ===== Phase 4: Expression and Contextual Configuration Interfaces =====

/**
 * Configuration for expression specifications
 */
export interface ExpressionConfig {
  type: 'expression';
  
  /** DSL expression string */
  expression: string;
  
  /** Function registry for validation */
  functionRegistry?: any;
  
  /** Context provider for variable resolution */
  contextProvider?: any;
  
  /** Known field names for validation */
  knownFields?: string[];
  
  /** Enable performance warnings */
  enablePerformanceWarnings?: boolean;
  
  /** Maximum expression complexity */
  maxComplexity?: number;
  
  /** Additional metadata */
  metadata?: any;
}

/**
 * Configuration for contextual template specifications
 */
export interface ContextualTemplateConfig {
  type: 'contextualTemplate';
  
  /** Template string with context tokens */
  template: string;
  
  /** Available context variables */
  contextVariables?: any[];
  
  /** Context provider instance */
  contextProvider?: any;
  
  /** Enable strict validation of context tokens */
  strictContextValidation?: boolean;
  
  /** Additional metadata */
  metadata?: any;
}