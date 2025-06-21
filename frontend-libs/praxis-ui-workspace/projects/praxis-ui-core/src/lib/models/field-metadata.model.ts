export interface FieldMetadata {
  name: string;
  label?: string;
  type?: string;
  controlType?: string;
  order?: number;
  [key: string]: any;
}
