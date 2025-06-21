/**
 * Enum que define os tipos de dados (`TYPE`) disponíveis para configuração dos campos de formulário.
 */
export const FieldDataType = {
  TEXT: 'text',
  NUMBER: 'number',
  EMAIL: 'email',
  DATE: 'date',
  PASSWORD: 'password',
  FILE: 'file',
  URL: 'url',
  BOOLEAN: 'boolean',
  JSON: 'json',
} as const;

export type FieldDataType = typeof FieldDataType[keyof typeof FieldDataType];
