/**
 * Models for the Visual Rule Builder
 */

import { SpecificationMetadata, ComparisonOperator, ContextProvider } from 'praxis-specification';

/**
 * Value types for rule configuration
 */
export type ValueType = 'literal' | 'field' | 'context' | 'function';

/**
 * Valid comparison operators (aligned with praxis-specification)
 */
export type ValidComparisonOperator = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'startsWith' | 'endsWith' | 'in';

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
  /** Primary field name */
  fieldName: string;
  /** Comparison operator aligned with praxis-specification */
  operator: ValidComparisonOperator | string;
  /** Comparison value */
  value: any;
  /** Type of value for proper handling */
  valueType?: ValueType;
  /** Field to compare against (for field-to-field comparisons) */
  compareToField?: string;
  /** Context variable to use as value */
  contextVariable?: string;
  /** Optional metadata for error messages and UI hints */
  metadata?: SpecificationMetadata;
  /** Legacy field alias for backward compatibility */
  field?: string;
}

export interface BooleanGroupConfig {
  type: 'booleanGroup';
  /** Boolean operator type */
  operator: 'and' | 'or' | 'not' | 'xor' | 'implies';
  /** Minimum required true conditions (for atLeast scenarios) */
  minimumRequired?: number;
  /** Exact required true conditions (for exactly scenarios) */
  exactRequired?: number;
  /** Optional metadata for group validation */
  metadata?: SpecificationMetadata;
}

export interface ConditionalValidatorConfig {
  type: 'conditionalValidator';
  /** Type of conditional validator */
  validatorType: 'requiredIf' | 'visibleIf' | 'disabledIf' | 'readonlyIf';
  /** Target field to apply conditional logic */
  targetField: string;
  /** Embedded condition rule node */
  condition: RuleNode;
  /** Reference to condition rule node ID (for backward compatibility) */
  conditionNodeId?: string;
  /** Whether to invert the condition result */
  inverse?: boolean;
  /** Metadata aligned with praxis-specification */
  metadata?: SpecificationMetadata;
}

export interface CollectionValidationConfig {
  type: 'collectionValidation';
  /** Type of collection validation */
  validationType: 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength';
  /** Array field to validate */
  arrayField: string;
  /** Reference to rule node ID for forEach validation */
  itemCondition?: string;
  /** Property name for uniqueBy validation */
  uniqueKey?: string;
  /** Length value for min/max length validation */
  lengthValue?: number;
  /** Optional metadata for validation */
  metadata?: SpecificationMetadata;
}

/**
 * Enhanced collection validator configuration (Phase 2 Implementation)
 * Aligned with praxis-specification collection validation patterns
 */
export interface CollectionValidatorConfig {
  type: 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength';
  /** Target collection field name */
  targetCollection: string;
  
  // For Each specific
  /** Variable name for current item in forEach */
  itemVariable?: string;
  /** Variable name for current index in forEach */
  indexVariable?: string;
  /** Validation rules applied to each item */
  itemValidationRules?: {
    ruleType: string;
    fieldPath: string;
    errorMessage?: string;
  }[];
  
  // Unique By specific
  /** Fields to check uniqueness by */
  uniqueByFields?: string[];
  /** Case-sensitive uniqueness check */
  caseSensitive?: boolean;
  /** Ignore empty values in uniqueness check */
  ignoreEmpty?: boolean;
  /** Custom error message for duplicates */
  duplicateErrorMessage?: string;
  
  // Length specific
  /** Minimum number of items */
  minItems?: number;
  /** Maximum number of items */
  maxItems?: number;
  /** Custom error message for length validation */
  lengthErrorMessage?: string;
  /** Show current item count in UI */
  showItemCount?: boolean;
  /** Prevent adding items beyond maxItems */
  preventExcess?: boolean;
  
  // Advanced options
  /** Validate when items are added */
  validateOnAdd?: boolean;
  /** Validate when items are removed */
  validateOnRemove?: boolean;
  /** Validate when items are changed */
  validateOnChange?: boolean;
  /** Validate on form submit */
  validateOnSubmit?: boolean;
  /** Error display strategy */
  errorStrategy?: 'summary' | 'inline' | 'both';
  /** Stop validation on first error */
  stopOnFirstError?: boolean;
  /** Highlight items with errors */
  highlightErrorItems?: boolean;
  /** Batch size for large collections */
  batchSize?: number;
  /** Debounce validation for performance */
  debounceValidation?: boolean;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Optional metadata for validation messages */
  metadata?: SpecificationMetadata;
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
  /** Name of the function to call */
  functionName: string;
  /** Function parameters with type information */
  parameters: FunctionParameter[];
  /** Optional metadata for validation */
  metadata?: SpecificationMetadata;
}

export interface FunctionParameter {
  /** Parameter name */
  name: string;
  /** Parameter value */
  value: any;
  /** Type of parameter value */
  valueType: ValueType;
  /** Field name if valueType is 'field' */
  fieldName?: string;
  /** Context variable name if valueType is 'context' */
  contextVariable?: string;
}

export interface FieldToFieldConfig {
  type: 'fieldToField';
  /** Left side field name */
  leftField: string;
  /** Comparison operator */
  operator: ValidComparisonOperator | string;
  /** Right side field name */
  rightField: string;
  /** Transform functions applied to left field */
  leftTransforms?: string[];
  /** Transform functions applied to right field */
  rightTransforms?: string[];
  /** Optional metadata for validation */
  metadata?: SpecificationMetadata;
}

export interface ContextualConfig {
  type: 'contextual';
  /** Template string with context placeholders */
  template: string;
  /** Available context variables */
  contextVariables: Record<string, any>;
  /** Optional context provider for dynamic values */
  contextProvider?: ContextProvider;
  /** Strict validation of context tokens */
  strictContextValidation?: boolean;
  /** Optional metadata */
  metadata?: SpecificationMetadata;
}

export interface CardinalityConfig {
  type: 'cardinality';
  /** Type of cardinality check */
  cardinalityType: 'atLeast' | 'exactly';
  /** Required count of true conditions */
  count: number;
  /** References to rule node IDs to evaluate */
  conditions: string[];
  /** Optional metadata for validation */
  metadata?: SpecificationMetadata;
}

export interface CustomConfig {
  type: 'custom';
  /** Custom configuration type identifier */
  customType: string;
  /** Custom properties specific to the type */
  properties: Record<string, any>;
  /** Optional metadata for validation */
  metadata?: SpecificationMetadata;
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

// ===== Enhanced Configuration Interfaces =====

/**
 * Configuration for optional field handling
 */
export interface OptionalFieldConfig {
  type: 'optionalField';
  /** Type of optional field validation */
  validationType: 'ifDefined' | 'ifNotNull' | 'ifExists' | 'withDefault';
  /** Target field name */
  fieldName: string;
  /** Default value when field is undefined/null */
  defaultValue?: any;
  /** Reference to condition rule node ID */
  conditionNodeId?: string;
  /** Optional metadata for validation */
  metadata?: SpecificationMetadata;
}

// ===== Phase 4: Expression and Contextual Configuration Interfaces =====

/**
 * Configuration for expression specifications (aligned with praxis-specification)
 */
export interface ExpressionConfig {
  type: 'expression';
  
  /** DSL expression string */
  expression: string;
  
  /** Function registry for validation */
  functionRegistry?: any; // FunctionRegistry<any> from praxis-specification
  
  /** Context provider for variable resolution */
  contextProvider?: ContextProvider;
  
  /** Known field names for validation */
  knownFields?: string[];
  
  /** Enable performance warnings */
  enablePerformanceWarnings?: boolean;
  
  /** Maximum expression complexity */
  maxComplexity?: number;
  
  /** Metadata aligned with praxis-specification */
  metadata?: SpecificationMetadata;
}

/**
 * Configuration for contextual template specifications (aligned with praxis-specification)
 */
export interface ContextualTemplateConfig {
  type: 'contextualTemplate';
  
  /** Template string with context tokens */
  template: string;
  
  /** Available context variables */
  contextVariables?: Record<string, any>;
  
  /** Context provider instance */
  contextProvider?: ContextProvider;
  
  /** Enable strict validation of context tokens */
  strictContextValidation?: boolean;
  
  /** Metadata aligned with praxis-specification */
  metadata?: SpecificationMetadata;
}