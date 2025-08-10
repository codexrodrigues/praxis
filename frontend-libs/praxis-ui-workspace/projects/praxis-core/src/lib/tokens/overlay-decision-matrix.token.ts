import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { OverlayDecisionMatrix } from '../models/overlay-decision.model';
import defaultMatrix from '../config/overlay-decision-matrix.json';

export const OVERLAY_DECISION_MATRIX =
  new InjectionToken<OverlayDecisionMatrix>('OVERLAY_DECISION_MATRIX');

export function provideOverlayDecisionMatrix(
  matrix?: OverlayDecisionMatrix,
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: OVERLAY_DECISION_MATRIX,
      useValue: matrix ?? (defaultMatrix as OverlayDecisionMatrix),
    },
  ]);
}
