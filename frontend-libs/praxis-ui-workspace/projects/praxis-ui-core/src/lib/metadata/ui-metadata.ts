export interface UiFieldMetadata {
  name: string;
  label: string;
  type: string;
}

export interface UiFormMetadata {
  fields: UiFieldMetadata[];
}

export interface UiGridMetadata {
  columns: UiFieldMetadata[];
}
