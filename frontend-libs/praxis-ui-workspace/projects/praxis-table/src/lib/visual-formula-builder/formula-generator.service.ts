import { Injectable } from '@angular/core';
import { 
  FormulaDefinition, 
  FormulaType, 
  ConcatenationParams, 
  ArithmeticParams, 
  NestedPropertyParams, 
  ConditionalMappingParams, 
  DefaultValueParams 
} from './formula-types';

@Injectable({
  providedIn: 'root'
})
export class FormulaGeneratorService {

  /**
   * Generates a safe JavaScript expression from a formula definition
   */
  generateExpression(formula: FormulaDefinition): string {
    switch (formula.type) {
      case 'none':
        return '';
      case 'concatenation':
        return this.generateConcatenationExpression(formula.params as ConcatenationParams);
      case 'arithmetic':
        return this.generateArithmeticExpression(formula.params as ArithmeticParams);
      case 'nested_property':
        return this.generateNestedPropertyExpression(formula.params as NestedPropertyParams);
      case 'conditional_mapping':
        return this.generateConditionalMappingExpression(formula.params as ConditionalMappingParams);
      case 'default_value':
        return this.generateDefaultValueExpression(formula.params as DefaultValueParams);
      default:
        return '';
    }
  }

  /**
   * Validates a formula definition
   */
  validateFormula(formula: FormulaDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formula.type || formula.type === 'none') {
      return { valid: true, errors: [] };
    }

    switch (formula.type) {
      case 'concatenation':
        return this.validateConcatenationParams(formula.params as ConcatenationParams);
      case 'arithmetic':
        return this.validateArithmeticParams(formula.params as ArithmeticParams);
      case 'nested_property':
        return this.validateNestedPropertyParams(formula.params as NestedPropertyParams);
      case 'conditional_mapping':
        return this.validateConditionalMappingParams(formula.params as ConditionalMappingParams);
      case 'default_value':
        return this.validateDefaultValueParams(formula.params as DefaultValueParams);
      default:
        errors.push('Tipo de fórmula não reconhecido');
    }

    return { valid: errors.length === 0, errors };
  }

  // Private expression generators
  private generateConcatenationExpression(params: ConcatenationParams): string {
    if (!params.fields || params.fields.length === 0) {
      return '';
    }

    const separator = this.sanitizeStringValue(params.separator || ' ');
    const fieldExpressions = params.fields.map(field => 
      `(rowData.${this.sanitizeFieldName(field)} || '')`
    );
    
    if (params.ignoreEmpty) {
      // Filter out empty values (null, undefined, empty string, whitespace-only)
      return `[${fieldExpressions.join(', ')}].filter(v => v && String(v).trim() !== '').join('${separator}')`;
    } else {
      // Include empty values but convert them to empty strings (preserves field positions)
      // However, use smart joining to avoid unwanted separators
      return `[${fieldExpressions.join(', ')}].map(v => v || '').filter(v => v !== '').join('${separator}')`;
    }
  }

  private generateArithmeticExpression(params: ArithmeticParams): string {
    const operand1 = this.parseOperand(params.operand1);
    const operand2 = this.parseOperand(params.operand2);
    const operator = this.sanitizeOperator(params.operator);

    return `(${operand1} ${operator} ${operand2})`;
  }

  private generateNestedPropertyExpression(params: NestedPropertyParams): string {
    const safePath = this.generateSafePropertyPath(params.propertyPath);
    const fallback = params.fallbackValue !== undefined 
      ? this.sanitizeStringValue(params.fallbackValue) 
      : 'null';

    return `(${safePath} ?? '${fallback}')`;
  }

  private generateConditionalMappingExpression(params: ConditionalMappingParams): string {
    const fieldAccess = `rowData.${this.sanitizeFieldName(params.conditionField)}`;
    const operator = this.sanitizeOperator(params.operator || '===');
    const comparisonValue = this.sanitizeValue(params.comparisonValue);
    const trueValueFormatted = this.sanitizeValue(params.trueValue);
    const falseValueFormatted = this.sanitizeValue(params.falseValue);

    return `(${fieldAccess} ${operator} ${comparisonValue} ? ${trueValueFormatted} : ${falseValueFormatted})`;
  }

  private generateDefaultValueExpression(params: DefaultValueParams): string {
    const fieldAccess = `rowData.${this.sanitizeFieldName(params.originalField)}`;
    const defaultValueFormatted = this.sanitizeValue(params.defaultValue);

    return `(${fieldAccess} || ${defaultValueFormatted})`;
  }

  // Private validation methods
  private validateConcatenationParams(params: ConcatenationParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.fields || params.fields.length === 0) {
      errors.push('Pelo menos um campo deve ser selecionado para concatenação');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateArithmeticParams(params: ArithmeticParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.operand1) {
      errors.push('Primeiro operando é obrigatório');
    }
    
    if (!params.operand2) {
      errors.push('Segundo operando é obrigatório');
    }
    
    if (!params.operator) {
      errors.push('Operador é obrigatório');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateNestedPropertyParams(params: NestedPropertyParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.propertyPath) {
      errors.push('Caminho da propriedade é obrigatório');
    } else if (!this.isValidPropertyPath(params.propertyPath)) {
      errors.push('Caminho da propriedade inválido');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateConditionalMappingParams(params: ConditionalMappingParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.conditionField) {
      errors.push('Campo de condição é obrigatório');
    }
    
    if (params.comparisonValue === undefined || params.comparisonValue === '') {
      errors.push('Valor de comparação é obrigatório');
    }
    
    if (!params.trueValue) {
      errors.push('Valor se verdadeiro é obrigatório');
    }
    
    if (!params.falseValue) {
      errors.push('Valor se falso é obrigatório');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateDefaultValueParams(params: DefaultValueParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!params.originalField) {
      errors.push('Campo original é obrigatório');
    }
    
    if (!params.defaultValue) {
      errors.push('Valor padrão é obrigatório');
    }

    return { valid: errors.length === 0, errors };
  }

  // Utility methods for safe expression generation
  private sanitizeFieldName(fieldName: string): string {
    // Only allow alphanumeric characters, underscores, and dots
    return fieldName.replace(/[^a-zA-Z0-9_.]/g, '');
  }

  private sanitizeStringValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    // Escape single quotes and backslashes
    return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  private sanitizeValue(value: any): string {
    if (typeof value === 'string') {
      return `'${this.sanitizeStringValue(value)}'`;
    } else if (typeof value === 'number') {
      return String(value);
    } else if (typeof value === 'boolean') {
      return String(value);
    } else {
      return `'${this.sanitizeStringValue(value)}'`;
    }
  }

  private sanitizeOperator(operator: string): string {
    const allowedOperators = ['+', '-', '*', '/', '===', '!=', '>', '<', '>=', '<='];
    return allowedOperators.includes(operator) ? operator : '===';
  }

  private parseOperand(operand: string | number): string {
    if (typeof operand === 'number') {
      return String(operand);
    } else if (typeof operand === 'string') {
      // Check if it's a number string
      const numValue = parseFloat(operand);
      if (!isNaN(numValue) && isFinite(numValue)) {
        return String(numValue);
      } else {
        // Treat as field name
        return `(rowData.${this.sanitizeFieldName(operand)} || 0)`;
      }
    }
    return '0';
  }

  private generateSafePropertyPath(path: string): string {
    const sanitizedPath = this.sanitizeFieldName(path);
    const parts = sanitizedPath.split('.');
    
    if (parts.length === 1) {
      return `rowData.${parts[0]}`;
    }
    
    // Generate safe optional chaining
    let safePath = 'rowData';
    for (const part of parts) {
      safePath += `?.${part}`;
    }
    
    return safePath;
  }

  private isValidPropertyPath(path: string): boolean {
    // Basic validation for property path
    return /^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(path);
  }

  /**
   * Get a sample data object for testing formulas
   */
  getSampleData(): any {
    return {
      id: 1,
      firstName: 'João',
      lastName: 'Silva',
      email: 'joao.silva@example.com',
      age: 30,
      salary: 5000,
      status: 'active',
      address: {
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      isActive: true,
      lastLogin: new Date().toISOString(),
      tags: ['employee', 'developer']
    };
  }

  /**
   * Test a formula with sample data
   */
  testFormula(formula: FormulaDefinition, sampleData?: any): { success: boolean; result?: any; error?: string } {
    try {
      const expression = this.generateExpression(formula);
      if (!expression) {
        return { success: true, result: null };
      }

      const testData = sampleData || this.getSampleData();
      const testFunction = new Function('rowData', `return ${expression}`);
      const result = testFunction(testData);

      return { success: true, result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
}