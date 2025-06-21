export const NumericFormat = {
  INTEGER: 'integer',
  DECIMAL: 'decimal',
  CURRENCY: 'currency',
  SCIENTIFIC: 'scientific',
  TIME: 'time',
  DATE: 'date',
  DATE_TIME: 'date-time',
  DURATION: 'duration',
  NUMBER: 'number',
  FRACTION: 'fraction',
  PERCENT: 'percent',
} as const;

export type NumericFormat = typeof NumericFormat[keyof typeof NumericFormat];
