import { TestBed } from '@angular/core/testing';
import { OverlayDeciderService } from './overlay-decider.service';
import { OVERLAY_DECISION_MATRIX } from '../tokens/overlay-decision-matrix.token';
import matrix from '../config/overlay-decision-matrix.json';
import { OverlayDecisionContext } from '../models/overlay-decision.model';

describe('OverlayDeciderService', () => {
  let service: OverlayDeciderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OverlayDeciderService,
        { provide: OVERLAY_DECISION_MATRIX, useValue: matrix },
      ],
    });
    service = TestBed.inject(OverlayDeciderService);
  });

  const decide = (ctx: OverlayDecisionContext) => service.decide(ctx).pattern;

  it('should respect field count boundaries', () => {
    expect(
      decide({ device: 'mobile', fieldCount: 12, dependencyCount: 0 }),
    ).toBe('full-screen-dialog');
    expect(
      decide({ device: 'mobile', fieldCount: 13, dependencyCount: 0 }),
    ).toBe('page');
    expect(
      decide({ device: 'tablet', fieldCount: 12, dependencyCount: 0 }),
    ).toBe('modal');
    expect(
      decide({ device: 'tablet', fieldCount: 13, dependencyCount: 0 }),
    ).toBe('drawer');
    expect(
      decide({ device: 'desktop', fieldCount: 12, dependencyCount: 0 }),
    ).toBe('modal');
    expect(
      decide({ device: 'desktop', fieldCount: 13, dependencyCount: 0 }),
    ).toBe('drawer');
  });

  it('should respect large field count boundaries', () => {
    expect(
      decide({ device: 'tablet', fieldCount: 24, dependencyCount: 0 }),
    ).toBe('drawer');
    expect(
      decide({ device: 'tablet', fieldCount: 25, dependencyCount: 0 }),
    ).toBe('page');
    expect(
      decide({ device: 'desktop', fieldCount: 24, dependencyCount: 0 }),
    ).toBe('drawer');
    expect(
      decide({ device: 'desktop', fieldCount: 25, dependencyCount: 0 }),
    ).toBe('page');
  });

  it('should respect dependency count boundaries', () => {
    expect(
      decide({ device: 'mobile', fieldCount: 5, dependencyCount: 3 }),
    ).toBe('full-screen-dialog');
    expect(
      decide({ device: 'mobile', fieldCount: 5, dependencyCount: 4 }),
    ).toBe('modal');
    expect(
      service.decide({ device: 'tablet', fieldCount: 10, dependencyCount: 3 })
        .reason,
    ).toContain('Tablet');
    expect(
      service.decide({ device: 'tablet', fieldCount: 10, dependencyCount: 4 })
        .reason,
    ).toContain('Padrão seguro');
    expect(
      service.decide({ device: 'desktop', fieldCount: 10, dependencyCount: 3 })
        .reason,
    ).toContain('Casos simples');
    expect(
      service.decide({ device: 'desktop', fieldCount: 10, dependencyCount: 4 })
        .reason,
    ).toContain('Padrão seguro');
  });

  it('should respect high dependency boundaries', () => {
    expect(
      decide({ device: 'tablet', fieldCount: 20, dependencyCount: 7 }),
    ).toBe('drawer');
    expect(
      decide({ device: 'tablet', fieldCount: 20, dependencyCount: 8 }),
    ).toBe('modal');
    expect(
      decide({ device: 'desktop', fieldCount: 20, dependencyCount: 7 }),
    ).toBe('drawer');
    expect(
      decide({ device: 'desktop', fieldCount: 20, dependencyCount: 8 }),
    ).toBe('page');
  });

  it('should explain decisions', () => {
    const ctx: OverlayDecisionContext = {
      device: 'mobile',
      fieldCount: 2,
      dependencyCount: 0,
    };
    const reason = service.explain(ctx);
    expect(reason).toContain('Formulários curtíssimos');
  });
});
