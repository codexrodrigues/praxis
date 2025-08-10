import { FieldDefinition } from '../models/field-definition.model';
import {
  FieldMetadata,
  ValidatorOptions,
} from '../models/component-metadata.interface';
import { FieldControlType } from '../metadata/field-control-type.constants';

/**
 * Convert a `FieldDefinition` coming from the backend schema into
 * `FieldMetadata` used by the dynamic field loader.
 */
export function mapFieldDefinitionToMetadata(
  field: FieldDefinition,
): FieldMetadata {
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
    'resourcePath',
    'multiple',
    'searchable',
    'selectAll',
    'maxSelections',
    'emptyOptionText',
  ];

  for (const prop of simpleProps) {
    const value = field[prop];
    if (value !== undefined) {
      (metadata as any)[prop] = value;
    }
  }

  if (field.numericMin !== undefined) {
    (metadata as any).min = field.numericMin;
  }
  if (field.numericMax !== undefined) {
    (metadata as any).max = field.numericMax;
  }
  if (field.numericStep !== undefined) {
    (metadata as any).step = field.numericStep;
  }

  // AutoComplete fields are always searchable
  if (field.controlType === FieldControlType.AUTO_COMPLETE) {
    metadata.searchable = true;
  }

  if (field.displayField) {
    (metadata as any).optionLabelKey = field.displayField;
  }

  if (field.valueField) {
    (metadata as any).optionValueKey = field.valueField;
  }

  if ((field as any).filter) {
    (metadata as any).filterCriteria = (field as any).filter;
  }

  if (field.required !== undefined) {
    metadata.required = field.required;
  }

  if (field.hint || field.helpText) {
    metadata.hint = field.hint ?? field.helpText;
  }

  if (field.options) {
    const mapped = field.options.map((opt) => ({
      value: opt.key,
      text: opt.value,
    }));
    (metadata as any).options = mapped;
    (metadata as any).selectOptions = mapped;
  }

  const validators: ValidatorOptions = {};
  const validatorProps: Array<keyof FieldDefinition & keyof ValidatorOptions> =
    ['required', 'minLength', 'maxLength', 'min', 'max', 'pattern'];

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
export function mapFieldDefinitionsToMetadata(
  fields: FieldDefinition[],
): FieldMetadata[] {
  return fields.map(mapFieldDefinitionToMetadata);
}
