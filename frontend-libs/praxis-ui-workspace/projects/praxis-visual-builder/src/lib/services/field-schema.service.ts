import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { 
  FieldSchema, 
  FieldType, 
  FIELD_TYPE_OPERATORS, 
  OPERATOR_LABELS,
  FieldSchemaContext,
  ContextVariable,
  CustomFunction
} from '../models/field-schema.model';

@Injectable({
  providedIn: 'root'
})
export class FieldSchemaService {
  private readonly _fieldSchemas = new BehaviorSubject<Record<string, FieldSchema>>({});
  private readonly _context = new BehaviorSubject<FieldSchemaContext>({});

  public readonly fieldSchemas$ = this._fieldSchemas.asObservable();
  public readonly context$ = this._context.asObservable();

  constructor() {}

  /**
   * Set field schemas for the visual builder
   */
  setFieldSchemas(schemas: Record<string, FieldSchema>): void {
    this._fieldSchemas.next(schemas);
  }

  /**
   * Add a single field schema
   */
  addFieldSchema(name: string, schema: FieldSchema): void {
    const current = this._fieldSchemas.value;
    this._fieldSchemas.next({
      ...current,
      [name]: schema
    });
  }

  /**
   * Remove a field schema
   */
  removeFieldSchema(name: string): void {
    const current = this._fieldSchemas.value;
    const updated = { ...current };
    delete updated[name];
    this._fieldSchemas.next(updated);
  }

  /**
   * Get field schema by name
   */
  getFieldSchema(name: string): FieldSchema | undefined {
    return this._fieldSchemas.value[name];
  }

  /**
   * Get all field schemas
   */
  getAllFieldSchemas(): Record<string, FieldSchema> {
    return this._fieldSchemas.value;
  }

  /**
   * Get field schemas as array with enhanced info
   */
  getFieldSchemasArray(): Observable<EnhancedFieldSchema[]> {
    return this.fieldSchemas$.pipe(
      map(schemas => 
        Object.entries(schemas).map(([name, schema]) => ({
          ...schema,
          name,
          operators: this.getAvailableOperators(schema.type),
          operatorLabels: this.getOperatorLabels(schema.type)
        }))
      )
    );
  }

  /**
   * Set context for field schemas
   */
  setContext(context: FieldSchemaContext): void {
    this._context.next(context);
  }

  /**
   * Get available operators for a field type
   */
  getAvailableOperators(fieldType: FieldType): string[] {
    return FIELD_TYPE_OPERATORS[fieldType] || [];
  }

  /**
   * Get operator labels for a field type
   */
  getOperatorLabels(fieldType: FieldType): Record<string, string> {
    const operators = this.getAvailableOperators(fieldType);
    const labels: Record<string, string> = {};
    
    operators.forEach(op => {
      labels[op] = OPERATOR_LABELS[op] || op;
    });
    
    return labels;
  }

  /**
   * Validate field value against schema
   */
  validateFieldValue(fieldName: string, value: any): ValidationResult {
    const schema = this.getFieldSchema(fieldName);
    
    if (!schema) {
      return {
        valid: false,
        errors: [`Field '${fieldName}' not found in schema`]
      };
    }

    const errors: string[] = [];

    // Type validation
    if (!this.isValidType(value, schema.type)) {
      errors.push(`Value must be of type ${schema.type}`);
    }

    // Required validation
    if (schema.required && (value === null || value === undefined || value === '')) {
      errors.push('Field is required');
    }

    // Format validation
    if (value !== null && value !== undefined && schema.format) {
      const formatErrors = this.validateFormat(value, schema.format, schema.type);
      errors.push(...formatErrors);
    }

    // Enum validation
    if (schema.allowedValues && schema.allowedValues.length > 0) {
      const allowedValues = schema.allowedValues.map(opt => opt.value);
      if (!allowedValues.includes(value)) {
        errors.push(`Value must be one of: ${allowedValues.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get field suggestions based on partial input
   */
  getFieldSuggestions(partial: string, category?: string): FieldSchema[] {
    const schemas = this.getAllFieldSchemas();
    const lowerPartial = partial.toLowerCase();
    
    return Object.values(schemas)
      .filter(schema => {
        const matchesName = schema.name.toLowerCase().includes(lowerPartial);
        const matchesLabel = schema.label.toLowerCase().includes(lowerPartial);
        const matchesCategory = !category || schema.uiConfig?.category === category;
        
        return (matchesName || matchesLabel) && matchesCategory;
      })
      .sort((a, b) => {
        // Prioritize exact matches, then starts with, then contains
        const aExact = a.name.toLowerCase() === lowerPartial;
        const bExact = b.name.toLowerCase() === lowerPartial;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStarts = a.name.toLowerCase().startsWith(lowerPartial);
        const bStarts = b.name.toLowerCase().startsWith(lowerPartial);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return a.label.localeCompare(b.label);
      });
  }

  /**
   * Create field schema from JSON Schema
   */
  createFromJsonSchema(jsonSchema: any): Record<string, FieldSchema> {
    const schemas: Record<string, FieldSchema> = {};
    
    if (jsonSchema.properties) {
      Object.entries(jsonSchema.properties).forEach(([name, prop]: [string, any]) => {
        schemas[name] = this.convertJsonSchemaProperty(name, prop, jsonSchema.required?.includes(name));
      });
    }
    
    return schemas;
  }

  /**
   * Create field schema from form metadata
   */
  createFromFormMetadata(formFields: any[]): Record<string, FieldSchema> {
    const schemas: Record<string, FieldSchema> = {};
    
    formFields.forEach(field => {
      schemas[field.name] = {
        name: field.name,
        label: field.label || field.name,
        type: this.mapFormFieldType(field.type),
        description: field.description,
        required: field.required,
        allowedValues: field.options?.map((opt: any) => ({
          value: opt.value,
          label: opt.label || opt.value
        })),
        format: this.extractFormatFromField(field),
        uiConfig: {
          icon: field.icon,
          category: field.category,
          priority: field.priority
        }
      };
    });
    
    return schemas;
  }

  /**
   * Get context variables
   */
  getContextVariables(): Observable<ContextVariable[]> {
    return this.context$.pipe(
      map(context => context.contextVariables || [])
    );
  }

  /**
   * Get custom functions
   */
  getCustomFunctions(): Observable<CustomFunction[]> {
    return this.context$.pipe(
      map(context => context.customFunctions || [])
    );
  }

  /**
   * Group field schemas by category
   */
  getFieldSchemasByCategory(): Observable<Record<string, FieldSchema[]>> {
    return this.getFieldSchemasArray().pipe(
      map(schemas => {
        const grouped: Record<string, FieldSchema[]> = {};
        
        schemas.forEach(schema => {
          const category = schema.uiConfig?.category || 'Other';
          if (!grouped[category]) {
            grouped[category] = [];
          }
          grouped[category].push(schema);
        });
        
        // Sort within each category
        Object.values(grouped).forEach(categorySchemas => {
          categorySchemas.sort((a, b) => {
            const aPriority = a.uiConfig?.priority || 0;
            const bPriority = b.uiConfig?.priority || 0;
            
            if (aPriority !== bPriority) {
              return bPriority - aPriority; // Higher priority first
            }
            
            return a.label.localeCompare(b.label);
          });
        });
        
        return grouped;
      })
    );
  }

  // Private helper methods

  private isValidType(value: any, type: FieldType): boolean {
    if (value === null || value === undefined) {
      return true; // Let required validation handle this
    }

    switch (type) {
      case FieldType.STRING:
      case FieldType.EMAIL:
      case FieldType.URL:
      case FieldType.PHONE:
      case FieldType.UUID:
        return typeof value === 'string';
      
      case FieldType.NUMBER:
        return typeof value === 'number' && !isNaN(value);
      
      case FieldType.INTEGER:
        return typeof value === 'number' && Number.isInteger(value);
      
      case FieldType.BOOLEAN:
        return typeof value === 'boolean';
      
      case FieldType.DATE:
      case FieldType.DATETIME:
      case FieldType.TIME:
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
      
      case FieldType.ARRAY:
        return Array.isArray(value);
      
      case FieldType.OBJECT:
      case FieldType.JSON:
        return typeof value === 'object' && !Array.isArray(value);
      
      case FieldType.ENUM:
        return true; // Type depends on enum values
      
      default:
        return true;
    }
  }

  private validateFormat(value: any, format: any, type: FieldType): string[] {
    const errors: string[] = [];

    if (format.minimum !== undefined) {
      if (type === FieldType.STRING || type === FieldType.ARRAY) {
        if (value.length < format.minimum) {
          errors.push(`Minimum length is ${format.minimum}`);
        }
      } else if (type === FieldType.NUMBER || type === FieldType.INTEGER) {
        if (value < format.minimum) {
          errors.push(`Minimum value is ${format.minimum}`);
        }
      }
    }

    if (format.maximum !== undefined) {
      if (type === FieldType.STRING || type === FieldType.ARRAY) {
        if (value.length > format.maximum) {
          errors.push(`Maximum length is ${format.maximum}`);
        }
      } else if (type === FieldType.NUMBER || type === FieldType.INTEGER) {
        if (value > format.maximum) {
          errors.push(`Maximum value is ${format.maximum}`);
        }
      }
    }

    if (format.pattern && typeof value === 'string') {
      const regex = new RegExp(format.pattern);
      if (!regex.test(value)) {
        errors.push('Value does not match required pattern');
      }
    }

    return errors;
  }

  private convertJsonSchemaProperty(name: string, prop: any, required: boolean = false): FieldSchema {
    return {
      name,
      label: prop.title || name,
      type: this.mapJsonSchemaType(prop.type, prop.format),
      description: prop.description,
      required,
      allowedValues: prop.enum?.map((value: any) => ({
        value,
        label: value.toString()
      })),
      format: {
        minimum: prop.minimum || prop.minLength,
        maximum: prop.maximum || prop.maxLength,
        pattern: prop.pattern
      }
    };
  }

  private mapJsonSchemaType(type: string, format?: string): FieldType {
    if (format) {
      switch (format) {
        case 'email': return FieldType.EMAIL;
        case 'uri': return FieldType.URL;
        case 'date': return FieldType.DATE;
        case 'date-time': return FieldType.DATETIME;
        case 'time': return FieldType.TIME;
        case 'uuid': return FieldType.UUID;
      }
    }

    switch (type) {
      case 'string': return FieldType.STRING;
      case 'number': return FieldType.NUMBER;
      case 'integer': return FieldType.INTEGER;
      case 'boolean': return FieldType.BOOLEAN;
      case 'array': return FieldType.ARRAY;
      case 'object': return FieldType.OBJECT;
      default: return FieldType.STRING;
    }
  }

  private mapFormFieldType(type: string): FieldType {
    const typeMap: Record<string, FieldType> = {
      'text': FieldType.STRING,
      'email': FieldType.EMAIL,
      'url': FieldType.URL,
      'tel': FieldType.PHONE,
      'number': FieldType.NUMBER,
      'checkbox': FieldType.BOOLEAN,
      'date': FieldType.DATE,
      'datetime-local': FieldType.DATETIME,
      'time': FieldType.TIME,
      'select': FieldType.ENUM,
      'textarea': FieldType.STRING
    };

    return typeMap[type] || FieldType.STRING;
  }

  private extractFormatFromField(field: any): any {
    const format: any = {};

    if (field.minLength !== undefined) format.minimum = field.minLength;
    if (field.maxLength !== undefined) format.maximum = field.maxLength;
    if (field.min !== undefined) format.minimum = field.min;
    if (field.max !== undefined) format.maximum = field.max;
    if (field.pattern) format.pattern = field.pattern;

    return Object.keys(format).length > 0 ? format : undefined;
  }
}

// Helper interfaces
export interface EnhancedFieldSchema extends FieldSchema {
  operators: string[];
  operatorLabels: Record<string, string>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}