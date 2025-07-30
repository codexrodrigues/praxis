import { FieldDefinition } from '../models/field-definition.model';
import { FieldMetadata, ValidatorOptions } from '../models/component-metadata.interface';

/**
 * Convert a `FieldDefinition` coming from the backend schema into
 * `FieldMetadata` used by the dynamic field loader.
 */
export function mapFieldDefinitionToMetadata(field: FieldDefinition): FieldMetadata {
  const metadata: FieldMetadata = {
    name: field.name,
    label: field.label ?? field.name,
    controlType: field.controlType as any,
  } as FieldMetadata;

  if (field.type) {
    metadata.dataType = field.type as any;
  }

  const simpleProps: Array<keyof FieldDefinition & keyof FieldMetadata> = [
    'order',
    'group',
    'description',
    'placeholder',
    'defaultValue',
    'width',
    'isFlex',
    'disabled',
    'readOnly',
    'hidden',
    'unique',
    'mask',
    'inlineEditing',
    'endpoint',
    'valueField',
    'displayField',
  ];

  for (const prop of simpleProps) {
    const value = field[prop];
    if (value !== undefined) {
      (metadata as any)[prop] = value;
    }
  }

  if (field.required !== undefined) {
    metadata.required = field.required;
  }

  if (field.hint || field.helpText) {
    metadata.hint = field.hint ?? field.helpText;
  }

  if (field.options) {
    metadata.options = field.options.map(opt => ({
      value: opt.key,
      text: opt.value,
    }));
  }

  const validators: ValidatorOptions = {};
  const validatorProps: Array<keyof FieldDefinition & keyof ValidatorOptions> = [
    'required',
    'minLength',
    'maxLength',
    'min',
    'max',
    'pattern',
  ];

  for (const prop of validatorProps) {
    const value = field[prop];
    if (value !== undefined) {
      (validators as any)[prop] = value;
    }
  }

  if (Object.keys(validators).length) {
    metadata.validators = validators;
  }

  return metadata;
}

/**
 * Convenience function to map an array of definitions.
 */
export function mapFieldDefinitionsToMetadata(fields: FieldDefinition[]): FieldMetadata[] {
  return fields.map(mapFieldDefinitionToMetadata);
}
