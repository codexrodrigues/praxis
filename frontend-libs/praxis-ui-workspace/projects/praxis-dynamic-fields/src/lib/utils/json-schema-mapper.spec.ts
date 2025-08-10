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
    expect((meta as any).options).toBeUndefined();
  });
});
