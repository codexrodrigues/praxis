// Types and interfaces for the Data Formatter component

export type ColumnDataType = 
  | 'date' 
  | 'number' 
  | 'currency' 
  | 'percentage' 
  | 'string' 
  | 'boolean'
  | 'custom';

// Base interface for all formatter options
export interface FormatterConfig {
  type: ColumnDataType;
  options: any;
}

// Date formatting options
export interface DateFormatterOptions {
  preset?: string; // 'short' | 'medium' | 'long' | 'full' | 'shortDate' | 'mediumDate' | 'longDate' | 'fullDate' | 'shortTime' | 'mediumTime' | 'longTime' | 'fullTime' | 'short' | 'custom'
  customFormat?: string; // For custom Angular DatePipe patterns like 'dd/MM/yyyy HH:mm:ss'
}

// Number formatting options
export interface NumberFormatterOptions {
  decimalPlaces?: 'fixed' | 'variable'; // Fixed or variable decimal places
  fixedDecimals?: number; // 0, 1, 2, 3, etc.
  minDecimals?: number; // For variable: minimum decimals
  maxDecimals?: number; // For variable: maximum decimals
  thousandsSeparator?: boolean; // Show thousands separator
  signDisplay?: 'auto' | 'always' | 'never' | 'exceptZero'; // Sign display preference
}

// Currency formatting options
export interface CurrencyFormatterOptions {
  currencyCode?: string; // 'BRL', 'USD', 'EUR', etc.
  currencySymbol?: string; // 'R$', '$', '€', etc.
  symbolPosition?: 'before' | 'after'; // Symbol position
  symbolSpacing?: boolean; // Space between symbol and value
  decimalPlaces?: number; // Number of decimal places
  thousandsSeparator?: boolean; // Show thousands separator
}

// Percentage formatting options
export interface PercentageFormatterOptions {
  decimalPlaces?: number; // Number of decimal places
  showSymbol?: boolean; // Display % symbol
  multiplier?: boolean; // Multiply by 100 (true for 0.1234 -> 12.34%, false for 12.34 -> 12.34%)
}

// String formatting options
export interface StringFormatterOptions {
  transform?: 'none' | 'uppercase' | 'lowercase' | 'titlecase' | 'capitalize';
  truncate?: boolean; // Enable text truncation
  maxLength?: number; // Maximum text length
  truncateSuffix?: string; // Suffix for truncated text (e.g., '...')
}

// Boolean formatting options
export interface BooleanFormatterOptions {
  display?: 'true-false' | 'yes-no' | 'active-inactive' | 'on-off' | 'enabled-disabled' | 'custom';
  trueValue?: string; // Custom true display text
  falseValue?: string; // Custom false display text
}

// Predefined format presets for common use cases
export interface FormatPreset {
  label: string;
  description: string;
  value: string; // The format string that will be stored
  example: string; // Example of formatted output
}

// Date format presets
export const DATE_PRESETS: FormatPreset[] = [
  {
    label: 'Data Curta',
    description: 'Formato curto (01/01/2023)',
    value: 'shortDate',
    example: '01/12/2023'
  },
  {
    label: 'Data Média',
    description: 'Formato médio (01 Jan 2023)',
    value: 'mediumDate',
    example: '01 dez 2023'
  },
  {
    label: 'Data Completa',
    description: 'Formato completo (01 de Janeiro de 2023)',
    value: 'longDate',
    example: '01 de dezembro de 2023'
  },
  {
    label: 'Data Extensa',
    description: 'Formato extenso com dia da semana',
    value: 'fullDate',
    example: 'sexta-feira, 01 de dezembro de 2023'
  },
  {
    label: 'Apenas Mês/Ano',
    description: 'Apenas mês e ano (Dez/2023)',
    value: 'MMM/yyyy',
    example: 'dez/2023'
  },
  {
    label: 'Hora Curta',
    description: 'Apenas hora (14:30)',
    value: 'shortTime',
    example: '14:30'
  },
  {
    label: 'Data e Hora',
    description: 'Data e hora completas',
    value: 'short',
    example: '01/12/2023 14:30'
  },
  {
    label: 'ISO 8601',
    description: 'Formato internacional',
    value: 'yyyy-MM-dd',
    example: '2023-12-01'
  }
];

// Number format presets
export const NUMBER_PRESETS: FormatPreset[] = [
  {
    label: 'Número Inteiro',
    description: 'Sem casas decimais',
    value: '1.0-0',
    example: '1.234'
  },
  {
    label: '1 Casa Decimal',
    description: 'Uma casa decimal fixa',
    value: '1.1-1',
    example: '1.234,5'
  },
  {
    label: '2 Casas Decimais',
    description: 'Duas casas decimais fixas',
    value: '1.2-2',
    example: '1.234,56'
  },
  {
    label: 'Até 3 Decimais',
    description: 'Até três casas decimais variáveis',
    value: '1.0-3',
    example: '1.234,567'
  },
  {
    label: 'Sem Separador',
    description: 'Número simples sem formatação',
    value: '1.0-0|nosep',
    example: '1234'
  }
];

// Currency presets
export const CURRENCY_PRESETS: FormatPreset[] = [
  {
    label: 'Real Brasileiro (R$)',
    description: 'Moeda brasileira',
    value: 'BRL|symbol|2',
    example: 'R$ 1.234,56'
  },
  {
    label: 'Dólar Americano (US$)',
    description: 'Moeda americana',
    value: 'USD|symbol|2',
    example: 'US$ 1,234.56'
  },
  {
    label: 'Euro (€)',
    description: 'Moeda europeia',
    value: 'EUR|symbol|2',
    example: '€ 1.234,56'
  },
  {
    label: 'Apenas Código',
    description: 'Mostrar apenas código da moeda',
    value: 'BRL|code|2',
    example: '1.234,56 BRL'
  }
];

// Percentage presets
export const PERCENTAGE_PRESETS: FormatPreset[] = [
  {
    label: 'Percentual Simples',
    description: 'Sem casas decimais',
    value: '1.0-0',
    example: '12%'
  },
  {
    label: '1 Casa Decimal',
    description: 'Uma casa decimal',
    value: '1.1-1',
    example: '12,3%'
  },
  {
    label: '2 Casas Decimais',
    description: 'Duas casas decimais',
    value: '1.2-2',
    example: '12,34%'
  }
];

// String transform presets
export const STRING_PRESETS: FormatPreset[] = [
  {
    label: 'Normal',
    description: 'Sem transformação',
    value: 'none',
    example: 'Texto Normal'
  },
  {
    label: 'MAIÚSCULAS',
    description: 'Todas em maiúsculas',
    value: 'uppercase',
    example: 'TEXTO NORMAL'
  },
  {
    label: 'minúsculas',
    description: 'Todas em minúsculas',
    value: 'lowercase',
    example: 'texto normal'
  },
  {
    label: 'Capitalizar',
    description: 'Primeira letra de cada palavra',
    value: 'titlecase',
    example: 'Texto Normal'
  },
  {
    label: 'Primeira Maiúscula',
    description: 'Apenas a primeira letra',
    value: 'capitalize',
    example: 'Texto normal'
  }
];

// Boolean display presets
export const BOOLEAN_PRESETS: FormatPreset[] = [
  {
    label: 'Verdadeiro / Falso',
    description: 'Exibição padrão',
    value: 'true-false',
    example: 'Verdadeiro / Falso'
  },
  {
    label: 'Sim / Não',
    description: 'Formato pergunta',
    value: 'yes-no',
    example: 'Sim / Não'
  },
  {
    label: 'Ativo / Inativo',
    description: 'Formato status',
    value: 'active-inactive',
    example: 'Ativo / Inativo'
  },
  {
    label: 'Ligado / Desligado',
    description: 'Formato switch',
    value: 'on-off',
    example: 'Ligado / Desligado'
  },
  {
    label: 'Habilitado / Desabilitado',
    description: 'Formato permissão',
    value: 'enabled-disabled',
    example: 'Habilitado / Desabilitado'
  }
];