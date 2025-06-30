// Types and interfaces for the Visual Formula Builder

export type FormulaType = 
  | 'none' 
  | 'concatenation' 
  | 'arithmetic' 
  | 'nested_property' 
  | 'conditional_mapping' 
  | 'default_value';

export interface FieldSchema {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  path?: string; // For nested properties like 'address.city'
}

export interface FormulaDefinition {
  type: FormulaType;
  params: any;
  _generatedExpression?: string; // Auto-generated safe JS expression
}

// Specific parameter interfaces for each formula type
export interface ConcatenationParams {
  fields: string[];
  separator: string;
  ignoreEmpty: boolean;
}

export interface ArithmeticParams {
  operator: '+' | '-' | '*' | '/';
  operand1: string | number; // Field name or constant
  operand2: string | number; // Field name or constant
}

export interface NestedPropertyParams {
  propertyPath: string;
  fallbackValue?: any;
}

export interface ConditionalMappingParams {
  conditionField: string;
  comparisonValue: any;
  trueValue: any;
  falseValue: any;
  operator?: '===' | '!=' | '>' | '<' | '>=' | '<=';
}

export interface DefaultValueParams {
  originalField: string;
  defaultValue: any;
}

// Union type for all parameter types
export type FormulaParams = 
  | ConcatenationParams 
  | ArithmeticParams 
  | NestedPropertyParams 
  | ConditionalMappingParams 
  | DefaultValueParams;

// Formula template definitions
export interface FormulaTemplate {
  type: FormulaType;
  label: string;
  description: string;
  icon: string;
  parameterSchema: FormulaParameterSchema[];
}

export interface FormulaParameterSchema {
  key: string;
  label: string;
  type: 'field' | 'text' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: { value: any; label: string }[];
  placeholder?: string;
  hint?: string;
}

// Default formula templates
export const FORMULA_TEMPLATES: FormulaTemplate[] = [
  {
    type: 'none',
    label: 'Campo Direto',
    description: 'Usar valor direto de um campo sem transformação',
    icon: 'data_object',
    parameterSchema: []
  },
  {
    type: 'concatenation',
    label: 'Concatenação de Campos',
    description: 'Combinar múltiplos campos com um separador',
    icon: 'merge',
    parameterSchema: [
      {
        key: 'fields',
        label: 'Campos para concatenar',
        type: 'field',
        required: true,
        hint: 'Selecione os campos que deseja unir'
      },
      {
        key: 'separator',
        label: 'Separador',
        type: 'text',
        required: false,
        placeholder: ' ',
        hint: 'Texto usado para separar os campos'
      },
      {
        key: 'ignoreEmpty',
        label: 'Ignorar campos vazios',
        type: 'boolean',
        required: false,
        hint: 'Não incluir campos vazios na concatenação'
      }
    ]
  },
  {
    type: 'arithmetic',
    label: 'Cálculo Numérico',
    description: 'Realizar operações matemáticas simples',
    icon: 'calculate',
    parameterSchema: [
      {
        key: 'operand1',
        label: 'Primeiro operando',
        type: 'field',
        required: true,
        hint: 'Campo numérico ou valor constante'
      },
      {
        key: 'operator',
        label: 'Operação',
        type: 'select',
        required: true,
        options: [
          { value: '+', label: 'Adição (+)' },
          { value: '-', label: 'Subtração (-)' },
          { value: '*', label: 'Multiplicação (×)' },
          { value: '/', label: 'Divisão (÷)' }
        ]
      },
      {
        key: 'operand2',
        label: 'Segundo operando',
        type: 'field',
        required: true,
        hint: 'Campo numérico ou valor constante'
      }
    ]
  },
  {
    type: 'nested_property',
    label: 'Propriedade Aninhada',
    description: 'Acessar propriedades de objetos aninhados',
    icon: 'account_tree',
    parameterSchema: [
      {
        key: 'propertyPath',
        label: 'Caminho da propriedade',
        type: 'text',
        required: true,
        placeholder: 'ex: address.city',
        hint: 'Use ponto (.) para navegar em objetos aninhados'
      },
      {
        key: 'fallbackValue',
        label: 'Valor padrão',
        type: 'text',
        required: false,
        placeholder: 'N/A',
        hint: 'Valor retornado se a propriedade não existir'
      }
    ]
  },
  {
    type: 'conditional_mapping',
    label: 'Mapeamento Condicional',
    description: 'Retornar diferentes valores baseado em uma condição',
    icon: 'swap_horizontal_circle',
    parameterSchema: [
      {
        key: 'conditionField',
        label: 'Campo de condição',
        type: 'field',
        required: true,
        hint: 'Campo usado para comparação'
      },
      {
        key: 'operator',
        label: 'Operador',
        type: 'select',
        required: true,
        options: [
          { value: '===', label: 'Igual a (===)' },
          { value: '!=', label: 'Diferente de (!=)' },
          { value: '>', label: 'Maior que (>)' },
          { value: '<', label: 'Menor que (<)' },
          { value: '>=', label: 'Maior ou igual (>=)' },
          { value: '<=', label: 'Menor ou igual (<=)' }
        ]
      },
      {
        key: 'comparisonValue',
        label: 'Valor de comparação',
        type: 'text',
        required: true,
        hint: 'Valor para comparar com o campo'
      },
      {
        key: 'trueValue',
        label: 'Valor se verdadeiro',
        type: 'text',
        required: true,
        hint: 'Valor retornado quando a condição é verdadeira'
      },
      {
        key: 'falseValue',
        label: 'Valor se falso',
        type: 'text',
        required: true,
        hint: 'Valor retornado quando a condição é falsa'
      }
    ]
  },
  {
    type: 'default_value',
    label: 'Valor Padrão se Vazio',
    description: 'Usar um valor padrão quando o campo estiver vazio',
    icon: 'rule',
    parameterSchema: [
      {
        key: 'originalField',
        label: 'Campo original',
        type: 'field',
        required: true,
        hint: 'Campo principal a ser verificado'
      },
      {
        key: 'defaultValue',
        label: 'Valor padrão',
        type: 'text',
        required: true,
        placeholder: 'N/A',
        hint: 'Valor usado quando o campo estiver vazio'
      }
    ]
  }
];