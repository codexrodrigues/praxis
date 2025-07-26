/**
 * Array Field Schema Support for Collection Validators
 * Phase 2 Implementation
 */

import { FieldSchema, FieldType } from './field-schema.model';
import { CollectionValidatorConfig } from './rule-builder.model';

/**
 * Extended field schema for array types
 */
export interface ArrayFieldSchema extends FieldSchema {
  type: FieldType.ARRAY;
  
  /** Schema for individual items in the array */
  itemSchema?: FieldSchema;
  
  /** Minimum number of items */
  minItems?: number;
  
  /** Maximum number of items */
  maxItems?: number;
  
  /** Whether items must be unique */
  uniqueItems?: boolean;
  
  /** Fields to check for uniqueness */
  uniqueBy?: string[];
  
  /** Default value for new items */
  defaultItem?: any;
  
  /** Whether to allow adding items */
  allowAdd?: boolean;
  
  /** Whether to allow removing items */
  allowRemove?: boolean;
  
  /** Whether to allow reordering items */
  allowReorder?: boolean;
  
  /** Custom validation rules for the array */
  arrayValidation?: {
    forEach?: {
      rules: any[];
      stopOnFirstError?: boolean;
    };
    uniqueBy?: {
      fields: string[];
      caseSensitive?: boolean;
      ignoreEmpty?: boolean;
    };
    length?: {
      min?: number;
      max?: number;
      errorMessage?: string;
    };
  };
  
  /** UI configuration specific to arrays */
  arrayUiConfig?: {
    /** How to display the array */
    displayMode?: 'table' | 'cards' | 'list' | 'accordion';
    
    /** Whether to show item count */
    showCount?: boolean;
    
    /** Custom add button text */
    addButtonText?: string;
    
    /** Custom remove button text */
    removeButtonText?: string;
    
    /** Whether to confirm before removing */
    confirmRemove?: boolean;
    
    /** Message to show when array is empty */
    emptyMessage?: string;
    
    /** Whether to collapse items by default */
    collapsedByDefault?: boolean;
    
    /** Maximum items to show before pagination */
    pageSize?: number;
  };
}

/**
 * Utility to check if a field schema is an array
 */
export function isArrayFieldSchema(schema: FieldSchema): schema is ArrayFieldSchema {
  return schema.type === FieldType.ARRAY;
}

/**
 * Utility to get nested field paths from an array schema
 */
export function getArrayItemFieldPaths(schema: ArrayFieldSchema, prefix: string = ''): string[] {
  const paths: string[] = [];
  
  if (!schema.itemSchema) {
    return paths;
  }
  
  const itemPrefix = prefix ? `${prefix}.` : '';
  
  if (schema.itemSchema.type === FieldType.OBJECT && 'properties' in schema.itemSchema) {
    // Handle object items
    const objectSchema = schema.itemSchema as any;
    Object.entries(objectSchema.properties || {}).forEach(([key, prop]: [string, any]) => {
      const fieldPath = `${itemPrefix}${key}`;
      paths.push(fieldPath);
      
      // Recursively handle nested arrays
      if (prop.type === FieldType.ARRAY) {
        paths.push(...getArrayItemFieldPaths(prop as ArrayFieldSchema, fieldPath));
      }
    });
  } else {
    // Handle primitive items
    paths.push(itemPrefix);
  }
  
  return paths;
}

/**
 * Array validation context for runtime validation
 */
export interface ArrayValidationContext {
  /** The array being validated */
  array: any[];
  
  /** Current item being validated (for forEach) */
  currentItem?: any;
  
  /** Current item index (for forEach) */
  currentIndex?: number;
  
  /** Parent context */
  parentContext?: any;
  
  /** Field schema */
  schema: ArrayFieldSchema;
  
  /** Accumulated errors */
  errors: ArrayValidationError[];
}

/**
 * Array validation error
 */
export interface ArrayValidationError {
  /** Error type */
  type: 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength' | 'other';
  
  /** Error message */
  message: string;
  
  /** Item index (if applicable) */
  itemIndex?: number;
  
  /** Field path within item (if applicable) */
  fieldPath?: string;
  
  /** Duplicate indices (for uniqueBy) */
  duplicateIndices?: number[];
  
  /** Expected value */
  expected?: any;
  
  /** Actual value */
  actual?: any;
}

/**
 * Array field analyzer for detecting array fields in schemas
 */
export class ArrayFieldAnalyzer {
  /**
   * Analyze a schema tree and find all array fields
   */
  static findArrayFields(schemas: Record<string, FieldSchema>): Record<string, ArrayFieldSchema> {
    const arrayFields: Record<string, ArrayFieldSchema> = {};
    
    Object.entries(schemas).forEach(([key, schema]) => {
      if (isArrayFieldSchema(schema)) {
        arrayFields[key] = schema;
      }
      
      // Check nested fields in objects
      if (schema.type === FieldType.OBJECT && 'properties' in schema) {
        const objectSchema = schema as any;
        const nestedArrays = this.findArrayFields(objectSchema.properties || {});
        
        Object.entries(nestedArrays).forEach(([nestedKey, nestedSchema]) => {
          arrayFields[`${key}.${nestedKey}`] = nestedSchema;
        });
      }
    });
    
    return arrayFields;
  }
  
  /**
   * Get validation rules for an array field
   */
  static getValidationRules(schema: ArrayFieldSchema): ArrayCollectionValidationRule[] {
    const rules: ArrayCollectionValidationRule[] = [];
    
    // Length constraints
    if (schema.minItems !== undefined) {
      rules.push({
        type: 'minLength',
        value: schema.minItems,
        message: `Must have at least ${schema.minItems} items`
      });
    }
    
    if (schema.maxItems !== undefined) {
      rules.push({
        type: 'maxLength',
        value: schema.maxItems,
        message: `Must have at most ${schema.maxItems} items`
      });
    }
    
    // Uniqueness constraints
    if (schema.uniqueItems || schema.uniqueBy) {
      rules.push({
        type: 'uniqueBy',
        fields: schema.uniqueBy || [],
        message: 'Items must be unique'
      });
    }
    
    // Custom validation rules
    if (schema.arrayValidation) {
      if (schema.arrayValidation.forEach) {
        rules.push({
          type: 'forEach',
          rules: schema.arrayValidation.forEach.rules,
          message: 'Each item must be valid'
        });
      }
    }
    
    return rules;
  }
}

/**
 * Array collection validation rule
 */
export interface ArrayCollectionValidationRule {
  type: 'forEach' | 'uniqueBy' | 'minLength' | 'maxLength';
  value?: any;
  fields?: string[];
  rules?: any[];
  message: string;
}