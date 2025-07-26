import { Injectable } from '@angular/core';
import { ColumnDefinition, TableConfig } from '@praxis/core';

// Type alias for column data types
export type ColumnDataType = 'string' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage' | 'custom';
import { ConditionalStyle } from './table-rule-engine.service';
import { FieldSchema } from '../visual-formula-builder/formula-types';

// Extended column definition with conditional styles
export interface ExtendedColumnDefinition extends ColumnDefinition {
  conditionalStyles?: ConditionalStyle[];
}

export interface FieldRelationship {
  sourceField: string;
  targetField: string;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'calculated';
  description?: string;
}

export interface TableContext {
  tableName?: string;
  apiEndpoint?: string;
  totalColumns: number;
  visibleColumns: number;
  calculatedColumns: number;
  hasActions: boolean;
  hasPagination: boolean;
  hasSorting: boolean;
  hasFiltering: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FieldSchemaAdapter {

  /**
   * Converts TableConfig to FieldSchema array compatible with visual builder
   */
  adaptTableConfigToFieldSchema(config: TableConfig): FieldSchema[] {
    const fieldSchemas: FieldSchema[] = [];

    // Convert each column definition to field schema
    config.columns.forEach(column => {
      const fieldSchema = this.convertColumnToFieldSchema(column);
      fieldSchemas.push(fieldSchema);
    });

    // Add context variables for advanced rules
    const contextSchemas = this.generateContextFieldSchemas(config);
    fieldSchemas.push(...contextSchemas);

    return fieldSchemas;
  }

  /**
   * Converts individual column to field schema
   */
  private convertColumnToFieldSchema(column: ColumnDefinition): FieldSchema {
    return {
      name: column.field,
      label: column.header || column.field,
      type: this.mapColumnTypeToFieldType(column.type),
      path: column.field
    };
  }

  /**
   * Maps column data types to field types compatible with visual builder
   */
  private mapColumnTypeToFieldType(columnType?: ColumnDataType): 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' {
    const typeMapping: Record<ColumnDataType, 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'> = {
      'string': 'string',
      'number': 'number',
      'date': 'date',
      'boolean': 'boolean',
      'currency': 'number', // Treat currency as number for rule logic
      'percentage': 'number', // Treat percentage as number for rule logic
      'custom': 'object'
    };

    return columnType ? typeMapping[columnType] : 'string';
  }

  /**
   * Generates context field schemas for advanced rule capabilities
   */
  private generateContextFieldSchemas(config: TableConfig): FieldSchema[] {
    const contextSchemas: FieldSchema[] = [];

    // Row context variables
    contextSchemas.push({
      name: '_rowIndex',
      label: 'Índice da Linha',
      type: 'number' as const
    });

    contextSchemas.push({
      name: '_columnIndex',
      label: 'Índice da Coluna',
      type: 'number' as const
    });

    contextSchemas.push({
      name: '_cellValue',
      label: 'Valor da Célula',
      type: 'object' as const
    });

    // Temporal context
    contextSchemas.push({
      name: '_now',
      label: 'Data/Hora Atual',
      type: 'date' as const
    });

    contextSchemas.push({
      name: '_today',
      label: 'Data Atual',
      type: 'date' as const
    });

    // Table context
    if (config.behavior?.pagination?.enabled) {
      contextSchemas.push({
        name: '_pageIndex',
        label: 'Página Atual',
        type: 'number' as const
      });

      contextSchemas.push({
        name: '_pageSize',
        label: 'Tamanho da Página',
        type: 'number' as const
      });
    }

    // User context (would be provided by the application)
    contextSchemas.push({
      name: '_user',
      label: 'Usuário Atual',
      type: 'object' as const
    });

    return contextSchemas;
  }

  /**
   * Generates field validation rules based on column configuration
   */
  private generateFieldValidation(column: ColumnDefinition): any {
    const validation: any = {};

    // Type-specific validations
    switch (column.type) {
      case 'string':
        if (column.format) {
          validation.pattern = this.getStringValidationPattern(column.format);
        }
        break;

      case 'number':
      case 'currency':
      case 'percentage':
        validation.type = 'number';
        if (column.format) {
          const numberRules = this.getNumberValidationRules(column.format);
          Object.assign(validation, numberRules);
        }
        break;

      case 'date':
        validation.type = 'date';
        break;

      case 'boolean':
        validation.type = 'boolean';
        break;
    }

    // Value mapping validation
    if (column.valueMapping && Object.keys(column.valueMapping).length > 0) {
      validation.allowedValues = Object.keys(column.valueMapping);
    }

    return validation;
  }

  /**
   * Generates field options for visual builder
   */
  private generateFieldOptions(column: ColumnDefinition): any[] {
    const options: any[] = [];

    // If column has value mapping, provide as options
    if (column.valueMapping && Object.keys(column.valueMapping).length > 0) {
      Object.entries(column.valueMapping).forEach(([key, value]) => {
        options.push({
          value: key,
          label: value,
          type: this.inferValueType(key)
        });
      });
    }

    // For boolean columns, provide true/false options
    if (column.type === 'boolean') {
      options.push(
        { value: true, label: 'Verdadeiro', type: 'boolean' },
        { value: false, label: 'Falso', type: 'boolean' }
      );
    }

    return options;
  }

  /**
   * Detects field relationships for advanced rule building
   */
  detectFieldRelationships(columns: ColumnDefinition[]): FieldRelationship[] {
    const relationships: FieldRelationship[] = [];

    columns.forEach(column => {
      // Check for ID relationships (e.g., customer_id -> customer_name)
      if (column.field.endsWith('_id') || column.field.endsWith('Id')) {
        const baseField = column.field.replace(/_id$|Id$/, '');
        const relatedFields = columns.filter(c => 
          c.field.startsWith(baseField) && c.field !== column.field
        );

        relatedFields.forEach(relatedField => {
          relationships.push({
            sourceField: column.field,
            targetField: relatedField.field,
            relationshipType: 'one-to-one',
            description: `${column.field} relaciona com ${relatedField.field}`
          });
        });
      }

      // Check for calculated columns
      if (column._generatedValueGetter) {
        const referencedFields = this.extractFieldReferences(column._generatedValueGetter);
        referencedFields.forEach(referencedField => {
          relationships.push({
            sourceField: referencedField,
            targetField: column.field,
            relationshipType: 'calculated',
            description: `${column.field} é calculado usando ${referencedField}`
          });
        });
      }
    });

    return relationships;
  }

  /**
   * Generates table context information
   */
  generateTableContext(config: TableConfig): TableContext {
    return {
      totalColumns: config.columns.length,
      visibleColumns: config.columns.filter(c => c.visible !== false).length,
      calculatedColumns: config.columns.filter(c => c._generatedValueGetter).length,
      hasActions: config.actions?.row?.enabled || config.actions?.bulk?.enabled || false,
      hasPagination: !!config.behavior?.pagination?.enabled,
      hasSorting: config.behavior?.sorting?.enabled || false,
      hasFiltering: config.behavior?.filtering?.enabled || false
    };
  }

  /**
   * Converts visual builder rules back to table column configuration
   */
  adaptRulesToColumnConfig(rules: any[], column: ColumnDefinition): ColumnDefinition {
    // This method would convert visual builder rules back to column configuration
    // Implementation depends on the specific rule format from visual builder
    
    const updatedColumn = { ...column };

    const extendedColumn = updatedColumn as any;

    // Process conditional styling rules
    if (rules.some(rule => rule.type === 'conditional-style')) {
      extendedColumn.conditionalStyles = rules
        .filter(rule => rule.type === 'conditional-style')
        .map(rule => ({
          id: rule.id,
          name: rule.name,
          condition: rule.condition,
          styles: rule.styles,
          priority: rule.priority || 1,
          enabled: rule.enabled !== false,
          createdAt: rule.createdAt || new Date(),
          modifiedAt: new Date()
        }));
    }

    // Process value mapping rules
    if (rules.some(rule => rule.type === 'value-mapping')) {
      const mappingRules = rules.filter(rule => rule.type === 'value-mapping');
      extendedColumn.advancedValueMapping = {
        id: `mapping_${column.field}`,
        name: `Mapeamento para ${column.field}`,
        rules: mappingRules,
        defaultValue: undefined,
        cacheEnabled: false,
        fallbackToOriginal: true
      };
    }

    return updatedColumn;
  }

  /**
   * Validates field schema compatibility
   */
  validateFieldSchemaCompatibility(fieldSchemas: FieldSchema[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    // Check for duplicate field names
    const fieldNames = fieldSchemas.map(f => f.name);
    const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    
    if (duplicates.length > 0) {
      result.errors.push(`Campos duplicados encontrados: ${duplicates.join(', ')}`);
      result.isValid = false;
    }

    // Check for unsupported types
    const supportedTypes = ['string', 'number', 'date', 'boolean', 'any', 'object', 'array'];
    const unsupportedFields = fieldSchemas.filter(f => !supportedTypes.includes(f.type));
    
    if (unsupportedFields.length > 0) {
      result.warnings.push(`Tipos não suportados: ${unsupportedFields.map(f => `${f.name}:${f.type}`).join(', ')}`);
    }

    // Provide recommendations - simplified without metadata access
    result.recommendations.push(`${fieldSchemas.length} campo(s) disponível(is) para regras avançadas`);

    return result;
  }

  // Utility methods
  private getStringValidationPattern(format: string): string {
    const patterns: Record<string, string> = {
      'email': '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      'phone': '^[\\+]?[1-9]?[0-9]{7,15}$',
      'url': '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$',
      'cpf': '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
      'cnpj': '^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$'
    };
    
    return patterns[format] || '';
  }

  private getNumberValidationRules(format: string): any {
    const rules: any = {};
    
    if (format.includes('min:')) {
      const min = parseFloat(format.match(/min:(\d+\.?\d*)/)?.[1] || '0');
      rules.minimum = min;
    }
    
    if (format.includes('max:')) {
      const max = parseFloat(format.match(/max:(\d+\.?\d*)/)?.[1] || '0');
      rules.maximum = max;
    }
    
    if (format.includes('decimals:')) {
      const decimals = parseInt(format.match(/decimals:(\d+)/)?.[1] || '0');
      rules.multipleOf = 1 / Math.pow(10, decimals);
    }
    
    return rules;
  }

  private inferValueType(value: any): string {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value === 'true' || value === 'false') return 'boolean';
    if (!isNaN(parseFloat(value))) return 'number';
    return 'string';
  }

  private extractFieldReferences(expression: string): string[] {
    const fieldPattern = /rowData\.(\w+(?:\.\w+)*)/g;
    const references: string[] = [];
    let match;
    
    while ((match = fieldPattern.exec(expression)) !== null) {
      references.push(match[1]);
    }
    
    return [...new Set(references)]; // Remove duplicates
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}