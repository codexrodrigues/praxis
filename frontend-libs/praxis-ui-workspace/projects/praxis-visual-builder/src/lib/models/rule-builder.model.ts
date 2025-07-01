/**
 * Models for the Visual Rule Builder
 */

import { SpecificationMetadata } from '../../../praxis-specification/src/lib/specification/specification-metadata';

export interface RuleNode {
  /** Unique identifier for this rule node */
  id: string;
  
  /** Type of rule node */
  type: RuleNodeType;
  
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
  
  // Phase 2 conditional validators
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
  
  // Custom/extensible
  CUSTOM = 'custom'
}

export type RuleNodeConfig = 
  | FieldConditionConfig
  | BooleanGroupConfig
  | ConditionalValidatorConfig
  | CollectionValidationConfig
  | OptionalFieldConfig
  | FunctionCallConfig
  | FieldToFieldConfig
  | ContextualConfig
  | CardinalityConfig
  | CustomConfig;

export interface FieldConditionConfig {
  type: 'fieldCondition';
  fieldName: string;
  operator: string;
  value: any;
  valueType?: 'literal' | 'field' | 'context' | 'function';
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
  condition: string; // Reference to condition rule node ID
}

export interface CollectionValidationConfig {
  type: 'collectionValidation';
  validationType: 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength';
  arrayField: string;
  itemCondition?: string; // Reference to rule node ID for forEach
  uniqueKey?: string;     // Property name for uniqueBy
  lengthValue?: number;   // For min/max length
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