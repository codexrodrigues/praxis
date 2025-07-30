export interface FormColumn {
  fields: string[];
}

export interface FormRow {
  columns: FormColumn[];
}

export interface FormSection {
  id: string;
  title?: string;
  description?: string;
  rows: FormRow[];
}

export interface FormConfig {
  sections: FormSection[];
}

export interface FormConfigState {
  config: FormConfig;
  isLoading: boolean;
  error?: string;
}

export function createDefaultFormConfig(): FormConfig {
  return { sections: [] };
}

export function isValidFormConfig(config: any): config is FormConfig {
  return config && typeof config === 'object' && Array.isArray(config.sections);
}
