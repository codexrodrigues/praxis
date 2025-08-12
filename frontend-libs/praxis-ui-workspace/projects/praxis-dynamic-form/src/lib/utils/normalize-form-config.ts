import { FormConfig, createDefaultFormConfig } from '@praxis/core';

/**
 * Deep clone and normalize a form configuration ensuring required collections
 * are always present to avoid unintended mutations.
 */
export function normalizeFormConfig(config?: FormConfig): FormConfig {
  const cloned = config ? structuredClone(config) : createDefaultFormConfig();
  return {
    ...createDefaultFormConfig(),
    ...cloned,
    sections: cloned.sections ?? [],
    fieldMetadata: cloned.fieldMetadata ?? [],
  };
}
