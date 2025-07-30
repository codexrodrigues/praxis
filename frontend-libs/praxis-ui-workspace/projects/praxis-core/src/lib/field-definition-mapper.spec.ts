import { mapFieldDefinitionToMetadata, mapFieldDefinitionsToMetadata } from './helpers/field-definition-mapper';
import { FieldDefinition } from './models/field-definition.model';
import { FieldMetadata } from './models/component-metadata.interface';

describe('FieldDefinition to FieldMetadata mapper', () => {
  it('should map basic properties', () => {
    const def: FieldDefinition = {
      name: 'firstName',
      label: 'First Name',
      type: 'string',
      controlType: 'input',
      required: true,
      defaultValue: 'John',
      hint: 'Your given name',
      order: 2
    };

    const meta = mapFieldDefinitionToMetadata(def);

    const expected: FieldMetadata = {
      name: 'firstName',
      label: 'First Name',
      controlType: 'input',
      dataType: 'string',
      required: true,
      defaultValue: 'John',
      hint: 'Your given name',
      order: 2
    } as any;

    expect(meta).toEqual(jasmine.objectContaining(expected));
  });

  it('should map validators and options', () => {
    const def: FieldDefinition = {
      name: 'age',
      label: 'Age',
      type: 'number',
      controlType: 'input',
      min: 18,
      max: 60,
      options: [{ key: '18', value: '18' }]
    };

    const meta = mapFieldDefinitionToMetadata(def);

    expect(meta.validators).toEqual(jasmine.objectContaining({ min: 18, max: 60 }));
    expect(meta.options?.length).toBe(1);
  });

  it('should map arrays', () => {
    const defs: FieldDefinition[] = [
      { name: 'a', controlType: 'input' },
      { name: 'b', controlType: 'input' }
    ];
    const metas = mapFieldDefinitionsToMetadata(defs);
    expect(metas.length).toBe(2);
    expect(metas[0].name).toBe('a');
    expect(metas[1].name).toBe('b');
  });
});
