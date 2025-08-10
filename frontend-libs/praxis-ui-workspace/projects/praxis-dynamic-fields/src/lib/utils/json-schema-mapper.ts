/**
 * @fileoverview Utilitários para mapear JSON Schema para FieldMetadata
 *
 * Converte estruturas JSON Schema/OpenAPI com extensões x-ui
 * para o formato FieldMetadata esperado pelos componentes dinâmicos.
 *
 * Lida com campos que não possuem controlType definido,
 * inferindo tipos apropriados baseado no schema JSON.
 */

import { FieldMetadata } from '@praxis/core';

/**
 * Interface para propriedades JSON Schema básicas
 */
export interface JsonSchemaProperty {
  type?: string;
  format?: string;
  'x-ui'?: {
    controlType?: string;
    label?: string;
    required?: boolean;
    [key: string]: any;
  };
  $ref?: string;
  properties?: { [key: string]: JsonSchemaProperty };
  items?: JsonSchemaProperty;
  enum?: any[];
  [key: string]: any;
}

/**
 * Interface para schema completo com required fields
 */
export interface JsonSchema {
  type: string;
  properties: { [key: string]: JsonSchemaProperty };
  required?: string[];
  [key: string]: any;
}

/**
 * Mapeia um JSON Schema completo para array de FieldMetadata
 *
 * @param schema - Schema JSON completo
 * @returns Array de FieldMetadata prontos para renderização
 *
 * @example
 * ```typescript
 * const schema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string', 'x-ui': { controlType: 'input', label: 'Nome' } },
 *     age: { type: 'integer' }, // Sem x-ui, será inferido
 *     email: { type: 'string', format: 'email' } // Será inferido como email
 *   },
 *   required: ['name']
 * };
 *
 * const fields = mapJsonSchemaToFields(schema);
 * ```
 */
export function mapJsonSchemaToFields(schema: JsonSchema): FieldMetadata[] {
  const fields: FieldMetadata[] = [];

  if (!schema.properties) {
    console.warn('[JsonSchemaMapper] Schema não possui propriedades definidas');
    return fields;
  }

  Object.entries(schema.properties).forEach(([fieldName, property]) => {
    try {
      const fieldMetadata = mapPropertyToFieldMetadata(
        fieldName,
        property,
        schema.required || [],
      );
      if (fieldMetadata) {
        fields.push(fieldMetadata);
      }
    } catch (error) {
      console.error(
        `[JsonSchemaMapper] Erro ao mapear campo '${fieldName}':`,
        error,
      );
    }
  });

  return fields;
}

/**
 * Mapeia uma propriedade individual para FieldMetadata
 *
 * @param fieldName - Nome do campo
 * @param property - Propriedade do schema
 * @param requiredFields - Lista de campos obrigatórios
 * @returns FieldMetadata ou null se não puder ser mapeado
 */
export function mapPropertyToFieldMetadata(
  fieldName: string,
  property: JsonSchemaProperty,
  requiredFields: string[] = [],
): FieldMetadata | null {
  // Pular campos que são referências complexas sem x-ui ou com x-ui null
  if (property.$ref && (!property['x-ui'] || property['x-ui'] === null)) {
    console.debug(
      `[JsonSchemaMapper] Pulando campo '${fieldName}' - referência complexa sem x-ui`,
    );
    return null;
  }

  // Pular campos do tipo object sem x-ui ou com x-ui null (estruturas aninhadas)
  if (
    property.type === 'object' &&
    (!property['x-ui'] || property['x-ui'] === null)
  ) {
    console.debug(
      `[JsonSchemaMapper] Pulando campo '${fieldName}' - objeto aninhado sem x-ui`,
    );
    return null;
  }

  // Pular campos do tipo array sem x-ui ou com x-ui null
  if (
    property.type === 'array' &&
    (!property['x-ui'] || property['x-ui'] === null)
  ) {
    console.debug(
      `[JsonSchemaMapper] Pulando campo '${fieldName}' - array sem x-ui`,
    );
    return null;
  }

  // Extrair informações do x-ui se disponível
  const uiConfig = property['x-ui'] || {};

  // Determinar controlType (prioridade: x-ui.controlType -> inferir do schema)
  const controlType =
    uiConfig.controlType || inferControlTypeFromSchema(property);

  if (!controlType) {
    console.warn(
      `[JsonSchemaMapper] Não foi possível determinar controlType para '${fieldName}'`,
    );
    return null;
  }

  // Construir FieldMetadata
  const fieldMetadata: FieldMetadata = {
    name: fieldName,
    controlType: controlType,
    label: uiConfig.label || generateLabelFromFieldName(fieldName),
    required: requiredFields.includes(fieldName) || uiConfig.required || false,
    disabled: uiConfig.disabled || false,
    readonly: uiConfig.readonly || false,
    placeholder: uiConfig.placeholder,
    hint: uiConfig.hint || uiConfig.description,

    // Propriedades específicas baseadas no tipo
    ...extractTypeSpecificProperties(property, uiConfig),
  };

  if (controlType === 'multiSelectTree') {
    const nodes = uiConfig.nodes ?? uiConfig.options;
    if (nodes) {
      (fieldMetadata as any).nodes = nodes;
    }
    delete (fieldMetadata as any).options;
  }

  return fieldMetadata;
}

/**
 * Infere controlType baseado no schema JSON quando x-ui não está disponível
 *
 * @param property - Propriedade do schema
 * @returns controlType inferido ou null
 */
function inferControlTypeFromSchema(
  property: JsonSchemaProperty,
): string | null {
  // Inferir baseado no tipo e formato
  switch (property.type) {
    case 'string':
      if (property.format === 'email') return 'email';
      if (property.format === 'date') return 'date';
      if (property.format === 'date-time') return 'date';
      if (property.format === 'time') return 'time';
      if (property.format === 'password') return 'password';
      if (property.enum && property.enum.length > 0) return 'select';
      if (property.maxLength && property.maxLength > 255) return 'textarea';
      return 'input';

    case 'integer':
    case 'number':
      if (property.format === 'currency') return 'currency';
      return 'numericTextBox';

    case 'boolean':
      return 'checkbox';

    case 'array':
      if (property.items && property.items.enum) return 'multiSelect';
      return 'textarea'; // Fallback para arrays como JSON

    default:
      console.debug(
        `[JsonSchemaMapper] Tipo '${property.type}' não reconhecido, usando input como fallback`,
      );
      return 'input';
  }
}

/**
 * Extrai propriedades específicas do tipo baseado no schema e x-ui
 *
 * @param property - Propriedade do schema
 * @param uiConfig - Configuração x-ui
 * @returns Objeto com propriedades específicas
 */
function extractTypeSpecificProperties(
  property: JsonSchemaProperty,
  uiConfig: any,
): any {
  const specificProps: any = {};

  // Propriedades de validação
  if (property.minLength !== undefined)
    specificProps.minLength = property.minLength;
  if (property.maxLength !== undefined)
    specificProps.maxLength = property.maxLength;
  if (property.minimum !== undefined) specificProps.min = property.minimum;
  if (property.maximum !== undefined) specificProps.max = property.maximum;
  if (property.pattern) specificProps.pattern = property.pattern;

  // Opções para select/radio
  if (property.enum) {
    specificProps.options = property.enum.map((value: any) => ({
      value,
      label: uiConfig.enumLabels?.[value] || String(value),
    }));
  }

  if (uiConfig.options) specificProps.options = uiConfig.options;
  if (uiConfig.nodes) specificProps.nodes = uiConfig.nodes;

  // Propriedades específicas do Material Design
  if (uiConfig.appearance) specificProps.appearance = uiConfig.appearance;
  if (uiConfig.floatLabel) specificProps.floatLabel = uiConfig.floatLabel;
  if (uiConfig.color) specificProps.color = uiConfig.color;

  return specificProps;
}

/**
 * Gera um label legível a partir do nome do campo
 *
 * @param fieldName - Nome do campo (ex: 'nomeCompleto', 'data_nascimento')
 * @returns Label formatado (ex: 'Nome Completo', 'Data Nascimento')
 */
function generateLabelFromFieldName(fieldName: string): string {
  return (
    fieldName
      // Separar camelCase e snake_case
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      // Capitalizar primeira letra de cada palavra
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  );
}

/**
 * Valida se um schema tem a estrutura mínima necessária
 *
 * @param schema - Schema a ser validado
 * @returns true se válido, false caso contrário
 */
export function isValidJsonSchema(schema: any): schema is JsonSchema {
  if (!schema || typeof schema !== 'object') {
    return false;
  }

  if (schema.type !== 'object') {
    console.warn('[JsonSchemaMapper] Schema deve ter type: "object"');
    return false;
  }

  if (!schema.properties || typeof schema.properties !== 'object') {
    console.warn('[JsonSchemaMapper] Schema deve ter propriedades definidas');
    return false;
  }

  return true;
}

/**
 * Função de conveniência para processar metadata JSON mista
 *
 * Aceita tanto arrays de FieldMetadata quanto JSON Schema,
 * normalizando tudo para FieldMetadata[]
 *
 * @param input - Array de FieldMetadata ou JsonSchema
 * @returns Array normalizado de FieldMetadata
 */
export function normalizeFormMetadata(
  input: FieldMetadata[] | JsonSchema,
): FieldMetadata[] {
  // Se já é array de FieldMetadata, retornar como está
  if (Array.isArray(input)) {
    return input;
  }

  // Se é JSON Schema, converter
  if (isValidJsonSchema(input)) {
    return mapJsonSchemaToFields(input);
  }

  console.error(
    '[JsonSchemaMapper] Input não é nem FieldMetadata[] nem JsonSchema válido:',
    input,
  );
  return [];
}
