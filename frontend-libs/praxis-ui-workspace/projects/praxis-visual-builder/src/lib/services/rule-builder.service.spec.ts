import { RuleBuilderService } from './rule-builder.service';

describe('RuleBuilderService', () => {
  let service: RuleBuilderService;

  beforeEach(() => {
    service = new RuleBuilderService({} as any, {} as any);
  });

  it('should ignore empty JSON content when importing', () => {
    const initialRootNodes = service.getCurrentState().rootNodes.length;
    expect(() => service.import('{}', { format: 'json' })).not.toThrow();
    expect(service.getCurrentState().rootNodes.length).toBe(initialRootNodes);
  });

  it('should ignore empty DSL content when importing', () => {
    const initialRootNodes = service.getCurrentState().rootNodes.length;
    expect(() => service.import('   ', { format: 'dsl' })).not.toThrow();
    expect(service.getCurrentState().rootNodes.length).toBe(initialRootNodes);
  });

  it('should throw when importing invalid specification JSON', () => {
    expect(() =>
      service.import('{"invalid": true}', { format: 'json' }),
    ).toThrow();
  });

  it('should throw when importing invalid DSL', () => {
    expect(() => service.import('invalid', { format: 'dsl' })).toThrow();
  });
});
