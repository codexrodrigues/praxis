import { inject, Injectable, InjectionToken } from '@angular/core';
import { OVERLAY_DECISION_MATRIX } from '../tokens/overlay-decision-matrix.token';
import {
  OverlayDecision,
  OverlayDecisionContext,
  OverlayDecisionMatrix,
  OverlayPattern,
  OverlayRule,
  OverlayRuleMatch,
} from '../models/overlay-decision.model';

export const OVERLAY_DECIDER_DEBUG = new InjectionToken<boolean>(
  'OVERLAY_DECIDER_DEBUG',
  {
    providedIn: 'root',
    factory: () => false,
  },
);

@Injectable({ providedIn: 'root' })
export class OverlayDeciderService {
  private readonly matrix: OverlayDecisionMatrix = inject(
    OVERLAY_DECISION_MATRIX,
  );
  private readonly debug: boolean = inject(OVERLAY_DECIDER_DEBUG);
  decide(ctx: OverlayDecisionContext): OverlayDecision {
    const decision = this.evaluate(ctx);
    this.log(ctx, decision);
    return decision;
  }

  explain(ctx: OverlayDecisionContext): string {
    return this.evaluate(ctx).reason ?? '';
  }

  private evaluate(ctx: OverlayDecisionContext): OverlayDecision {
    for (const rule of this.matrix.rules_ordered as OverlayRule[]) {
      if (this.matches(ctx, rule.match)) {
        return {
          pattern: rule.use.pattern as OverlayPattern,
          config: rule.use.config,
          reason: rule.use.reason,
        };
      }
    }
    return {
      pattern: this.matrix.fallback.pattern as OverlayPattern,
      config: this.matrix.fallback.config,
      reason: this.matrix.fallback.reason,
    };
  }

  private matches(
    ctx: OverlayDecisionContext,
    match: OverlayRuleMatch,
  ): boolean {
    if (match.device && !match.device.includes(ctx.device)) {
      return false;
    }
    if (match.fieldCount) {
      if (
        match.fieldCount.min !== undefined &&
        ctx.fieldCount < match.fieldCount.min
      ) {
        return false;
      }
      if (
        match.fieldCount.max !== undefined &&
        ctx.fieldCount > match.fieldCount.max
      ) {
        return false;
      }
    }
    if (match.dependencyCount) {
      if (
        match.dependencyCount.min !== undefined &&
        ctx.dependencyCount < match.dependencyCount.min
      ) {
        return false;
      }
      if (
        match.dependencyCount.max !== undefined &&
        ctx.dependencyCount > match.dependencyCount.max
      ) {
        return false;
      }
    }
    if (Array.isArray(match.any)) {
      return match.any.some((sub) => this.matches(ctx, sub));
    }
    return true;
  }

  private log(ctx: OverlayDecisionContext, decision: OverlayDecision): void {
    if (this.debug) {
      console.debug('Overlay decision', {
        device: ctx.device,
        fieldCount: ctx.fieldCount,
        dependencyCount: ctx.dependencyCount,
        pattern: decision.pattern,
      });
    }
  }
}
