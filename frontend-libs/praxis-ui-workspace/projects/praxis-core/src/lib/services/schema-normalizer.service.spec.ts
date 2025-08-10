import { SchemaNormalizerService } from './schema-normalizer.service';

describe('SchemaNormalizerService', () => {
  let service: SchemaNormalizerService;

  beforeEach(() => {
    service = new SchemaNormalizerService();
  });

  it('should map UI select properties from schema', () => {
    const schema = {
      properties: {
        dept: {
          type: 'string',
          'x-ui': {
            endpoint: '/api/dept',
            valueField: 'id',
            displayField: 'name',
            multiple: true,
            emptyOptionText: 'None',
          },
        },
      },
    };

    const [field] = service.normalizeSchema(schema);
    expect(field.endpoint).toBe('/api/dept');
    expect(field.valueField).toBe('id');
    expect(field.displayField).toBe('name');
    expect(field.multiple).toBeTrue();
    expect(field.emptyOptionText).toBe('None');
  });
});
