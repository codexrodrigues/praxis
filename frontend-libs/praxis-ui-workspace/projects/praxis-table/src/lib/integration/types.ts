// Temporary type definitions for integration until praxis-visual-builder is fully integrated

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  required?: boolean;
  allowedValues?: FieldOption[];
  format?: FieldFormat;
  uiConfig?: FieldUIConfig;
  properties?: Record<string, FieldSchema>;
  items?: FieldSchema;
}

export interface FieldOption {
  value: any;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface FieldFormat {
  minimum?: number;
  maximum?: number;
  pattern?: string;
  dateFormat?: string;
  numberFormat?: {
    decimals?: number;
    currency?: string;
    percentage?: boolean;
  };
}

export interface FieldUIConfig {
  icon?: string;
  color?: string;
  category?: string;
  priority?: number;
  showInSimpleMode?: boolean;
  cssClass?: string;
}

export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
  EMAIL = 'email',
  URL = 'url',
  PHONE = 'phone',
  ARRAY = 'array',
  OBJECT = 'object',
  ENUM = 'enum',
  UUID = 'uuid',
  JSON = 'json'
}

export interface FieldSchemaContext {
  contextVariables?: ContextVariable[];
  customFunctions?: CustomFunction[];
  config?: {
    showAdvanced?: boolean;
    locale?: string;
    theme?: 'light' | 'dark' | 'auto';
  };
}

export interface ContextVariable {
  name: string;
  label: string;
  type: FieldType;
  example?: any;
  description?: string;
}

export interface CustomFunction {
  name: string;
  label: string;
  description?: string;
  parameters: {
    name: string;
    type: FieldType;
    required?: boolean;
    description?: string;
  }[];
  returnType: FieldType;
  example?: string;
}

export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  nodes: RuleNode[];
  rootNodes: string[];
  requiredFields?: string[];
  example?: string;
  icon?: string;
}

export interface RuleNode {
  id: string;
  type: RuleNodeType;
  label?: string;
  metadata?: any;
  selected?: boolean;
  expanded?: boolean;
  parentId?: string;
  children?: string[];
  config?: any;
}

export enum RuleNodeType {
  FIELD_CONDITION = 'fieldCondition',
  AND_GROUP = 'andGroup',
  OR_GROUP = 'orGroup',
  NOT_GROUP = 'notGroup'
}

export interface RuleBuilderConfig {
  fieldSchemas: Record<string, any>;
  contextVariables?: any[];
  customFunctions?: any[];
  templates?: RuleTemplate[];
  ui?: {
    theme?: 'light' | 'dark' | 'auto';
    showAdvanced?: boolean;
    enableDragDrop?: boolean;
    showDSLPreview?: boolean;
    showInlineErrors?: boolean;
    autoSaveInterval?: number;
  };
  validation?: {
    realTime?: boolean;
    strictness?: string;
  };
}

export interface RuleBuilderState {
  nodes: Record<string, RuleNode>;
  rootNodes: string[];
  selectedNodeId?: string;
  currentDSL?: string;
  currentJSON?: any;
  validationErrors: any[];
  mode: 'visual' | 'dsl' | 'json';
  isDirty: boolean;
  history: any[];
  historyPosition: number;
}

export interface ExportOptions {
  format: 'json' | 'dsl' | 'typescript' | 'form-config';
  includeMetadata?: boolean;
  prettyPrint?: boolean;
  includeComments?: boolean;
  metadataPosition?: 'before' | 'after' | 'inline';
  interfaceName?: string;
  config?: Record<string, any>;
}

// Service stubs
export abstract class RuleBuilderService {
  abstract exportDSL(ruleNode?: any): string;
}

// Component stub for now - will be replaced when praxis-visual-builder is available
export class RuleEditorComponent {
  // Minimal placeholder implementation
}