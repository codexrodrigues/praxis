import {
  mapFieldDefinitionToMetadata,
  mapFieldDefinitionsToMetadata,
} from './helpers/field-definition-mapper';
import { FieldDefinition } from './models/field-definition.model';
import { FieldMetadata } from './models/component-metadata.interface';
import { FieldControlType } from './metadata/field-control-type.constants';

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
      order: 2,
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
      order: 2,
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
      options: [{ key: '18', value: '18' }],
    };

    const meta = mapFieldDefinitionToMetadata(def);

    expect(meta.validators).toEqual(
      jasmine.objectContaining({ min: 18, max: 60 }),
    );
    expect(meta.options?.length).toBe(1);
  });

  it('should map numeric range properties', () => {
    const def: FieldDefinition = {
      name: 'price',
      controlType: FieldControlType.RANGE_SLIDER,
      numericMin: 10,
      numericMax: 100,
      numericStep: 5,
    } as any;

    const meta = mapFieldDefinitionToMetadata(def) as any;

    expect(meta.min).toBe(10);
    expect(meta.max).toBe(100);
    expect(meta.step).toBe(5);
  });

  it('should map arrays', () => {
    const defs: FieldDefinition[] = [
      { name: 'a', controlType: 'input' },
      { name: 'b', controlType: 'input' },
    ];
    const metas = mapFieldDefinitionsToMetadata(defs);
    expect(metas.length).toBe(2);
    expect(metas[0].name).toBe('a');
    expect(metas[1].name).toBe('b');
  });

  it('should map select specific properties', () => {
    const def: FieldDefinition = {
      name: 'status',
      label: 'Status',
      controlType: 'select',
      endpoint: '/api/status',
      valueField: 'id',
      displayField: 'name',
      multiple: true,
      searchable: true,
      selectAll: true,
      maxSelections: 5,
      filter: { active: true },
      options: [{ key: '1', value: 'Open' }],
    } as any;

    const meta = mapFieldDefinitionToMetadata(def);

    expect(meta.endpoint).toBe('/api/status');
    expect(meta.multiple).toBeTrue();
    expect(meta.searchable).toBeTrue();
    expect(meta.selectAll).toBeTrue();
    expect(meta.maxSelections).toBe(5);
    expect(meta.optionLabelKey).toBe('name');
    expect(meta.optionValueKey).toBe('id');
    expect(meta.filterCriteria).toEqual({ active: true });
    expect(meta.selectOptions?.[0]).toEqual({ value: '1', text: 'Open' });
  });

  it('should force searchable true for autoComplete control type', () => {
    const def: FieldDefinition = {
      name: 'city',
      controlType: FieldControlType.AUTO_COMPLETE,
    } as any;

    const meta = mapFieldDefinitionToMetadata(def);

    expect(meta.searchable).toBeTrue();
  });
});
