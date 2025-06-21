/** Propriedades da extensão x-ui das operations. */
export const OperationProperties = {
  RESPONSE_SCHEMA: 'responseSchema',
  DISPLAY_FIELDS: 'displayFields',
  DISPLAY_COLUMNS: 'displayColumns',
  FILTER_FIELDS: 'filterFields',
  RELATED_ENTITIES_ENDPOINTS: 'relatedEntitiesEndpoints',
} as const;

export type OperationProperties = typeof OperationProperties[keyof typeof OperationProperties];
