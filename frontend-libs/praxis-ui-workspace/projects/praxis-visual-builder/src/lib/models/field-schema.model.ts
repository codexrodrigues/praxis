/**
 * Field schema model for dynamic field configuration in the Visual Builder
 */

export interface FieldSchema {
  /** Unique field identifier */
  name: string;
  
  /** Human-readable field label */
  label: string;
  
  /** Field data type */
  type: FieldType;
  
  /** Optional description or help text */
  description?: string;
  
  /** Whether this field is required */
  required?: boolean;
  
  /** Allowed values for enum/select fields */
  allowedValues?: FieldOption[];
  
  /** Format constraints for the field */
  format?: FieldFormat;
  
  /** UI configuration for field display */
  uiConfig?: FieldUIConfig;
  
  /** Nested fields for object types */
  properties?: Record<string, FieldSchema>;
  
  /** Item schema for array types */
  items?: FieldSchema;
}

export interface FieldOption {
  /** Option value */
  value: any;
  
  /** Option display label */
  label: string;
  
  /** Optional description */
  description?: string;
  
  /** Whether this option is disabled */
  disabled?: boolean;
}

export interface FieldFormat {
  /** Minimum value (for numbers) or length (for strings/arrays) */
  minimum?: number;
  
  /** Maximum value (for numbers) or length (for strings/arrays) */
  maximum?: number;
  
  /** Regular expression pattern for string validation */
  pattern?: string;
  
  /** Date format for date fields */
  dateFormat?: string;
  
  /** Number format options */
  numberFormat?: {
    decimals?: number;
    currency?: string;
    percentage?: boolean;
  };
}

export interface FieldUIConfig {
  /** Icon to display with the field */
  icon?: string;
  
  /** Color theme for the field */
  color?: string;
  
  /** Field category for grouping */
  category?: string;
  
  /** Field priority for sorting */
  priority?: number;
  
  /** Whether to show this field in simple mode */
  showInSimpleMode?: boolean;
  
  /** Custom CSS classes */
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

/**
 * Available comparison operators for each field type
 */
export const FIELD_TYPE_OPERATORS: Record<FieldType, string[]> = {
  [FieldType.STRING]: ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'endsWith', 'matches', 'isEmpty', 'isNotEmpty', 'in', 'notIn'],
  [FieldType.NUMBER]: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'in', 'notIn', 'between'],
  [FieldType.INTEGER]: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'in', 'notIn', 'between'],
  [FieldType.BOOLEAN]: ['equals', 'notEquals', 'isTrue', 'isFalse'],
  [FieldType.DATE]: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'between', 'isNull', 'isNotNull'],
  [FieldType.DATETIME]: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'between', 'isNull', 'isNotNull'],
  [FieldType.TIME]: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'between'],
  [FieldType.EMAIL]: ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'endsWith', 'matches', 'isEmpty', 'isNotEmpty'],
  [FieldType.URL]: ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'endsWith', 'matches', 'isEmpty', 'isNotEmpty'],
  [FieldType.PHONE]: ['equals', 'notEquals', 'contains', 'notContains', 'startsWith', 'matches', 'isEmpty', 'isNotEmpty'],
  [FieldType.ARRAY]: ['isEmpty', 'isNotEmpty', 'minLength', 'maxLength', 'contains', 'notContains'],
  [FieldType.OBJECT]: ['isNull', 'isNotNull', 'hasProperty', 'notHasProperty'],
  [FieldType.ENUM]: ['equals', 'notEquals', 'in', 'notIn'],
  [FieldType.UUID]: ['equals', 'notEquals', 'matches', 'isEmpty', 'isNotEmpty'],
  [FieldType.JSON]: ['isNull', 'isNotNull', 'isEmpty', 'isNotEmpty', 'hasProperty', 'notHasProperty']
};

/**
 * Operator display labels for UI
 */
export const OPERATOR_LABELS: Record<string, string> = {
  equals: 'equals',
  notEquals: 'not equals',
  greaterThan: 'greater than',
  greaterThanOrEqual: 'greater than or equal',
  lessThan: 'less than',
  lessThanOrEqual: 'less than or equal',
  contains: 'contains',
  notContains: 'does not contain',
  startsWith: 'starts with',
  endsWith: 'ends with',
  matches: 'matches pattern',
  isEmpty: 'is empty',
  isNotEmpty: 'is not empty',
  isNull: 'is null',
  isNotNull: 'is not null',
  isTrue: 'is true',
  isFalse: 'is false',
  in: 'is in',
  notIn: 'is not in',
  between: 'is between',
  minLength: 'minimum length',
  maxLength: 'maximum length',
  hasProperty: 'has property',
  notHasProperty: 'does not have property'
};

/**
 * Context for field schema interpretation
 */
export interface FieldSchemaContext {
  /** Available context variables (e.g., ${user.role}, ${now}) */
  contextVariables?: ContextVariable[];
  
  /** Available custom functions */
  customFunctions?: CustomFunction[];
  
  /** Global configuration */
  config?: {
    /** Whether to show advanced features */
    showAdvanced?: boolean;
    
    /** Default locale for formatting */
    locale?: string;
    
    /** Theme configuration */
    theme?: 'light' | 'dark' | 'auto';
  };
}

export interface ContextVariable {
  /** Variable name (without ${} wrapper) */
  name: string;
  
  /** Display label */
  label: string;
  
  /** Variable type */
  type: FieldType;
  
  /** Example value for preview */
  example?: any;
  
  /** Description */
  description?: string;
}

export interface CustomFunction {
  /** Function name */
  name: string;
  
  /** Display label */
  label: string;
  
  /** Function description */
  description?: string;
  
  /** Expected parameter types */
  parameters: {
    name: string;
    type: FieldType;
    required?: boolean;
    description?: string;
  }[];
  
  /** Return type */
  returnType: FieldType;
  
  /** Example usage */
  example?: string;
}