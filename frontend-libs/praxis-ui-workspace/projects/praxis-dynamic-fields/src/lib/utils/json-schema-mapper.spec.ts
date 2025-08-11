import {
  mapPropertyToFieldMetadata,
  JsonSchemaProperty,
} from './json-schema-mapper';
import { FieldControlType } from '@praxis/core';

describe('json-schema-mapper', () => {
  it('maps multiSelectTree options to nodes', () => {
    const property: JsonSchemaProperty = {
      type: 'array',
      'x-ui': {
        controlType: 'multiSelectTree',
        options: [
          {
            label: 'Ops',
            value: 'ops',
            children: [{ label: 'HR', value: 'hr' }],
          },
          { label: 'Sales', value: 'sales' },
        ],
      },
    };

    const meta = mapPropertyToFieldMetadata('departments', property);
    expect(meta?.controlType).toBe(FieldControlType.MULTI_SELECT_TREE);
    expect((meta as any).nodes?.length).toBe(2);
    expect((meta as any).nodes[0].children?.[0].label).toBe('HR');
    expect((meta as any).options).toBeUndefined();
  });

  it('respects custom display and value fields in tree options', () => {
    const property: JsonSchemaProperty = {
      type: 'array',
      'x-ui': {
        controlType: 'multiSelectTree',
        displayField: 'name',
        valueField: 'id',
        options: [
          {
            name: 'Operations',
            id: 1,
            children: [{ name: 'HR', id: 2 }],
          },
        ],
      },
    };

    const meta = mapPropertyToFieldMetadata('departments', property);
    const nodes = (meta as any).nodes;
    expect(nodes[0].label).toBe('Operations');
    expect(nodes[0].children[0].value).toBe(2);
  });

  it('returns empty nodes when options are invalid', () => {
    const property: JsonSchemaProperty = {
      type: 'array',
      'x-ui': {
        controlType: 'multiSelectTree',
        options: null as any,
      },
    };

    const meta = mapPropertyToFieldMetadata('departments', property);
    expect((meta as any).nodes).toEqual([]);
  });
});
